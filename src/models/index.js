import mongoose from 'mongoose'

export const OrganizationModel = mongoose.model('Organization', {
    name : String,
	phone_number : String,
	location: {
		description : String,
		address : String,
		city : String,
		county: County,
		lat : Decminal,
		long : Decimal
	}
});

const Roles = Object.freeze({
    MedicalOfficer: 'Medical Officer',
    ClinicalOfficer: 'Clinical Officer',
    Nurse: 'Nurse',
    Specialist: 'Specialist',
    OfficeStaff : "Office Staff",
})

export const RoleModel = mongoose.model('role', {
    name: {
        type: String,
        enum: Object.values(Roles)
    },
	description : String
});

export const PractitionerModel = mongoose.model('practitioner', {
    name : {
		first_name : String,
		last_name : String,
		prefix : String
	},
	organization : ObjectId,
	phone_number : String,
	role :  {
        name: integer, //Doctor, Clinical Officer, Nurse, etc
	    description : String
    }
});

export const PatientModel = mongoose.model('patient', {
    name: {
        first_name : String,
        last_name : String
    },
    phone_number: String,
    organization : ObjectId,
    registered_ts : { type: Date, default: Date.now }
});

export const ConsultationModel = mongoose.model('consultation', {
    accepted_timestamp : { type: Date, default: Date.now },
	practitioner : ObjectId,
	organization : ObjectId, //Somewhat breaking SSoT here, but it's going to be very expensive to query for all messages for an organization if we don't include
	patient : ObjectId,
	active : Boolean,
	messages : [MessageModel]
});

export const MessageModel = mongoose.model('message', {
    sent_ts: Date,
    received_ts: Date,
    to: ObjectId,
    from: ObjectId, 
    source_message : ObjectId,
    content: {
        message: String
    }
})