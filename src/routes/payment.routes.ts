import { Router } from 'express';
import { PaymentController } from '../controllers/payment/payment.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';

const router = Router();

// Authenticated routes
router.post('/user/razorpay-create-order', authenticate, PaymentController.createRazorpayOrder);
router.post('/user/razorpay-verify-payment', authenticate, PaymentController.verifyRazorpayPayment);
router.post('/user/cc-avenue-create-order', authenticate, PaymentController.createCCAvenueOrder);

// Public routes
router.get('/razorpay-callback', PaymentController.razorpayCallback);
router.get('/payment-gateway', optionalAuth, PaymentController.getPaymentGateways);

export default router;
