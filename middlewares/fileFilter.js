// لیست فرمت‌های مجاز
const allowedFormats = ['application/pdf', 'image/jpeg', 'image/png','image/jpg'];

// فیلتر برای بررسی فرمت فایل
export const fileFilter = (req, file, cb) => {
  if (allowedFormats.includes(file.mimetype)) {
    cb(null, true); // قبول فایل
  } else {
    cb(new Error('فرمت فایل مجاز نیست.'), false); // رد فایل
  }
};