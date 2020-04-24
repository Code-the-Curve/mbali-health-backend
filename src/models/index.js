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

export const RoleModel = mongoose.model('role', {
    name: String, //Doctor, clinical Officer, Nurse, etc
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
	role : ObjectId //this could also be an embeded object  
});

export const PatientModel = mongoose.model('patient', {
    name: {
        first_name : String,
        last_name : String
    },
    phone_number: String,
    registered_ts : DateTime
});

export const ConsultationModel = mongoose.model('consultation', {
    accepted_timestamp : DateTime,
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