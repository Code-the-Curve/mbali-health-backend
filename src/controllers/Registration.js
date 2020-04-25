// import mongoose from 'mongoose';
import {PatientModel} from '../models/index.js';
import {PractitionerModel} from '../models/index.js';
import {ConsultationModel} from '../models/index.js';

// todo do we need to connect to mongo here too like in the server?
//todo error check the input ex if patient doesnt exist or missing body components

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
      res.set('Content-Type', 'application/json'); // TODO UPDATE REST
      Registration.findDocFromId(patientId, PatientModel, (patient) => {
        patient.organization = orgId;
        Registration.defaultDocSave(patient); // todo technically all calls to defaultDocSave should also be nested...
        return res.status(200).send(`{"patient": ${patient}}`);
      });
    } catch (error) {
      return next(error);
    }
  }

  // todo right now this is "org ignorant". Do we want to check which org patient is deregistering from?
  static deregisterPatientOrg(req, res, next) {
    try {
      const patientId = req.body.patient;
      res.set('Content-Type', 'application/json');
      Registration.findDocFromId(patientId, PatientModel, (patient) => {
        patient.organization = null;
        Registration.defaultDocSave(patient);
        Registration.findActiveConsultation(patientId, null, (consultation) => {
          if (consultation != null) {
            consultation.active = false;
            Registration.defaultDocSave(consultation);
            return res.status(200).send(`{"patient": ${patient}, "consultation": ${consultation}}`);
          }
          return res.status(200).send(`{"patient": ${patient}}`);
        });
      });
    } catch (error) {
      return next(error);
    }
  }

  static registerPatientPractitioner(req, res, next) {
    try {
      const patientId = req.body.patient;
      const practitionerId = req.body.practitioner;
      res.set('Content-Type', 'application/json');
      Registration.findActiveConsultation(patientId, null, (consultation) => {
          Registration.findOrgIdFromPractitionerId(practitionerId, (orgId) => {
            if (consultation == null) {
              const newConsultation = ConsultationModel({
                'practitioner' : practitionerId,
                'organization' : orgId,
                'patient' : patientId,
                'active' : true
                // 'messages' : []
              });
              Registration.defaultDocSave(newConsultation);
              return res.status(200).send(`{"consultation": ${newConsultation}}`);
            } else if (consultation.practitioner == null) {
              consultation.practitioner = practitionerId;
              Registration.defaultDocSave(consultation);
              return res.status(200).send(`{"consultation": ${consultation}}`);
            } else { // an active consultation exists, practitioner not null => patient already has practitioner
              return res.status(400).send(`{"error": "Bad request: patient with id ${patientId} is already registered with practitioner id ${consultation.practitioner} on active consultation id ${consultation.id}. No updates were performed."}`);
            }
          });
      });
    } catch (error) {
      return next(error);
    }
  }

//todo still a bit iffy about the difference between requests coming from the 2 sides.
// verify that patient side does not have/need practitioner id
  static deregisterPatientPractitioner(req, res, next) {
    try {
      const patientId = req.body.patient;
      const practitionerId = req.body.practitioner; // optional, only set if coming from practitioner/socket side
      res.set('Content-Type', 'application/json');
      Registration.findActiveConsultation(patientId, practitionerId, (consultation) => {
        if (consultation != null && consultation.practitioner != null) {
          consultation.active = false;
          Registration.defaultDocSave(consultation);
          return res.status(200).send(`{"consultation": ${consultation}}`);
        } else {
          return res.status(200).send('{"message": "patient was not registered to practitioner. No updates performed."}');
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  // helper methods

  // not for this controller...
  static findPatientFromPhone(phoneNumber, idOnly, next) {
    PatientModel.findOne({phone_number: phoneNumber}, (err, patient) => {
      // if(err) throw err;
      if (idOnly) {
        next(patient.id);
      }
      next(patient);
    })
  }

  static findDocFromId(id, model, next) {
    model.findById(id, (err, doc) => {
      //  todo if err do something
      next(doc);
    });
  }

  static findActiveConsultation(patientId, practitionerId, next) {
    const query = practitionerId == null ? { patient: patientId, active: true} : { patient: patientId, practitioner: practitionerId, active: true}
    ConsultationModel.findOne(query,
        "organization practitioner active patient",
        function (err, consultation) {
          // if (err) return throw err;
          next(consultation);
        });
  }

  static findOrgIdFromPractitionerId(practitionerId, next) {
    PractitionerModel.findById(practitionerId, (err, practitioner) => {
      // if (err) return throw err;
      next(practitioner.organization);
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
