import { MessageModel, ConsultationModel, PractitionerModel } from "../models";

class ConsultationController {
    static getAllConsultations(practitionerId) {
        return new Promise((resolve, reject ) => {
            PractitionerModel.findById(practitionerId)
            .then(practitioner => {
                if (!practitioner) reject(`Practitioner not found with id ${practitionerId}`)
                return ConsultationModel.find({ 
                    organization: practitioner.organization,
                    practitioner: { $in: [practitioner.id, null]}
                })},
                err => reject(err))
            .then(
                consultations => resolve(consultations),
                err => reject(err))
        })
    }

    static getConsultationById(practitionerId, consultationId) {
         return new Promise((resolve, reject ) => {
            PractitionerModel.findById(practitionerId)
            .then(practitioner => {
                if (!practitioner) reject(`Practitioner not found with id ${practitionerId}`)
                return ConsultationModel.findOne({ 
                    _id: consultationId,
                    organization: practitioner.organization,
                    practitioner: { $in: [practitioner.id, null]}
                })}, 
                err => reject(err))
            .then(
                consultation => resolve(consultation),
                err => reject(err))
        })
    }
}

export default ConsultationController;