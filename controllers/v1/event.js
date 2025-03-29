
import { model as eventModel } from "../../models/events.js"
import { isValidObjectId } from "mongoose"
import fs from 'fs'
import { log } from "console"
// import uploadFileToLiara from './../../middlewares/uploadService.js';
import { S3Client, DeleteObjectCommand,PutObjectCommand } from '@aws-sdk/client-s3'

const client = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY,
        secretAccessKey: process.env.LIARA_SECRET_KEY
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

// کنترلر برای آپلود فایل
export const create = async (req, res) => {
    // بررسی وجود فایل آپلود شده
    if (!req.file) {
        return res.status(400).json({ message: "هیچ فایلی آپلود نشده است." });
    }

    const tempFilePath = req.file.path; // مسیر موقت فایل
    const fileName = req.file.filename; // نام جدید فایل

    try {
        // آپلود فایل به لیارا
        const fileUrl = await uploadFileToLiara(tempFilePath, fileName);

        // ذخیره اطلاعات فایل در دیتابیس
        const event = await eventModel.create({
            filename: fileName,
            path: fileUrl, // ذخیره URL فایل آپلود شده
        });

        // پاسخ به کاربر
        return res.status(201).json("فایل با موفقیت آپلود شد.");
    } catch (error) {
        console.error("خطا در آپلود فایل:", error);
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


export const allData = async (req, res) => {

    try {
        const event = await eventModel.find({}).lean()
        if (!event) {
            return res.status(400).json({ message: "شکست در دریافت اطلاعات" })
        }

        return res.json(event)

    } catch (err) {
        console.log({ err });

    }

}




export const remove = async (req, res) => {
    const { fileId } = req.params;

    // اعتبارسنجی fileId
    if (!isValidObjectId(fileId)) {
        return res.status(400).json({ message: 'شناسه فایل نامعتبر است.' });
    }

    try {
        // یافتن و حذف فایل از دیتابیس
        const studentFile = await eventModel.findByIdAndDelete({ _id: fileId });
        if (!studentFile) {
            return res.status(404).json({ message: 'فایل  یافت نشد.' });
        }

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



