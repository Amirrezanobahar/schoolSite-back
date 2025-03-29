import { app } from './app.js';
import mongoose from 'mongoose'




const db = () => {

    mongoose.connect('mongodb://root:GS7iMmD8JT5yzaQxMcHWbzd2@kamet.liara.cloud:31121/my-app?authSource=admin')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));
}
db()




app.listen(3000, () => {
    console.log("Server is running on port 3000");
})