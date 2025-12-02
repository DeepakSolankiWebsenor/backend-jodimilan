import { Router } from 'express';
import { CartController } from '../controllers/cart/cart.controller';
import { CouponController } from '../controllers/coupon/coupon.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Cart management
router.post('/Add-Cart', CartController.addToCart);

// Price checking
router.post('/Check-Price', CartController.checkPrice);

// Coupon management
router.post('/Apply-Coupon', CouponController.applyCoupon);

export default router;
