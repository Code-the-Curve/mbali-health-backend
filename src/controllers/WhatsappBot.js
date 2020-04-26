import dotenv from 'dotenv';
import twilio from 'twilio';
import Api from './Api'
import Registration from './Registration'
import PatientsController from './PatientsController'
import {OrganizationModel, PatientModel, ConsultationModel} from '../models/index';
import {BotFlowProgressModel, BotMessageModel, BotMessageTypes} from "../models/bot";
import BotDataCreator from "./BotDataCreator";
import mongoose from "mongoose";

dotenv.config();

const twilioClient = twilio(process.env.SID, process.env.TOKEN);
const {MessagingResponse} = twilio.twiml;
const chatEndedFlag = 'chat_ended';

class WhatsappBot {

  static incomingMessage(req, res, next) {
    const content = req.body.Body;
    const fromPhoneNumber = req.body.From
    console.log(`BODY!!!! ${req.body.Body}`)
    let patient_;
    PatientModel.findOne({
      phone_number: fromPhoneNumber
    }).then((patient) => {
        if (!patient) {
          console.log("Creating patient with phone number " + fromPhoneNumber)
          return PatientsController.createPatient(fromPhoneNumber)
        }
        return patient
    }).then(patient => {
        console.log(patient)
        patient_ = patient
        return Registration.findActiveConsultation(patient._id)
    }).then(consultation => {
        console.log(consultation)
        if (consultation) {
          return WhatsappBot.sendToConsultation()// assume it returns message
        } else {
          return WhatsappBot.sendToBot(patient_, content) //WhatsappBot.test(res);//
        }
    }).then(message => {
        res.set('Content-Type', 'text/xml');
        return res.status(200).send(message);
    }).catch(error => {
      console.log("Whoops! Something went wrong");
      console.log(error);
      console.log(error.stack)

    });
  }

  /* todo flow
    - get patient bot progress -> current bot message
        - if none,
            - find from start message
            - create bot progress
            - send
        - else => current response = response to current bot message
            - check if message type is special: => special responses
                -> OrganizationChoice:
                    - check if response in index of orgs in bot progress
                        - if so save org on patient, do (****)
                        - else do (NOT FOUND)
                -> FirstName: 'first_name', save patient
                -> LastName: 'last_name', save patient
            - else ? check if message response field is null
                - if so bot flow ends, create consultation with patient id, patient org, active=true, no pract
                - else check if lowercase resp in message response texts
                    - (****) else  get next message, update bot progress
                        - check if next message type is special:
                            OrganizationChoice -> :
                                - findNearbyOrganizations with lon/lat to dummy function
                                - save ids in bot progress
                                - compose message
                        -  send next message
                - (NOT FOUND) else send NOT FOUND response, dont update bot progress
   */
    static async sendToBot(patient, patientResponse) {
        console.log("In bot flow");
        const progress = await WhatsappBot.getProgress(patient.id);
        if (!progress) {
            console.log('no progress');
            return WhatsappBot.handleStart(patient)
        }
        const currentMessage = await BotMessageModel.findById(progress.current_message);
        console.log(currentMessage.text);
        let nextMessage = await WhatsappBot.getNextMessage(currentMessage, patientResponse, patient, progress);
        if (nextMessage && nextMessage !== chatEndedFlag) {
            let nextMessageText;
            progress.current_message = nextMessage;
            if (nextMessage.message_type == BotMessageTypes.OrganizationChoice) {
                console.log('is org choosing');

                //todo implement location receiver
                const orgs = await WhatsappBot.findNearbyOrganizations(1,1);
                progress.organization_options = orgs.map(org => org.id);
                nextMessageText = orgs.reduce((str, org, idx) => str + `\n${idx} - ${org.name}`, nextMessage.text);
            } else {
                nextMessageText = nextMessage.text;
                console.log(`NEXT ${nextMessageText}`);
            }
            progress.save();
            return WhatsappBot.sendBotMessage(nextMessageText);
        }

    }
    static async commonStart() {

    }

  static async sendToConsultation() {
    console.log("Sending to consultation")
  }

  static sendMessage(req, res) {
    console.log(req.params)
    var to = req.params.to;
    var body = req.body.Body
      WhatsappBot.sendOutgoingMessage(to, body)
      .then(message => {
        console.log(message.sid)
        return Api.okWithContent(res,{ message });
      })
      .catch(error => {
        return Api.errorWithMessage(res,500, error.message);
      });

  }

  static sendOutgoingMessage(to, body) {
    console.log(body);
    return twilioClient.messages.create({
        from: 'whatsapp:+254203893148',
        body: body,
        to: to
      });
  }

  static getProgress(patientId) {
      return BotFlowProgressModel.findOne({patient: patientId})
  }

  static async handleStart(patient) {
      const startMessage = await BotMessageModel.findOne({message_type: BotMessageTypes.Start});
      return BotFlowProgressModel({
          patient: patient.id,
          current_message: startMessage.id
          //todo are nested then's legal
      }).save()
          .then(() => WhatsappBot.sendBotMessage(startMessage.text))
  }

  static async getNextMessage(currentMessage, patientResponse, patient, progress) {
    let nextMessage = await WhatsappBot.processSpecialResponses(currentMessage, patientResponse, patient, progress);
    if (!nextMessage) {
        console.log(`is normal`);
        //free form text
        if (currentMessage.responses.length == 1 && currentMessage.responses[0].values.length == 0) {
            console.log(`is free form`);
            const fullResponse = currentMessage.responses[0];
            return BotMessageModel.findById(fullResponse.points_to);
        } else { // responses = choices
            console.log(`is choices`);
            const nextMessageId = WhatsappBot.textToNextMessageId(currentMessage.responses, patientResponse);
            console.log(`normal choice next is ${nextMessageId}`);
            if (nextMessageId) {
                return BotMessageModel.findById(nextMessageId);
            } else { // response invalid
                WhatsappBot.respondWithNotFound();
                return null;
            }
        }
    }
    return nextMessage
  }

  static async processSpecialResponses(botMessage, patientResponse, patient, progress) {
    let processed = false;
    switch (botMessage.message_type) {
        case BotMessageTypes.FirstName:
          patient.first_name = patientResponse;
          patient.save();//todo: await?
          processed = true;
          break;
      case BotMessageTypes.LastName:
          patient.last_name = patientResponse;
          patient.save();
          processed = true;
          break;
      case BotMessageTypes.OrganizationChoice:
          let orgNum = +patientResponse;
          if (orgNum in [...progress.organization_options.keys()]){
              Registration.registerPatientOrg(progress.organization_options[orgNum], patient.id);
          } else{
              WhatsappBot.respondWithNotFound();
          }
          processed = true;
          break;
    }
    console.log('in special, past switch');
    const chatEnded = await WhatsappBot.handleEndOfChat(botMessage.responses, patient);
    console.log(`chat ended? ${chatEnded}`);
    if (processed && !chatEnded) {
        const pointsTo = await BotMessageModel.findById(botMessage.responses[0].points_to);
        console.log(`special points to? ${pointsTo.toString()}`);
        return pointsTo;
    } else if (chatEnded) {
        return chatEndedFlag;
    }
    return null;
  }

  static async handleEndOfChat(responses, patient) {
      console.log(`in end handle, responses? ${responses}`);
      if (!responses) { // chatbot flow is over
          ConsultationModel({
              organization : patient.organization,
              patient : patient.id,
              active : true
          }).save();
          return true;
      } else{
          return false;
      }
  }

  static textToNextMessageId(responses, responseText) {
    let p = null;
    responses.forEach(response => {
        response.values.forEach(value => {
            console.log(`${responseText.toLowerCase()} ; ${value.toString().toLowerCase()}  ; ${responseText.toLowerCase() == value.toString().toLowerCase()}`);
            if (responseText.toLowerCase() == value.toString().toLowerCase()) {
                p= response.points_to;
            }
        })
    })
    return p;
  }

  static findNearbyOrganizations(lon, lat) {
      const orgIds = BotDataCreator.getHardCodedOrgIds();
      return OrganizationModel.find().where('_id').in(orgIds).limit(10);
  }

  static respondWithNotFound() {
    return BotMessageModel.findOne({
        message_type: BotMessageTypes.ResponseNotFound
    }).then(message => {
        return WhatsappBot.sendBotMessage(message.text)
    });
  }

  static sendBotMessage(message) {
    const twiml = new MessagingResponse();
    twiml.message(message);
    return twiml.toString();
  }

  static test(res, next) {
        const twiml = new MessagingResponse();
        try {
          twiml.message(`Welcome to Mbali Health! We put you in touch with local care providers so you can speak to a medical professional without ever leaving your home! Continue?`);
          //
          res.set('Content-Type', 'text/xml');
          //
          return res.status(200).send(twiml.toString());
      } catch (error) {
          return next(error);}
  }

}

export default WhatsappBot;