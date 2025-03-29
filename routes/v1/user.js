import express from 'express';
import { register, login, getAllStudents, getAllTeachers, upToTeacher,teacherData, deleteFile, upToUser, sSenEmail, tSenEmail, getTeacherFiles,getTeachers, uploadFile, ban, unBan } from '../../controllers/v1/user.js';
import { auth } from '../../middlewares/auth.js';
import multer from 'multer';
import { upload } from '../../middlewares/uploadFile.js';
import uploadController from './../../middlewares/uploadController.js';
import uploadMiddleware from '../../middlewares/uploadMiddleware.js';

export const router = express.Router()

// router.route('/').get(getAll)

router.post('/register', register)
router.post('/login', login)
router.post('/students/senEmail', sSenEmail)
router.post('/teachers/senEmail', tSenEmail)
router.post('/teachers/uploadFile', auth, uploadMiddleware, uploadController)
router.get('/teachers/files', auth, getTeacherFiles)
router.get('/get/teachers',getTeachers)
router.get('/get/teachers/:id',teacherData)
router.delete('/teachers/files/:id', auth, deleteFile)
router.get('/students', getAllStudents)
router.get('/teachers', getAllTeachers)
router.put('/upToTeacher', upToTeacher)
router.put('/upToUser', upToUser)
router.put('/ban', ban)
router.put('/unBan', unBan)
