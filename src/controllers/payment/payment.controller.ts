import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { Order, PaymentOrder } from '../../models';
import { config } from '../../config/app';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export class PaymentController {
  // POST /api/user/razorpay-create-order - Create Razorpay order
  static createRazorpayOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { order_id, amount } = req.body;

    const order = await Order.findOne({
      where: { id: order_id, user_id: req.userId! },
    });

    if (!order) {
      return ResponseHelper.notFound(res, 'Order not found');
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: order.order_number || `receipt_${order.id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment order
    const paymentOrder = await PaymentOrder.create({
      order_id: order.id,
      payment_order_id: razorpayOrder.id,
      payment_gateway_type: 'Razorpay',
      amount,
      status: 'Unpaid',
      payment_order_response: razorpayOrder,
    });

    return ResponseHelper.success(res, 'Razorpay order created', {
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: config.razorpay.keyId,
    });
  });

  // POST /api/user/razorpay-verify-payment - Verify Razorpay payment
  static verifyRazorpayPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return ResponseHelper.error(res, 'Invalid payment signature', 400);
    }

    // Update payment order
    const paymentOrder = await PaymentOrder.findOne({
      where: { payment_order_id: razorpay_order_id },
    });

    if (!paymentOrder) {
      return ResponseHelper.notFound(res, 'Payment order not found');
    }

    paymentOrder.status = 'Paid';
    paymentOrder.transaction_id = razorpay_payment_id;
    await paymentOrder.save();

    // Update order status
    await Order.update(
      { payment_status: 'Paid', status: 'Completed' },
      { where: { id: paymentOrder.order_id } }
    );

    return ResponseHelper.success(res, 'Payment verified successfully');
  });

  // GET /api/razorpay-callback - Razorpay callback
  static razorpayCallback = asyncHandler(async (req: AuthRequest, res: Response) => {
    return res.send('<h1>Payment Successful! You can close this window.</h1>');
  });

  // POST /api/user/cc-avenue-create-order - Create CCAvenue order
  static createCCAvenueOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { order_id, amount } = req.body;

    const order = await Order.findOne({
      where: { id: order_id, user_id: req.userId! },
    });

    if (!order) {
      return ResponseHelper.notFound(res, 'Order not found');
    }

    // Save payment order
    const paymentOrder = await PaymentOrder.create({
      order_id: order.id,
      payment_gateway_type: 'CCAvenue',
      amount,
      status: 'Unpaid',
    });

    // In real implementation, encrypt data for CCAvenue
    return ResponseHelper.success(res, 'CCAvenue order created', {
      merchant_id: config.ccavenue.merchantId,
      access_code: config.ccavenue.accessCode,
      redirect_url: config.ccavenue.redirectUrl,
      cancel_url: config.ccavenue.cancelUrl,
      order_id: order.id,
      amount,
    });
  });

  // GET /api/payment-gateway - Get active payment gateways
  static getPaymentGateways = asyncHandler(async (req: AuthRequest, res: Response) => {
    const gateways = [
      { name: 'Razorpay', type: 'Razorpay', status: 'Active' },
      { name: 'CCAvenue', type: 'CCAvenue', status: 'Active' },
    ];

    return ResponseHelper.success(res, 'Payment gateways retrieved', gateways);
  });
}
