import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    name: process.env.APP_NAME || 'Jodi_Milan',
    env: process.env.APP_ENV || 'development',
    port: parseInt(process.env.APP_PORT || '3001', 10),
    url: process.env.APP_URL || 'http://localhost:3001',
  },
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'matrimonial',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: (process.env.DB_DIALECT || 'mysql') as 'mysql',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '14d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
    iv: process.env.ENCRYPTION_IV || 'your-16-char-iv!',
  },
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
    length: parseInt(process.env.OTP_LENGTH || '6', 10),
  },
  sms: {
    gatewayUrl: process.env.SMS_GATEWAY_URL || '',
    username: process.env.SMS_USERNAME || '',
    password: process.env.SMS_PASSWORD || '',
    senderId: process.env.SMS_SENDER_ID || 'JODMLN',
    route: process.env.SMS_ROUTE || '4',
  },
  email: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || '',
    fromAddress: process.env.MAIL_FROM_ADDRESS || 'noreply@jodimilan.com',
    fromName: process.env.MAIL_FROM_NAME || 'Jodi_Milan',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKeyPath: process.env.FIREBASE_PRIVATE_KEY_PATH || '',
    databaseUrl: process.env.FIREBASE_DATABASE_URL || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  ccavenue: {
    merchantId: process.env.CCAVENUE_MERCHANT_ID || '',
    workingKey: process.env.CCAVENUE_WORKING_KEY || '',
    accessCode: process.env.CCAVENUE_ACCESS_CODE || '',
    redirectUrl: process.env.CCAVENUE_REDIRECT_URL || '',
    cancelUrl: process.env.CCAVENUE_CANCEL_URL || '',
  },
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
    directory: process.env.UPLOAD_DIR || './uploads',
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png').split(','),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

export default config;
