import {PatientModel, PractitionerModel, OrganizationModel} from '../models/index.js';
import mongoose from "mongoose";
import {ConsultationModel} from "../models/index";


class TestDataCreator {

  // can only be run once if using hardcoded ids
  static createTestData() {
    const orgId1 = mongoose.Types.ObjectId('578df3efb618f5141202a191');
    const orgId2 = mongoose.Types.ObjectId('678df3efb618f5141202a191');
    const practId1 = mongoose.Types.ObjectId('a78df3efb618f5141202a191');
    const practId2 = mongoose.Types.ObjectId('b78df3efb618f5141202a191');
    const practId3 = mongoose.Types.ObjectId('c78df3efb618f5141202a191');
    // this.createOrg(orgId1, 'ORG1');
    // this.createOrg(orgId2, 'ORG2');
    // this.createPractitioner(practId1,'pract1', orgId1, Roles.Nurse);
    // this.createPractitioner(practId2,'pract2', orgId1, Roles.MedicalOfficer);
    // this.createPractitioner(practId3,'pract3', orgId2, Roles.ClinicalOfficer);
    const patientId1 = mongoose.Types.ObjectId('d78df3efb618f5141202a191');
    const patientId2 = mongoose.Types.ObjectId('e78df3efb618f5141202a191');
    const patientId3 = mongoose.Types.ObjectId('aa8df3efb618f5141202a191');
    
    // this.createPatient(patientId1, 'Sam W', 'whatsapp:+254727347491');
    // this.createPatient(patientId2, 'Sam Y', 'whatsapp:+16479187445');
    // this.createPatient(patientId3, 'Lily', 'whatsapp:+14384087655');
    const consId = mongoose.Types.ObjectId('678df3efb618f5141202a19c');
    this.createConsultation(consId, '5ea4f799b318f803a13eb334', null, orgId2, true);
  }

  static getPatientFromId(req, res, next) {
      try {
        const patientId = req.body.id;
        PatientModel.findById(patientId,
            function (err, patient) {
              if (err) return console.log(`ERROR :(((: ${err}`);
              if (patient == null) return res.status(200).send(`NOT FOUND :(`);
              return res.status(200).send(patient);
            })
      } catch (error) {
        return next(error);
      }
  }

  static createPatient(id, firstName, phone_number, orgId ){
    console.log("Creating patient with name " + firstName + " and phone number " + phone_number)
    const patient = PatientModel({
      _id: id,
      name: {
        first_name : firstName,
        last_name : 'Patient'
      },
      phone_number: phone_number,
      organization: orgId
    })
    this.defaultDocSave(patient)
  }

  static createOrg(id, name){
    const org = OrganizationModel({
      _id : id,
      name : name,
      phone_number : '456',
      location: null
    })
    this.defaultDocSave(org)
  }

  static createPractitioner(id, firstName, orgId, role){
    const practitioner = PractitionerModel({
      _id : id,
      name : {
        first_name : firstName,
        last_name : 'Med',
        prefix : ''
      },
      organization : orgId,
      phone_number : '123',
      role : role
    })
    this.defaultDocSave(practitioner)
  }

  static createConsultation(id, patientId, practId, orgId, active) {
    const consultation = ConsultationModel({
      practitioner : practId,
      organization : orgId, //Somewhat breaking SSoT here, but it's going to be very expensive to query for all messages for an organization if we don't include
      patient : patientId,
      active : active,
      messages : []
    })
    this.defaultDocSave(consultation)
  }

  static defaultDocSave(document) {
    document.save((err) => {
      if (err) throw err;
      console.log(`SAVE SUCCESSFUL, id: ${document.id}`)
    });
  }
}

export default TestDataCreator;
