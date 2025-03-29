import uploadFileToLiara from './../middlewares/uploadService.js';
import { model as teacherFileModel } from '../models/teacherFiles.js';
import fs from 'fs';

// کنترلر برای آپلود فایل
const uploadController = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const userID = req.user._id;
    const { body } = req.body;
    if (!body) {
        return res.status(400).send('No body message');
    }
    const tempFilePath = req.file.path; // مسیر موقت فایل
    const fileName = req.file.filename; // نام جدید فایل

    try {
        // آپلود فایل به لیارا
        const file = await teacherFileModel.create({ filename: fileName, path: tempFilePath, body, userID });
        const fileUrl = await uploadFileToLiara(tempFilePath, fileName);
        res.send(`File uploaded successfully: ${fileUrl}`);
    } catch (error) {
        res.status(500).send('Error uploading file');
    } finally {
        // حذف فایل موقت از سرور
        fs.unlinkSync(tempFilePath);
    }
};

export default uploadController;