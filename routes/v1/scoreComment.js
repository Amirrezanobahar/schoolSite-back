import express from 'express';
import { create,allComments } from '../../controllers/scoreComment.js';
import { auth } from '../../middlewares/auth.js';


export const router = express.Router()


router.route('/teacher/rate/:teacherId')
    .post(auth, create)

router.route('/comments/').get(auth, allComments)

