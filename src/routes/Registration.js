import express from 'express';
import Registration from '../controllers/Registration.js';
import TestDataCreator from "../controllers/TestDataCreator";

const routes = express.Router();
routes.post('/patient_org', Registration.registerPatientOrg);
routes.post('/patient_practitioner', Registration.registerPatientPractitioner);

// todo testonly
// routes.post('/find_patient_by_id', TestDataCreator.getPatientFromId);

export default routes;
