import express from 'express';
import Registration from '../controllers/Registration.js';
import TestDataCreator from "../controllers/TestDataCreator";
import Api from "../controllers/Api";

const routes = express.Router();
routes.post('/patient_org', (req, res, next) => {
    const orgId = req.body.organization;
    const patientId = req.body.patient;
    const patient = Registration.registerPatientOrg(orgId, patientId);
    if (patient) {
        return Api.okWithContent(res,{ patient });
    }
    res.set('Content-Type', 'application/json');
    Api.errorWithMessage(res, 500, 'some error occurred.')
});
routes.post('/patient_practitioner', Registration.registerPatientPractitioner);

// todo testonly
// routes.post('/find_patient_by_id', TestDataCreator.getPatientFromId);

export default routes;
