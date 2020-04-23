import mongoose from 'mongoose'

export const PersonModel = mongoose.model('patient', {
    name: String,
    phone_number: String,
});

export const MessageModel = mongoose.model('message', {
    ts: Date,
    sender_id: String,
    receiver_id: String, 

    content: {
        message: String
    }
})
