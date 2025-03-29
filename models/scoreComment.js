import mongoose from "mongoose";

const schema = new mongoose.Schema({

    rating: {
        type: String,
        enum: [1, 2, 3, 4, 5],
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    teacherID: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userID: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    }

}, { timestamps: true })

export const model = mongoose.model('scoreComment', schema)