import express from 'express';
import { auth } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/uploadProfile.js';
import { create, remove, allData,studentInfo,changeName,changePassword } from '../../controllers/v1/student.js';

import uploadMiddleware from '../../middlewares/uploadMiddleware.js';

export const router = express.Router()


// router.post('/data',upload, create)
router.route('/data/:fileId').delete(remove)
router.route('/data').post(auth,uploadMiddleware, create)
router.route('/data').get(allData)
router.route('/').get(auth, studentInfo)
router.route('/changeName').put(auth, changeName)
router.route('/changePassword').put(auth, changePassword)

