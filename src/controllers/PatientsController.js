import {PatientModel} from '../models/index.js';


class PatientsController {

    // static createPatient(phoneNumber, firstName, lastName){
    //     console.log("hello")
    //     return PatientModel.create({
    //             phone_number: phoneNumber,
    //             name: {
    //                 first_name: firstName,
    //                 last_name: lastName
    //             }
    //         });
    // }

    static createPatient(phoneNumber, firstName, lastName){
        return new Promise((resolve, reject) => {
            console.log("Inside create patient promis")
            PatientModel.create({
                phone_number: phoneNumber,
                name: {
                    first_name: firstName,
                    last_name: lastName
                }
            })
            .then(patient => resolve(patient))
            .catch(err => {
                reject(err)
                console.log("Whoops, problem creating patient")
            })
        });
    }
}

export default PatientsController;