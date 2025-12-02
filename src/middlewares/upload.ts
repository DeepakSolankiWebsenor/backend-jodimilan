import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/app';
import { Helper } from '../utils/helper';

// Ensure upload directory exists
const uploadDir = config.upload.directory;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Helper.makeRandomString(8)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize, // 5MB
  },
  fileFilter,
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) =>
  upload.array(fieldName, maxCount);

// Middleware for multiple fields
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);
