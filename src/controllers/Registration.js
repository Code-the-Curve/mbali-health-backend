import {PatientModel} from '../models/index.js';
import {PractitionerModel} from '../models/index.js';
import {ConsultationModel} from '../models/index.js';
import Api from './Api'

//todo error check the input ex if patient doesnt exist or missing body components
// todo return 500 on other errors?
/*
API:
* everything returns 200 for success (or no action taken).
* post to '/register/patient_org'
    body = {
      "organization": "String, org id",
      "patient": "String, patient id"
    }
    returns: {"patient": PatientModel}
* post to '/deregister/patient_org'
  body = {
    "patient": "String, patient id"
  }
  returns:
    - if there was no active consultation:
      {"patient": PatientModel}
    - else:
      {"patient": PatientModel, "consultation": ConsultationModel}

* post to '/register/patient_practitioner'
  body = {
    "patient": "String, patient id",
    "practitioner": "String, practitioner id"
  }
  returns:
    - if patient NOT already registered to a practitioner:
      {"consultation": ConsultationModel}
    - STATUS 400, {"error": "Bad request: patient with id ${patientId} is already registered with practitioner id ${consultation.practitioner} on active consultation id ${consultation.id}. No updates were performed."}

* post to '/deregister/patient_practitioner'
  body = {
    "patient": "String, patient id",
    "practitioner": "String, practitioner id, optional -> set if coming from practitioner/socket side"
  }
  returns:
    - if patient had active consultation with practitioner:
    - {"consultation": ConsultationModel}
    - else:
      {"message": "patient was not registered to practitioner. No updates performed."}
 */

class Registration {

  static registerPatientOrg(req, res, next) {
    try {
      const orgId = req.body.organization;
      const patientId = req.body.patient;
      res.set('Content-Type', 'application/json'); // TODO UPDATE REST
      Registration.findDocFromId(patientId, PatientModel, (patient) => {
        patient.organization = orgId;
        Registration.defaultDocSave(patient, () => {
          return Api.okWithContent(res,{ patient });
        }); // todo technically all calls to defaultDocSave should also be nested...
      });
    } catch (error) {
      return Api.errorWithMessage(res, 500, error.message)
    }
  }

  static deregisterPatientOrg(req, res, next) {
    try {
      const patientId = req.body.patient;
      const orgId = req.body.organization;
      res.set('Content-Type', 'application/json');
      Registration.findDocFromId(patientId, PatientModel, (patient) => {
        if (patient.organization != orgId) {
          return Api.errorWithMessage(res, 400, `patient id ${patientId} was not registered with organization ${orgId}`)
        }
        patient.organization = null;
        Registration.defaultDocSave(patient, () => {
          Registration.findActiveConsultation(patientId, null, (consultation) => {
            if (consultation != null) {
              consultation.active = false;
              Registration.defaultDocSave(consultation, () => {
                return Api.okWithContent(res, `{"patient": ${patient}, "consultation": ${consultation}}`);
              });
            } else {
              return Api.okWithContent(res,{ patient });
            }
          });
        });

      });
    } catch (error) {
      return Api.errorWithMessage(res, 500, error.message)
    }
  }

  static registerPatientPractitioner(req, res, next) {
    try {
      const patientId = req.body.patient;
      const practitionerId = req.body.practitioner;
      res.set('Content-Type', 'application/json');
      Registration.findActiveConsultation(patientId, null, (consultation) => {
          Registration.findOrgIdFromPractitionerId(practitionerId, (practOrgId) => {
            Registration.findDocFromId(patientId, PatientModel, (patient) => {
              if (patient.organization != practOrgId.toString()) {
                return Api.errorWithMessage(res, 400, `patient org id ${patient.organization} does not match practitioner org id ${practOrgId}`)
              } else if (consultation == null) {
                return Api.errorWithMessage(res, 400, 'patient had no waiting room consultation.')
              } else if (consultation.practitioner == null) {
                consultation.practitioner = practitionerId;
                Registration.defaultDocSave(consultation, () => {
                  return Api.okWithContent(res, { consultation });
                });
              } else { // an active consultation exists, practitioner not null => patient already has practitioner
                return Api.errorWithMessage(res, 400, `Bad request: patient with id ${patientId} is already registered with practitioner id ${consultation.practitioner} on active consultation id ${consultation.id}. No updates were performed.`)
              }
            })

          });
      });
    } catch (error) {
      return Api.errorWithMessage(res, 500, error.message)
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
          Registration.defaultDocSave(consultation, () => {
            return Api.okWithContent(res, { consultation });
          });
        } else {
          return Api.okWithContent(res,'{"message": "patient was not registered to practitioner. No updates performed."}');
        }
      });
    } catch (error) {
      return Api.errorWithMessage(res, 500, error.message)
    }
  }

  // helper methods

  // not for this controller...
  static findPatientFromPhone(phoneNumber, idOnly, next) {
    PatientModel.findOne({phone_number: phoneNumber}, (err, patient) => {
      if (err) throw err;
      if (idOnly) {
        next(patient.id);
      }
      next(patient);
    })
  }

  static findDocFromId(id, model, next) {
    model.findById(id, (err, doc) => {
      if (err) throw err;
      next(doc);
    });
  }

  static findActiveConsultation(patientId, practitionerId, next) {
    const query = practitionerId == null ? { patient: patientId, active: true} : { patient: patientId, practitioner: practitionerId, active: true}
    ConsultationModel.findOne(query,
        "organization practitioner active patient",
        function (err, consultation) {
          if (err) throw err;
          next(consultation);
        });
  }

  static findOrgIdFromPractitionerId(practitionerId, next) {
    PractitionerModel.findById(practitionerId, (err, practitioner) => {
      if (err) throw err;
      next(practitioner.organization);
    });
  }

  static defaultDocSave(document, next) {
    document.save((err) => {
      if (err) throw err;
      next();
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
}

export default Registration;
