import dotenv from 'dotenv';
import twilio from 'twilio';
import Api from './Api'
import Registration from './Registration'
import PatientsController from './PatientsController'
import WebsocketController from './WebsocketController'
import ConsultationController from './ConsultationController'
import {PatientModel} from '../models/index.js';

dotenv.config();

const twilioClient = twilio(process.env.SID, process.env.TOKEN);
const {MessagingResponse} = twilio.twiml;

class WhatsappBot {

  static incomingMessage(req, res, next) {
    const content = req.body.Body;
    const fromPhoneNumber = req.body.From
    console.log(req.body)
    
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
        return Registration.findActiveConsultation(patient._id)
    }).then(consultation => {
        console.log(consultation)
        if (consultation) {
          WhatsappBot.sendToConsultation(consultation, req.body)   
        } else {
          WhatsappBot.sendToBot(req, res, next)
        }
    }).catch(error => {
      console.log("Whoops! Something went wrong")
      console.log(error)
    });
  }

  static sendToBot(req, res, next) {
    console.log("Starting bot flow")
    const twiml = new MessagingResponse();
    try {
      twiml.message(`Welcome to Mbali Health! We put you in touch with local care providers so you can speak to a medical professional without ever leaving your home! Continue?`);

      res.set('Content-Type', 'text/xml');

      return res.status(200).send(twiml.toString());
    } catch (error) {
      return next(error);
    }
  }

  static sendToConsultation(consultation, whatsappMessage) {
    var message = whatsappMessage.Body
    var from = whatsappMessage.From
    var sent_ts = new Date() //TODO - replace this with whatsapp ts
    console.log("Sending message " + message + " from " + from)
    ConsultationController.saveMessage({from, message, sent_ts}, consultation._id)
    WebsocketController.sendMessageToRoom(consultation._id, 
      {consultation: consultation._id, 
        msg: {
          message,
          from,
          sent_ts
        }
      });
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
        return Api.errorWithMessage(res,{ error });
      });
    
  }

  static sendOutgoingMessage(to, body) {
    console.log(body)
    return twilioClient.messages.create({
        from: 'whatsapp:+254203893148',
        body: body,
        to: to,
      })
  }
}

export default WhatsappBot;