import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
// import path from 'path'
import { fileURLToPath } from 'url';
// const path = '/uploads'; // استفاده از مسیر موقت
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { router as user } from './routes/v1/user.js'
import { router as auth } from './routes/v1/auth.js';
import { router as scoreComment } from './routes/v1/scoreComment.js';
import { router as teacher } from './routes/v1/teacher.js';
import { router as student } from './routes/v1/student.js';
import { router as event } from './routes/v1/event.js';
import { router as adminMessage } from './routes/v1/adminmessage.js';

// import fs from 'fs'

// if (!fs.existsSync(path)) {
//     console.log('hello world');

//     fs.mkdirSync(path, { recursive: true });
// }

export const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(__dirname+ '/uploads'));

app.use('/v1/user', user)

app.use('/v1/auth', auth)

app.use('/v1/scoreComment', scoreComment)

app.use('/v1/teacher', teacher)

app.use('/v1/student', student)

app.use('/v1/event', event)

app.use('/v1/adminMessage', adminMessage)
