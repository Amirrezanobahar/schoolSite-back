import { model as adminMessageModel } from "../../models/AdminMessage.js"

export const create = async (req, res) => {

    if (req.user.role !== 'ADMIN'){
        return res.status(403).json({ message: 'شما مجاز به انجام این کار نیستید' });
    }
        const { title, body, fore } = req.body


    const adminMessage = await adminMessageModel.create({
        title,
        body,
        fore
    })
    if (!adminMessage) {
        return res.status(400).json({ message: "Failed to create admin message" })
    }
    res.send({ message: ' پیام با موفقیت ایجاد شد' })
}