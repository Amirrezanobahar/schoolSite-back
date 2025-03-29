import mongoose from 'mongoose';

const schema = new mongoose.Schema({

    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
}, { timestamps: true })


export const model = mongoose.model('event', schema)