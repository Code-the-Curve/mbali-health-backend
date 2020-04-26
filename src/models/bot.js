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
})

export const ContentTypes = Object.freeze({
    Location: 'location',
    Text: 'text',
    Picture: 'picture',
    Contact: 'contact',
    Video: 'video',
    Audio: 'audio',
    Document: 'document'
})

const ValidationSchema = mongoose.model('validation', {
    type: {
        type: String,
        enum: Object.values(ValidationOperator)
    },
    value: mongoose.Mixed,
});

const ResponseSchema = mongoose.model('response', {
    values: [String],
    description: String,
    points_to: mongoose.Schema.Types.ObjectId, 
});

const BotMessageSchema = mongoose.model('bot_message', {
    text: String,
    description: String,
    validation:[validation], //validation on possible response. By default any responses that don't match the embedded responses will be rejected
    responses: [ResponseSchema],
});