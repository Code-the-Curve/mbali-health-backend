import express from 'express';
import Registration from '../controllers/Registration.js';

const routes = express.Router();
routes.post('/patient_org', Registration.deregisterPatientOrg);
routes.post('/patient_practitioner', Registration.deregisterPatientPractitioner);

export default routes;
