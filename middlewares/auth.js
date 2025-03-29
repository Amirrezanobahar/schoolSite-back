import jwt from 'jsonwebtoken'
import { model as userModel } from '../models/user.js'


export const auth = async (req, res, next) => {


    const authHeader = req.header('Authorization')

    if (!authHeader) {

        return res.status(403).json({
            message: 'these route is protected and you can not  have access to it '
        })
    }

    const token = authHeader;

    try {
        const jwtPayload = jwt.verify(token, process.env.SecretKey)



        const user = await userModel.findById(jwtPayload.id)

        Reflect.deleteProperty(user, 'password')
        req.user = user
        next();
    } catch (err) {
        return res.json(err)
    }
}