import { model as studentModel } from "../../models/student.js";
import { model as userModel } from "../../models/user.js";
import { model as scoreCommentModel } from "../../models/scoreComment.js";
import { model as adminMessageModel } from "../../models/AdminMessage.js";
import bcrypt from 'bcryptjs';
import fs from 'fs'; // استفاده از fs.promises برای کار با فایل‌ها
import { isValidObjectId } from "mongoose";
import uploadFileToLiara from './../../middlewares/uploadService.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const client = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY,
        secretAccessKey: process.env.LIARA_SECRET_KEY
    },
});


// ایجاد دانش‌آموز جدید

export const create = async (req, res) => {
    console.log('hello world');

    const { fullname, description } = req.body;

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }


    const tempFilePath = req.file.path; // مسیر موقت فایل
    const fileName = req.file.filename; // نام جدید فایل

    try {
        // آپلود فایل به لیارا

        const studentData = await studentModel.create({
            fullname,
            description,
            filename: fileName,
            path: tempFilePath
        });
        const fileUrl = await uploadFileToLiara(tempFilePath, fileName);
        res.send(`File uploaded successfully: ${fileUrl}`);
    } catch (error) {
        res.status(500).send('Error uploading file');
    } finally {
        // حذف فایل موقت از سرور
        fs.unlinkSync(tempFilePath);
    }
};

// حذف دانش‌آموز
export const remove = async (req, res) => {
    try {
        const { fileId } = req.params;

        // اعتبارسنجی fileId
        if (!isValidObjectId(fileId)) {
            return res.status(400).json({ message: 'شناسه فایل نامعتبر است.' });
        }

        // یافتن و حذف فایل از دیتابیس
        const studentFile = await studentModel.findByIdAndDelete(fileId);
        if (!studentFile) {
            return res.status(404).json({ message: 'فایل دانش‌آموز یافت نشد.' });
        }

        // حذف فایل از سیستم فایل
        const params = {
            Bucket: process.env.LIARA_BUCKET_NAME,
            Key: studentFile.filename
        };

        // async/await
        try {
            await client.send(new DeleteObjectCommand(params));
            res.send("File deleted successfully");
        } catch (error) {
            console.log(error);
        }

        // callback
        client.send(new DeleteObjectCommand(params), (error, data) => {
            if (error) {
                console.log(error);
            } else {
                console.log("File deleted successfully");
            }
        });
    } catch (error) {
        console.error('خطا در حذف فایل دانش‌آموز:', error);
        res.status(500).json({ message: 'خطا در سرور.' });
    }
};

// دریافت تمام داده‌های دانش‌آموزان
export const allData = async (req, res) => {
    try {
        const data = await studentModel.find({}).lean();
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "داده‌ای یافت نشد." });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error("خطا در دریافت داده‌ها:", error);
        res.status(500).json({ message: "خطا در سرور." });
    }
};

// دریافت اطلاعات دانش‌آموز
export const studentInfo = async (req, res) => {
    try {
        const studentID = req.user._id;

        // اجرای موازی کوئری‌ها با Promise.all
        const [user, comment, adminMessage] = await Promise.all([
            userModel.findById(studentID).lean(),
            scoreCommentModel.find({ userID: studentID }).lean().sort({ _id: -1 }),
            adminMessageModel.find({ fore: 'student' }).lean().sort({ _id: -1 })
        ]);

        if (!user || !comment || !adminMessage) {
            return res.status(404).json({ message: "داده‌ای یافت نشد." });
        }

        res.status(200).json({ user, comment, adminMessage });
    } catch (error) {
        console.error("خطا در دریافت اطلاعات دانش‌آموز:", error);
        res.status(500).json({ message: "خطا در سرور." });
    }
};

// تغییر نام دانش‌آموز
export const changeName = async (req, res) => {
    try {
        const studentID = req.user._id;
        const { name } = req.body;

        // اعتبارسنجی نام
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: "نام نامعتبر است." });
        }

        const user = await userModel.findByIdAndUpdate(studentID, { name }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "کاربر یافت نشد." });
        }

        res.status(200).json({ message: "نام با موفقیت تغییر کرد.", user });
    } catch (error) {
        console.error("خطا در تغییر نام:", error);
        res.status(500).json({ message: "خطا در سرور." });
    }
};

// تغییر رمز عبور دانش‌آموز
export const changePassword = async (req, res) => {
    try {
        const studentID = req.user._id;
        const { password } = req.body;

        // اعتبارسنجی رمز عبور
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: "رمز عبور نامعتبر است." });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await userModel.findByIdAndUpdate(studentID, { password: hashPassword }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "کاربر یافت نشد." });
        }

        res.status(200).json({ message: "رمز عبور با موفقیت تغییر کرد." });
    } catch (error) {
        console.error("خطا در تغییر رمز عبور:", error);
        res.status(500).json({ message: "خطا در سرور." });
    }
};