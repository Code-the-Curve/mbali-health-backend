import express, { query } from 'express';
import messageController from '../controllers/ConsultationController.js'
import Api from '../controllers/Api.js'

const router = express.Router();

router.get('/:practitionerId', (req, res, next) => {
    messageController.getAllConsultations(req.params.practitionerId)
    .then(consultations => {
        if (consultations.length) {
            Api.okWithContent(res, consultations)
        } else {
            Api.errorWithMessage(res, 404, `No consultation for id ${req.params.practitionerId}`)
        }
    })
    .catch(error => Api.errorWithMessage(res, 500, error))
})

router.get('/:practitionerId/:consultationId', (req, res, next) => {
    const { practitionerId, consultationId } = req.params;
    messageController.getConsultationById(practitionerId, consultationId)
    .then(consultation => {
        if (consultation) { 
            Api.okWithContent(res, consultation)
        } else {
            Api.errorWithMessage(res, 404, `No consultation found with id ${consultationId}`)
        }
    })
    .catch(error => Api.errorWithMessage(res, 500, error))
})

export default router