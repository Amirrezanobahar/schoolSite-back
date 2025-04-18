import multer from 'multer';
import path from 'path';

// تنظیمات Multer برای ذخیره‌سازی موقت فایل‌ها
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'renamed-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

export default upload.single('file');