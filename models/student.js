import mongoose from 'mongoose';

const schema = new mongoose.Schema({


    fullname: {
        type: String,
        required: true
    },
    description: {
        type: String,
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


export const model = mongoose.model('student', schema)