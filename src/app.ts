import express, { Application, Request, Response } from 'express';
import routes from "./routes";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { config } from './config/app';
import { errorHandler } from './middlewares/errorHandler';
import rateLimit from 'express-rate-limit';
import { OrderController } from './controllers/order/order.controller';

const app: Application = express();

/* ================= TRUST PROXY (🔥 FIX) ================= */
app.set('trust proxy', 1);

/* ================= WEBHOOK ================= */
// Webhook MUST come BEFORE express.json()
app.post(
  "/api/webhook/razorpay",
  express.raw({ type: "application/json" }),
  OrderController.paymentWebhook
);

/* ================= SECURITY ================= */
app.use(helmet());

/* ================= CORS ================= */
app.use(cors({
  origin: true,
  credentials: true,
}));

/* ================= RATE LIMIT ================= */
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api/', limiter);

/* ================= BODY PARSERS ================= */
// AFTER webhook
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ================= COMPRESSION ================= */
app.use(compression());

/* ================= LOGGING ================= */
if (config.app.env !== 'test') {
  app.use(morgan('combined'));
}

/* ================= STATIC ================= */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

/* ================= HEALTH ================= */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* ================= ROUTES ================= */
app.use('/api', routes);

/* ================= 404 ================= */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    success: false,
    message: 'Route not found',
  });
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

export default app;
