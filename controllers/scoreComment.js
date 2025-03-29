import { model as scoreComment } from "../models/scoreComment.js";
import mongoose, { isValidObjectId } from "mongoose";

export const create = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const studentID = req.user._id;
        const teacherID = new mongoose.Types.ObjectId(req.params.teacherId)

        if (!rating || !comment) {
            return res.status(400).json({ message: "لطفا تمام فیلدها را پر کنید." });
        }

        console.log(typeof (studentID));
        console.log(typeof (teacherID));


        const score = await scoreComment.create({
            rating,
            comment,
            teacherID,
            userID: studentID
        });

        if (!score) {
            return res.status(400).json({ message: "ایجاد نمره و نظر با موفقیت انجام نشد." });
        }

        return res.status(201).json({ message: "نمره و نظر با موفقیت ایجاد شد.", data: score });
    } catch (error) {
        console.error("خطا در ایجاد نمره و نظر:", error);
        return res.status(500).json({ message: "خطای سرور در ایجاد نمره و نظر." });
    }
};







export const allComments = async (req, res) => {


    const { id } = req.user

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "خطایی در شناسایی کاربر." });
    }

    const comments = await scoreComment.find({ teacherID: id }).lean()

    if (!comments) {
        return res.status(404).json({ message: "نظر برای این استاد وجود ندارد." })
    }
    return res.status(200).json(comments)

};