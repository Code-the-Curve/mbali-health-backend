import mongoose from 'mongoose';

export const ValidationOperator = Object.freeze({
    Is: 'is',
    IsNot: 'is_not',
    GreaterThan: 'gt',
    LessThan: 'lt',
    EqualTo : "eq",
    NotEqualTo : "neq",
    GreaterThanOrEqualTo: 'gte',
    LessThanOrEqualTo : 'lte',
    Contains: 'contains'
});

export const ContentTypes = Object.freeze({
    Location: 'location',
    Text: 'text',
    Picture: 'picture',
    Contact: 'contact',
    Video: 'video',
    Audio: 'audio',
    Document: 'document'
});

export const BotMessageTypes = Object.freeze({
    Start: 'start',
    OrganizationChoice: 'organization_choice',
    FirstName: 'first_name',
    LastName: 'last_name',
    ResponseNotFound: 'response_not_found',
    Normal: 'normal'
});

const ValidationSchema = mongoose.Schema({
    type: {
        type: String,
        enum: Object.values(ValidationOperator)
    },
    value: mongoose.Mixed,
});

export const ValidationModel = mongoose.model('validation', ValidationSchema);

const ResponseSchema = mongoose.Schema({
    values: {
        type: [String],
        default: [] // [] = free form
    },
    description: String,
    points_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bot_message'
    }
});

export const ResponseModel = mongoose.model('response', ResponseSchema);

export const BotMessageModel = mongoose.model('bot_message', {
    text: String,
    description: String,
    validation:[ValidationSchema], //validation on possible response. By default any responses that don't match the embedded responses will be rejected
    responses: [ResponseSchema],  //null  = end of bot flow; [] = special for invalid response message
    message_type: {
        type: String,
        enum: Object.values(BotMessageTypes),
        default: BotMessageTypes.Normal
    } // quick and dirty way to set a special way to deal with this message
});

export const BotFlowProgressModel = mongoose.model('bot_flow_progress', {
    patient:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patient'
    },
    current_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bot_message'
    },
    organization_options: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
        default: []
    }]
});