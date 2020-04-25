import {PatientModel, PractitionerModel, OrganizationModel, Roles} from '../models/index.js';
import mongoose from "mongoose";
import {ConsultationModel} from "../models/index";


class TestDataCreator {

  // can only be run once if using hardcoded ids
  static createTestData() {
    // const orgId1 = mongoose.Types.ObjectId('578df3efb618f5141202a191');
    // const orgId2 = mongoose.Types.ObjectId('678df3efb618f5141202a191');
    // const practId1 = mongoose.Types.ObjectId('a78df3efb618f5141202a191');
    // const practId2 = mongoose.Types.ObjectId('b78df3efb618f5141202a191');
    // const practId3 = mongoose.Types.ObjectId('c78df3efb618f5141202a191');
    // this.createOrg(orgId1, 'ORG1');
    // this.createOrg(orgId2, 'ORG2');
    // this.createPractitioner(practId1,'pract1', orgId1, Roles.Nurse);
    // this.createPractitioner(practId2,'pract2', orgId1, Roles.MedicalOfficer);
    // this.createPractitioner(practId3,'pract3', orgId2, Roles.ClinicalOfficer);
    // const patientId1 = mongoose.Types.ObjectId('d78df3efb618f5141202a191');
    // const patientId2 = mongoose.Types.ObjectId('e78df3efb618f5141202a191');
    // const patientId3 = mongoose.Types.ObjectId('aa8df3efb618f5141202a191');
    //
    // this.createPatient(patientId1, 'pd');
    // this.createPatient(patientId2, 'pe');
    // this.createPatient(patientId3, 'paa');
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
    // });
  }
  // static getPatientIdFromName(req, res, next) {
  //   try {
  //     const patientName = req.params.name;
  //       PatientModel.findOne({name: {first_name: patientName, last_name : 'Patient'}},
  //         function (err, patient) {
  //           if (err) return console.log(`ERROR :(((: ${err}`);
  //           return res.status(200).send(`patient id: ${patient.id}`);
  //         })
  //   } catch (error) {
  //     return next(error);
  //   }
  // }

  static createPatient(id, firstName, orgId){
    const patient = PatientModel({
      _id: id,
      name: {
        first_name : firstName,
        last_name : 'Patient'
      },
      phone_number: '234',
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

  static defaultDocSave(document) {
    document.save((err) => {
      if (err) throw err;
      console.log(`SAVE SUCCESSFUL, id: ${document.id}`)
    });
  }


}

export default TestDataCreator;
