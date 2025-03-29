import mongoose from 'mongoose';

const schema = new mongoose.Schema({


    duty: {
        type: String,
        required: true
    },
    education: {
        type: String,
        required: true
    },
    teacherID: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }

}, { timestamps: true })


export const model = mongoose.model('teacher', schema)