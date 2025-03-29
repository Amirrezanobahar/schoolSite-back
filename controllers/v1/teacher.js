import mongoose from "mongoose";
import { model as teacherModel } from "../../models/teacher.js";
import { model as teacherFilesModel } from "../../models/teacherFiles.js";
import { model as scoreCommentModel } from "../../models/scoreComment.js";
import { model as AdminMessageModel } from "../../models/AdminMessage.js";
import fs from 'fs'; // استفاده از نسخه Promise-based از fs
import { S3Client, DeleteObjectCommand,PutObjectCommand  } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
dotenv.config()

const client = new S3Client({
    region: "us-east-1", // تنظیم منطقه دلخواه
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY,
        secretAccessKey: process.env.LIARA_SECRET_KEY,
    },
});

// تابع برای آپلود فایل به لیارا
const uploadFileToLiara = async (filePath, fileName) => {
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
    };

    await client.send(new PutObjectCommand(params));
    return `${process.env.LIARA_ENDPOINT}/${process.env.LIARA_BUCKET_NAME}/${fileName}`;
};

// تابع برای حذف فایل از لیارا
const deleteFileFromLiara = async (fileName) => {
    const params = {
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: fileName,
    };

    await client.send(new DeleteObjectCommand(params));
    console.log("فایل قدیمی با موفقیت حذف شد.");
};

export const uploadProfile = async (req, res) => {
    const teacherID = req.user._id;
    const { duty, education } = req.body;
    const tempFilePath = req.file.path; // مسیر موقت فایل
    const fileName = req.file.filename; // نام جدید فایل

    // اعتبارسنجی ورودی‌ها
    if (!duty || !education) {
        return res.status(400).json({ message: "لطفاً تمام فیلدها را پر کنید." });
    }

    try {
        // آپلود فایل جدید به لیارا
        const fileUrl = await uploadFileToLiara(tempFilePath, fileName);

        // بررسی وجود پروفایل قدیمی
        const existingProfile = await teacherModel.findOne({ teacherID });

        if (existingProfile) {
            // حذف فایل قدیمی از لیارا
            try {
                await deleteFileFromLiara(existingProfile.filename);
            } catch (err) {
                console.error("خطا در حذف فایل قدیمی:", err);
                // اگر فایل قدیمی وجود نداشته باشد، خطا را نادیده می‌گیریم
            }

            // به‌روزرسانی پروفایل موجود
            const updatedProfile = await teacherModel.findOneAndUpdate(
                { teacherID },
                {
                    $set: {
                        duty,
                        education,
                        filename: fileName,
                        path: fileUrl, // ذخیره URL فایل جدید
                    },
                },
                { new: true } // بازگرداندن سند به‌روزرسانی شده
            );

            if (!updatedProfile) {
                return res.status(400).json({ message: "به‌روزرسانی پروفایل انجام نشد." });
            }

            return res.status(200).json({ message: "پروفایل با موفقیت به‌روزرسانی شد.", data: updatedProfile });
        } else {
            // ایجاد پروفایل جدید
            const newProfile = await teacherModel.create({
                duty,
                education,
                teacherID,
                filename: fileName,
                path: fileUrl, // ذخیره URL فایل جدید
            });

            if (!newProfile) {
                return res.status(400).json({ message: "فایل آپلود نشد." });
            }

            return res.status(201).json({ message: "اطلاعات شما با موفقیت ثبت شد.", data: newProfile });
        }
    } catch (error) {
        console.error("خطا در ذخیره‌سازی داده‌ها:", error);
        return res.status(500).json({ message: "خطا در سرور. لطفاً بعداً تلاش کنید." });
    } finally {
        // حذف فایل موقت از سرور
        try {
            fs.unlinkSync(tempFilePath);
            console.log("فایل موقت با موفقیت حذف شد.");
        } catch (err) {
            console.error("خطا در حذف فایل موقت:", err);
        }
    }
};





export const getAllData = async (req, res) => {
    const teacherID = new mongoose.Types.ObjectId(req.params.teacherId)

    const teacherData = await teacherModel.findOne({ teacherID }).lean()
    const teacherFiles = await teacherFilesModel.find({ userID: teacherID }).lean()
    const teacherScore = await scoreCommentModel.find({ teacherID }).lean()
    let scoreSum = 0
    teacherScore.forEach(tc => {
        scoreSum += +(tc.rating)
    })
    const scoreNum = scoreSum / teacherScore.length;

    res.json({ teacherFiles, teacherData, scoreNum })

};



export const adminMessage = async (req, res) => {

    const comment = await AdminMessageModel.find({ fore: 'teacher' }).sort({ createdAt: -1 });

    if (!comment) {
        return res.status(404).json({ message: "هیچ پیام وجود ندارد." })
    }
    res.json(comment)

};