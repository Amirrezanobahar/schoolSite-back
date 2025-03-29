import { storage } from './fileStroage.js';
import { fileFilter } from './fileFilter.js';
import multer from 'multer';

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
