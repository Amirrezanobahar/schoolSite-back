import express from 'express';
import { auth } from '../../middlewares/auth.js';
import { role ,userData} from '../../controllers/v1/auth.js';

 export const router = express.Router()

router.route('/').get(auth,userData)
router.route('/role').post(auth,role)
