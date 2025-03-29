import express from 'express';
import { auth } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/uploadProfile.js';
import { uploadProfile ,getAllData,adminMessage} from '../../controllers/v1/teacher.js';
import uploadMiddleware from '../../middlewares/uploadMiddleware.js';


export const router = express.Router()


router.route('/setProfile')
    .post(auth,uploadMiddleware, uploadProfile)

    router.get('/get/teachers/:teacherId',getAllData)

    router.get('/adminMessage',adminMessage)



