import mongoose from 'mongoose';

const schema = new mongoose.Schema({


    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER', 'TEACHER'],
        default: 'USER'
    },
    ban: {
        type: Boolean,
        required: false
    }


}, { timestamps: true })

schema.virtual('teacherID', {
    ref: 'score',
    localField: '_id',
    foreignField: 'userID'
})


export const model = mongoose.model('user', schema)