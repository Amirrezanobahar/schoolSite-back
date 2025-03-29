import express from 'express';
import { auth } from '../../middlewares/auth.js';
import { create,allData,remove} from '../../controllers/v1/event.js';

import uploadController from './../../middlewares/uploadController.js';
import uploadMiddleware from '../../middlewares/uploadMiddleware.js';


export const router = express.Router()


router.route('/').post(uploadMiddleware,create)
router.route('/data').get(allData)
router.route('/data/:fileId').delete(remove)


