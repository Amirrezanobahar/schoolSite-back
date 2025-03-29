import mongoose from 'mongoose';

const schema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    fore: {
        type: String,
        enum: ['student', 'teacher'],
        required: true
    }
}, { timestamps: true })


export const model = mongoose.model('adminMessage', schema)