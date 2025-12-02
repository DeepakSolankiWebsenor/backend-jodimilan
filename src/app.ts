import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { config } from './config/app';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import rateLimit from 'express-rate-limit';
import { OrderController } from './controllers/order/order.controller'; // ADD THIS

const app: Application = express();

// Webhook MUST come BEFORE express.json()
app.post(
  "/api/webhook/razorpay",
  express.raw({ type: "application/json" }),
  OrderController.paymentWebhook
);

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api/', limiter);

// Body parsers (AFTER webhook)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.app.env !== 'test') {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
