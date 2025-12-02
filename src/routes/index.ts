import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import chatRoutes from './chat.routes';
import commonRoutes from './common.routes';
import customerRoutes from './customer.routes';
import cartRoutes from './cart.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Public routes (mounted at root level)
router.use('/', commonRoutes);
router.use('/', paymentRoutes);

// Customer prefix routes
router.use('/customer', customerRoutes);

// Auth routes
router.use('/auth', authRoutes);

// User routes (Royal Thikana/Jodi Milan specific)
router.use('/user', userRoutes);

// Authenticated routes
router.use('/', orderRoutes);
router.use('/', cartRoutes);
router.use('/', chatRoutes);
router.use('/', notificationRoutes);

export default router;
