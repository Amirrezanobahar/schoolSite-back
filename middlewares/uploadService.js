import { PutObjectCommand } from '@aws-sdk/client-s3';
import client from './s3Client.js';
import fs from 'fs/promises';

// تابع برای آپلود فایل به لیارا
const uploadFileToLiara = async (filePath, fileName) => {
    const fileContent = await fs.readFile(filePath);

    const params = {
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: fileName, // نام جدید فایل
        Body: fileContent,
        ACL: 'public-read', // دسترسی عمومی به فایل
    };

    try {
        const command = new PutObjectCommand(params);
        await client.send(command);
        console.log('File uploaded successfully:', fileName);
        return `https://${process.env.LIARA_BUCKET_NAME}.${process.env.LIARA_ENDPOINT}/${fileName}`;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export default uploadFileToLiara;