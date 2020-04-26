import mongoose from 'mongoose'


export const OrganizationModel = mongoose.model('organization', {
    name : String,
	phone_number : String,
	location: {
		description : String,
		address : String,
		city : String,
		county: String,
		lat : mongoose.Types.Decimal128,
		long : mongoose.Types.Decimal128
	}
});

export const Roles = Object.freeze({
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
	organization : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
	phone_number : String,
	role :  {
        name: Number, //Doctor, Clinical Officer, Nurse, etc
	    description : String
    }
});

export const PatientModel = mongoose.model('patient', {
    name: {
        first_name : String,
        last_name : String
    },
    phone_number: String,
    organization : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    registered_ts : { type: Date, default: Date.now }
});

const MessageSchema = mongoose.Schema({
    sent_ts: Date,
    received_ts: Date,
    to: mongoose.Schema.Types.ObjectId, // CONSULTATION
    from: mongoose.Schema.Types.ObjectId, // no ref checking because can be patient or practitioner
    source_message : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message',
        default: null
    },
    content: {
        message: String
    }
});

export const MessageModel = mongoose.model('message', MessageSchema);

export const ConsultationModel = mongoose.model('consultation', {
    accepted_timestamp : { type: Date, default: Date.now },
    practitioner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'practitioner',
        default: null
    },
    organization : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
    }, //Somewhat breaking SSoT here, but it's going to be very expensive to query for all messages for an organization if we don't include
    patient : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patient'
    },
    active : Boolean,
    messages : [MessageSchema]
});