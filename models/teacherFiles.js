import mongoose from "mongoose";

const schema = new mongoose.Schema({

    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    userID: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true })

export const model = mongoose.model('teacherFile', schema)