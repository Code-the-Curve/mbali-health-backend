import { MessageModel, ConsultationModel, PractitionerModel } from "../models";

class ConsultationController {
    static getAllConsultations(uid) {
        return new Promise((resolve, reject ) => {
            PractitionerModel.findById(uid)
            .then(practitioner => {
                if (!practitioner) reject(`Practitioner not found with id ${uid}`)
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

    static getConsultationById(uid, id) {
         return new Promise((resolve, reject ) => {
            PractitionerModel.findById(uid)
            .then(practitioner => {
                if (!practitioner) reject(`Practitioner not found with id ${uid}`)
                return ConsultationModel.findOne({ 
                    _id: id,
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