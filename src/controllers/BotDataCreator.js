import mongoose from "mongoose";
import {ResponseModel, BotMessageModel, BotMessageTypes, OrganizationChoices} from "../models/bot.js";
import TestDataCreator from "./TestDataCreator";

class BotDataCreator {

  // can only be run once if using hardcoded ids
  // info inquired:  consent to continue, first/last name, location, org choice, problems
  static createBotData() {
    const botConsentId = mongoose.Types.ObjectId('ccccc3efb618f5141202a191');
    const botRefusedId = mongoose.Types.ObjectId('cacacaefb618f5141202a191');
    const botFNameId = mongoose.Types.ObjectId('aaaaa3efb618f5141202a191');
    const botLNameId = mongoose.Types.ObjectId('aa2aa3efb618f5141202a191');
    const botLocationId = mongoose.Types.ObjectId('bbbbb3efb618f5141202a191');
    const botOrgId = mongoose.Types.ObjectId('ddddd3efb618f5141202a191');
    const botProblemId = mongoose.Types.ObjectId('fffff3efb618f5141202a191');
    const botNotFoundId = mongoose.Types.ObjectId('fffffffffff8f5141202a191');

    const rConsentYesId = mongoose.Types.ObjectId('ecccc3efb618f5141202a191');
    const rConsentNoId = mongoose.Types.ObjectId('eeccc3efb618f5141202a191');
    const rFNameId = mongoose.Types.ObjectId('eaaaa3efb618f5141202a191');
    const rLNameId = mongoose.Types.ObjectId('ea2aa3efb618f5141202a191');
    const rLocationId = mongoose.Types.ObjectId('ebbbb3efb618f5141202a191');
    const rOrgId = mongoose.Types.ObjectId('edddd3efb618f5141202a191');
    const rProblemId = mongoose.Types.ObjectId('effff3efb618f5141202a191');

    const orgIds = this.getHardCodedOrgIds();
    const org1Id = mongoose.Types.ObjectId(orgIds[0]);
    const org2Id = mongoose.Types.ObjectId(orgIds[1]);
    const org3Id = mongoose.Types.ObjectId(orgIds[2]);

    // consent
    const rConsentYesChoices = ['Yes', 'Y', '1'];
    const rConsentNoChoices = ['No', 'N', '2'];
    const rConsentYes = this.createPatientResponse(rConsentYesId, rConsentYesChoices, botFNameId);
    const rConsentNo = this.createPatientResponse(rConsentNoId, rConsentNoChoices, botRefusedId);
    this.createBotMessage(botConsentId,
        'Welcome to Mbali Health! We put you in touch with local care providers ' +
        'so you can speak to a medical professional without ever leaving your home! Continue?' +
        "\nPlease reply with :\n" +
        `    - ${BotDataCreator.getChoicesStr(rConsentYesChoices)} if you would like to continue \n` +
        `    - ${BotDataCreator.getChoicesStr(rConsentNoChoices)} if you do not`,
    [rConsentYes, rConsentNo], BotMessageTypes.Start);
    //todo null response = end of bot flow;
    this.createBotMessage(botRefusedId,'Boo, so sad to see you go :(.', null);

    // name
    const rFName = this.createPatientResponse(rFNameId, [], botLNameId); //[]  = free form
    this.createBotMessage(botFNameId,'Please tell us your first name.',[rFName], BotMessageTypes.FirstName);
    const rLName = this.createPatientResponse(rLNameId, [], botLocationId);
    this.createBotMessage(botLNameId,'Please tell us your last name.',[rLName], BotMessageTypes.LastName);

    // location
    const rLocation = this.createPatientResponse(rLocationId, [], botOrgId); // not really free form, need to later implement validation
    //todo include instructions
    this.createBotMessage(botLocationId,'Please share your location with us.',[rLocation]);

    // org
    // these will be the 3 proposed before getting the clinic search implemented
    TestDataCreator.createOrg(org1Id, 'Ugali Clinic');
    TestDataCreator.createOrg(org2Id, 'Samaki Clinic');
    TestDataCreator.createOrg(org3Id, 'Kachumbari Clinic');
    const rOrg = this.createPatientResponse(rOrgId, [], botProblemId); // todo need caching :(
    this.createBotMessage(botOrgId,'We found some clinics near you. Please choose one to receive care. Respond with the number associated with your preferred clinic.',
        [rOrg], BotMessageTypes.OrganizationChoice);

    // problem
    // const rProblem = this.createPatientResponse(rProblemId, [], null); // not really free form, need to later implement validation
    //todo include instructions
    this.createBotMessage(botProblemId,'Please share your concerns or symptoms with us. A practitioner will soon be reaching out.',
        null);

    // response not in choices => respond with this but don't update patient "bookmark"
    this.createBotMessage(botNotFoundId,'Sorry, please try again.',[], BotDataCreator.ResponseNotFound); // [] responses = special for invalid response message
  }

  static getHardCodedOrgIds() {
    return ['ddddd1ddd618f5141202a191', 'ddddd2ddd618f5141202a191', 'ddddd3ddd618f5141202a191']
  }

  static createPatientResponse(id, values, pointsToId){
    return ResponseModel({
      _id: id,
      values: values,
      description: '', // skipping for now
      points_to: pointsToId
    })
  }

  static createBotMessage(id, text, responses, messageType){
    const message = BotMessageModel({
      _id: id,
      text: text,
      description: '', // skipping for now
      validation:[], // skipping for now
      responses: responses,
      message_type: messageType ? messageType : BotMessageTypes.Normal

    })
    return message.save();
  }

  static getChoicesStr(choices) {
    let str = choices.join("', '");
    return `'${str}'`
  }


}

export default BotDataCreator;
