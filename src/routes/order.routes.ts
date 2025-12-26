import { Router } from 'express';
import { OrderController } from '../controllers/order/order.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Standard order routes (matches Laravel exactly)
router.post('/Order-Create', OrderController.createOrder);
router.post('/Order-Checkout', OrderController.orderCheckout);
router.get('/My-Orders', OrderController.getMyOrders);
router.get('/OrderByid/:id', OrderController.getOrderById);
router.post('/Order-Status-change', OrderController.changeOrderStatus);
router.post('/order/generate-order-id', OrderController.generateOrderId);
router.get('/all-orders', OrderController.getAllOrders);
router.get('/ordersByStatus/:status', OrderController.getOrdersByStatus);
router.get('/payment-gateway', OrderController.getPaymentGateways);

// User-prefixed order routes (alternative paths)
router.post('/user/order/create', OrderController.createOrder);
router.post('/user/order/Checkout', OrderController.orderCheckout);
router.get('/user/order/history', OrderController.getOrderHistory);
router.get('/user/order/details/:orderNumber', OrderController.getOrderByNumber);
router.post('/user/plansuscribe', OrderController.subscribePackage);

export default router;
