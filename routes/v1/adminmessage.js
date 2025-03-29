import express from 'express'
// import { create } from './../../controllers/v1/adminMessage.js'
import { auth } from '../../middlewares/auth.js'

export const router = express.Router()

// router.post('/',auth,create)