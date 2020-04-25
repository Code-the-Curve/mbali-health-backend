import express from 'express';
import Registration from '../controllers/Registration.js';
import TestDataCreator from "../controllers/TestDataCreator";

const routes = express.Router();
routes.post('/register/patient_org', Registration.registerPatientOrg);
routes.post('/deregister/patient_org', Registration.deregisterPatientOrg);
routes.post('/register/patient_practitioner', Registration.registerPatientPractitioner);
routes.post('/deregister/patient_practitioner', Registration.deregisterPatientPractitioner);

// todo testonly
// routes.post('/find_patient_by_id', TestDataCreator.getPatientFromId);

export default routes;
