import express, { query } from 'express';
import messageController from '../controllers/ConsultationController.js'
import Api from '../controllers/Api.js'

const router = express.Router();

router.get('/:uid', (req, res, next) => {
    messageController.getAllConsultations(req.params.uid)
    .then(consultations => {
        if (consultations.length) {
            Api.okWithContent(res, consultations)
        } else {
            Api.errorWithMessage(res, 404, `No consultation for id ${req.params.uid}`)
        }
    })
    .catch(error => Api.errorWithMessage(res, 500, error))
})

router.get('/:uid/:consultationId', (req, res, next) => {
    const { uid, consultationId } = req.params;
    messageController.getConsultationById(uid, consultationId)
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