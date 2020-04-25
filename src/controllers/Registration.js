// import mongoose from 'mongoose';
import {PatientModel} from '../models/index.js';
import {PractitionerModel} from '../models/index.js';
import {ConsultationModel} from '../models/index.js';

// todo do we need to connect to mongo here too like in the server?
//todo error check the input ex if patient doesnt exist

/*
API:
post to '/register_patient_org'
  body = {
    "organization": "String, org id",
    "patient": "String, patient id"
  }
post to '/deregister_patient_org'
  body = {
    "patient": "String, patient id"
  }
post to '/register_patient_practitioner'
  body = {
    "patient": "String, patient id",
    "practitioner": "String, practitioner id"

  }
post to '/deregister_patient_practitioner'
  body = {
    "patient": "String, patient id",
    "practitioner": "String, practitioner id, optional -> set if coming from practitioner/socket side"
  }
 */

class Registration {

  static registerPatientOrg(req, res, next) {
    try {
      const orgId = req.body.organization;
      const patientId = req.body.patient;
      const patient = this.findDocFromId(patientId, PatientModel);
      res.set('Content-Type', 'text/plain');
      patient.organization = orgId;
      this.defaultDocSave(patient);
      return res.status(200).send(`patient with id ${patientId} successfully updated with org id ${orgId}`);
    } catch (error) {
      return next(error);
    }
  }

  // todo right now this is "org ignorant". Do we want to check which org patient is deregistering from?
  static deregisterPatientOrg(req, res, next) {
    try {
      const patientId = req.body.patient;
      const patient = this.findDocFromId(patientId, PatientModel);
      const consultation = this.findActiveConsultation(patientId);
      res.set('Content-Type', 'text/plain');
      patient.organization = null;
      this.defaultDocSave(patient);
      if (consultation != null) {
        consultation.active = false;
        this.defaultDocSave(consultation);
        return res.status(200).send(`patient with id ${patientId} was deregistered from an org (if any) and consultation with id ${consultation.id} was set to inactive.`);
      }
      return res.status(200).send(`patient with id ${patientId} was deregistered from an org (if any)`);
    } catch (error) {
      return next(error);
    }
  }

  static registerPatientPractitioner(req, res, next) {
    try {
      const patientId = req.body.patient;
      const practitionerId = req.body.practitioner;
      const consultation = this.findActiveConsultation(patientId);
      res.set('Content-Type', 'text/plain');

      if (consultation == null) {
        const orgId = this.findOrgIdFromPractitionerId(practitionerId);
        const newConsultation = ConsultationModel({
          'practitioner' : practitionerId,
          'organization' : orgId,
          'patient' : patientId,
          'active' : true,
          'messages' : []
        });
        this.defaultDocSave(newConsultation);
        return res.status(200).send(`consultation with id ${newConsultation.id} created for patient id ${patientId}, practitioner id ${practitionerId}`);
      } else if (consultation.practitioner == null) {
        consultation.practitioner = practitionerId;
        this.defaultDocSave(consultation);
        return res.status(200).send(`consultation with id ${consultation.id} updated for patient id ${patientId}, practitioner id ${practitionerId}`);
      } else { // an active consultation exists, practitioner not null => patient already has practitioner
        return res.status(400).send(`Bad request: patient with id ${patientId} is already registered with practitioner id ${consultation.practitioner} on active consultation id ${consultation.id}. No updates were performed.`);
      }

    } catch (error) {
      return next(error);
    }
  }

//todo still a bit iffy about the difference between requests coming from the 2 sides.
// verify that patient side does not have/need practitioner id
  static deregisterPatientPractitioner(req, res, next) {
    try {
      const patientId = req.body.patient;
      //todo check what happens when accessing non existent field in body
      const practitionerId = req.body.practitioner; // optional, only set if coming from practitioner/socket side
      const consultation = this.findActiveConsultation(patientId, practitionerId);
      res.set('Content-Type', 'text/plain');

      if (consultation != null && consultation.practitioner != null) {
        consultation.active = false;
        this.defaultDocSave(consultation);
        return res.status(200).send(`consultation with id ${consultation.id} set to inactive, patient id ${patientId}, practitioner id ${practitionerId}`);
      } else {
        return res.status(200).send('patient was not registered to practitioner. No updates performed.');
      }

    } catch (error) {
      return next(error);
    }
  }

  // helper methods

  // not for this controller...
  static findPatientFromPhone(phoneNumber,idOnly= false) {
    return PatientModel.findOne({phone_number: phoneNumber}, (err, patient) => {
      // if(err) throw err;
      if (idOnly) {
        return patient.id;
      }
      return patient;
    })
  }

  static findDocFromId(id, model) {
    return model.findById(id, (err, doc) => {
      //  todo if err do something
      return doc;
    });
  }

  static findActiveConsultation(patientId, practitionerId = null) {
    const query = practitionerId == null ? { patient: patientId, active: true} : { patient: patientId, practitioner: practitionerId, active: true}
    return ConsultationModel.findOne(query,
        "organization practitioner active patient",
        function (err, consultation) {
          // if (err) return throw err;
          return consultation;
        });
  }

  static findOrgIdFromPractitionerId(practitionerId) {
    return PractitionerModel.findById(practitionerId, (err, practitioner) => {
      // if (err) return throw err;
      return practitioner.organization;
    });
  }

  static defaultDocSave(document) {
    document.save((err) => {
      if (err) throw err;
    });
  }

  /* todo flows
    patient/whatsapp -> register to org -> { (assume patient, org id already obtained)
      - find patient doc from id
      - set org field on patient
    }
    pract/socket -> register to patient =  { (assume patient, pract id already obtained)
      - Try to find active consultation
        - if active consultation with pract = null (=waiting room) , set pract
        - (shouldn't happen) if active consultation with pract already set:
          - return 400, a practitioner was already set for user with pract id
        - If none:
          - find practitioner org from pract id
          - create new consultation with pract, org, patient, active=true, messages =[], default accepted_timestamp
    }
    patient/whatsapp -> deregister from pract = { (assume already have patient id)
      - Try to find active consultation
        -  if none OR active consultation without pract, do nothing or maybe send message back
        - else set active = false
    }
    pract/socket -> deregister from patient = { (assume patient, pract id, (consultation id???) already obtained)
      - Get active consultation with pract
        - set active = false
    }
    patient/whatsapp -> deregister from org = { (assume already have patient id)
      - find patient doc from id
      - set patient org to null
      - Try to find active consultation
        - if found, set active = false
        - else do nothing
    }
    // skipping org -> deregister from patient for now
    // for all: return 200 for success, 400 if bad request, 500 if other error

   */
  /*todo flows -- old
    patient/whatsapp -> register to org -> { (assume org id already obtained)
      - find patient doc from phone num
      - set org field on patient
    }
    pract/socket -> register to patient =  { (assume pract id already obtained)
      - find patient id from phone num
      - Try to find active consultation
        - if active consultation without pract field (=waiting room) and set pract
        - (shouldn't happen?) if active consultation with pract already set:
          - set active = false
          - create new consultation like If none below
        - If none:
          - find practitioner org from pract id
          - create new consultation with pract, org, patient, active=true, messages =[], default accepted_timestamp
    }
    patient/whatsapp -> deregister from pract = {
      - find patient id from phone num
      - Try to find active consultation
        -  (shouldn't happen?) if none OR active consultation without pract, do nothing
        - else set active = false
    }
    pract/socket -> deregister from patient = { (assume pract id, consultation id already obtained)
      - find patient id from phone num // or do we have patient id already...?
      - Get active consultation with pract
        - set active = false
    }
    patient/whatsapp -> deregister from org = {
      - find patient doc from phone num
      - set patient org to null
      - Try to find active consultation
        - if found, set active = false
        - else do nothing
    }
    // skipping org -> deregister from patient for now
   */




  // todo  to deregister with an org, practitioner must be deregistered first.
//   static updatePatientOrg(patientId, orgId) {
//     const updateFields = orgId != null ? {'organization': orgId} : {'organization': orgId, 'practitioner': null, 'active': false}
//     ConsultationModel.findOneAndUpdate({ 'patient': patientId, 'active': true},
//         updateFields,
//         function (err, consultation) {
//       if (err) return throw err; // todo deal with error
//       // todo what to do after update?
//       console.log('consultation successfully updated!');
//
//     })
//   }
//   static updatePatientPractitioner(patientId, practitionerId) {
//     ConsultationModel.findOne({ 'patient': patientId, 'active': true},
//        "organization practitioner active patient", //todo do we need to fetch a firld to update it
//         function (err, consultation) {
//           if (err) return throw err;
//           consultation.practitioner = practitionerId;
//           consultation.active = practitionerId != null
//           consultation.save(function(err) {
//                 if (err) throw err;
//                 console.log('consultation successfully updated!');
//           });
//           if (!active){
//             //clone consultation...
//             consultation._doc._id = mongoose.Types.ObjectId();
//             consultation.isNew = true;
//             consultation.active = true;
//
// // save the user
//             newUser.save(function(err) {
//               if (err) throw err;
//
//               console.log('User created!');
//             });
//           }
//           // todo what to do after update?
//         })
//   }
}

export default Registration;
