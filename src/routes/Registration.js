import express from 'express';
import Registration from '../controllers/Registration.js';
import TestDataCreator from "../controllers/TestDataCreator";

const routes = express.Router();
routes.use(express.json());
routes.post('/register_patient_org', Registration.registerPatientOrg);
routes.post('/deregister_patient_org', Registration.deregisterPatientOrg);
routes.post('/register_patient_practitioner', Registration.registerPatientPractitioner);
routes.post('/deregister_patient_practitioner', Registration.deregisterPatientPractitioner);

// todo testonly
routes.post('/find_patient_name', TestDataCreator.getPatientNameFromId);

export default routes;
