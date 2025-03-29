import { model as userModel } from "../../models/user.js"
import { valid as registerValidator } from "../../validators.js/register.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { isValidObjectId } from "mongoose"
import nodemailer from 'nodemailer'
import { model as teacherFileModel } from "../../models/teacherFiles.js"
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import fs from 'fs'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
dotenv.config()

const client = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY,
        secretAccessKey: process.env.LIARA_SECRET_KEY
    },
});


export const register = async (req, res) => {

    console.log('request');

    try {

        const { name, email, phone, age, password } = req.body

        if (registerValidator(req.body) !== true) {

            return res.status(409).json(registerValidator(req.body))
        }
        const isExistUser = await userModel.findOne({
            $or: [
                { phone: phone },
                { email: email }
            ]
        });

        if (isExistUser) {
            return res.status(400).send({ message: 'کاربر با مشخصات وارد شده وجود دارد' });
        }


        const userCount = await userModel.countDocuments()
        const hashPassword = await bcrypt.hash(password, 10)
        const user = await userModel.create({
            name,
            email,
            phone,
            age,
            password: hashPassword,
            role: userCount > 0 ? 'USER' : "ADMIN",
            ban: false
        })

        if (!user) {
            return res.status(400).json(" خطایی در ثبت کاربر رخ داد")
        }




        res.json({ user })
    }
    catch (err) {
        console.log(err)
    }


}

export const login = async (req, res) => {

    try {

        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: ' کاربر یافت نشد' })
        }
        if (user.ban) {
            return res.status(401).json({ message: ' کاربر بلاک شده است' })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: ' پسوورد اشتباه است' })
        }

        const accessUser = jwt.sign({ id: user._id }, process.env.SecretKey, { expiresIn: "30day" })


        const userRole = user.role
        const userName = user.name

        res.json({ accessUser, userRole, userName })
    } catch (err) {
        console.log(err)
    }
}


export const getAllStudents = async (req, res) => {
    try {
        const students = await userModel.find({ role: 'USER' });
        if (!students.length) {
            return res.status(404).json({ message: 'هیچ دانشجویی وجود ندارد' });
        }
        res.json(students);
    } catch (error) {
        console.error('خطا در دریافت دانشجویان:', error);
        res.status(500).json({ message: 'خطا در سرور.' });
    }
};
export const getAllTeachers = async (req, res) => {

    const teachers = await userModel.find({ role: 'TEACHER' })

    if (!teachers) {
        return res.status(409).send(' هیچ معلمی وجود ندارد')
    }
    res.json(teachers)

}


export const upToTeacher = async (req, res) => {

    const { id } = req.body

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: ' id صحیح نیست' })
    }

    const user = await userModel.findOneAndUpdate({ $and: [{ _id: id }, { role: 'USER' }] }, { role: 'TEACHER' })



    if (!user) {
        return res.status(404).json({ message: ' کاربر یافت نشد' })
    }
    res.json(user)

}

export const upToUser = async (req, res) => {

    const { id } = req.body

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: ' id صحیح نیست' })
    }

    const user = await userModel.findOneAndUpdate({ $and: [{ _id: id }, { role: 'TEACHER' }] }, { role: 'USER' })

    if (!user) {
        return res.status(404).json({ message: ' کاربر یافت نشد' })
    }
    res.json(user)

}

export const ban = async (req, res) => {

    const { id } = req.body

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: ' id صحیح نیست' })
    }
    const user = await userModel.findById(id)
    if (user.ban === true) {
        return res.status(400).json({ message: ' کاربر قبلا بن شده است' })
    }

    const banUser = await userModel.findByIdAndUpdate(id, { ban: true })

    if (!banUser) {
        return res.status(404).json({ message: ' کاربر یافت نشد' })
    }

    res.json({ message: 'کاربر بن شد' })

}


export const unBan = async (req, res) => {

    const { id } = req.body

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: ' id صحیح نیست' })
    }

    const user = await userModel.findById(id)

    if (user.ban === false) {
        return res.status(404).json({ message: ' کاربر بن نیست  نشد' })
    }

    const unBanUser = await userModel.findByIdAndUpdate(id, { $set: { ban: false } })


    res.json({ message: 'کاربراز بن خارج شد' })

}

// تنظیم Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // استفاده از سرویس Gmail
    auth: {
        user: 'nwbharamyrrda330@gmail.com', // ایمیل شما
        pass: 'bhimtivnnecrweke', // پسورد ایمیل شما
    },
});

export const sSenEmail = async (req, res) => {

    console.log('hello world');


    const user = await userModel.find({ role: 'USER' })

    let emails = ''
    user.forEach(user => {

        emails = emails + user.email + ','

    })
    console.log(emails);



    const recipients = emails.split(',')
    console.log(recipients);



    const { subject, text } = req.body;

    if (!subject || !text) {
        return res.status(400).json({ message: 'لطفاً تمام فیلدها را پر کنید.' });
    }

    const mailOptions = {
        from: 'nwbharamyrrda330@gmail.com', // ایمیل فرستنده
        to: recipients, // ایمیل گیرنده
        subject, // موضوع ایمیل
        text, // متن ایمیل
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'ایمیل با موفقیت ارسال شد.' });
    } catch (error) {
        console.error('خطا در ارسال ایمیل:', error);
        res.status(500).json({ message: 'خطا در ارسال ایمیل.' });
    }

}

export const tSenEmail = async (req, res) => {

    console.log('hello world');


    const user = await userModel.find({ role: 'TEACHER' })

    let emails = ''
    user.forEach(user => {

        emails = emails + user.email + ','

    })
    console.log(emails);



    const recipients = emails.split(',')
    console.log(recipients);



    const { subject, text } = req.body;

    if (!subject || !text) {
        return res.status(400).json({ message: 'لطفاً تمام فیلدها را پر کنید.' });
    }

    const mailOptions = {
        from: 'nwbharamyrrda330@gmail.com', // ایمیل فرستنده
        to: recipients, // ایمیل گیرنده
        subject, // موضوع ایمیل
        text, // متن ایمیل
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'ایمیل با موفقیت ارسال شد.' });
    } catch (error) {
        console.error('خطا در ارسال ایمیل:', error);
        res.status(500).json({ message: 'خطا در ارسال ایمیل.' });
    }

}



export const uploadFile = async (req, res) => {
    const { filename, path } = req.file;

    if (!body || !filename || !path) {
        return res.status(400).json({ message: 'لطفاً تمام فیلدها را پر کنید.' });
    }

    try {

        res.status(201).json({ message: 'فایل با موفقیت آپلود شد.', file });
    } catch (error) {
        console.error('خطا در آپلود فایل:', error);
        res.status(500).json({ message: 'خطا در سرور.' });
    }
};





export const deleteFile = async (req, res) => {
    const { id } = req.params;

    try {
        const file = await teacherFileModel.findById(id);
        if (!file) {
            return res.status(404).json({ message: 'فایل مورد نظر پیدا نشد.' });
        }


        console.log(file.filename);

        const params = {
            Bucket: process.env.LIARA_BUCKET_NAME,
            Key: file.filename
        };

        // async/await
        try {
            await client.send(new DeleteObjectCommand(params));
            await teacherFileModel.findByIdAndDelete(id);
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
        console.error('خطا در حذف فایل:', error);
        res.status(500).json({ message: 'خطا در سرور.' });
    }
};




export const getTeacherFiles = async (req, res) => {

    const userID = req.user._id


    const files = await teacherFileModel.find({ userID })


    if (!files) {
        return res.status(400).json({ message: 'هیچ فایلی وجود ندارد' })
    }
    res.json(files)

}



export const getTeachers = async (req, res) => {

    const teachers = await userModel.find({ role: 'TEACHER' })

    if (!teachers) {
        return res.status(400).json({ message: 'اساتید وجود ندارند' })
    }
    res.json(teachers)

}






export const teacherData = async (req, res) => {
    console.log('hell oskacjn');


    const teacherID = req.params.id

    const teacherData = await userModel.findOne({ _id: teacherID }).lean()

    if (!teacherData) {
        return res.status(400).json({ message: 'اساتید وجود ندارند' })
    }
    res.json(teacherData)

}




