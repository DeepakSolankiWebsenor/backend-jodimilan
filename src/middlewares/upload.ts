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
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

// Configure S3 Client
const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Configure storage
const storage = multerS3({
  s3: s3,
  bucket: config.aws.bucketName,
  metadata: (req: any, file: any, cb: any) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req: any, file: any, cb: any) => {
    const uniqueSuffix = `${Date.now()}-${Helper.makeRandomString(8)}`;
    const ext = path.extname(file.originalname);
    cb(null, `uploads/${file.fieldname}-${uniqueSuffix}${ext}`);
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
