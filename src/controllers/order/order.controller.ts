import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { Order, Package, User, PackagePayment } from '../../models';
import { Helper } from '../../utils/helper';
import moment from 'moment';
import Razorpay from "razorpay";
import { PaymentOrder } from '../../models/PaymentOrder';


export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


export class OrderController {
  // POST /api/user/order/create - Create order

  static createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { package_id, total } = req.body;

  const orderNumber = Helper.generateOrderNumber();

  const order = await Order.create({
    user_id: req.userId,
    package_id,
    order_number: orderNumber,
    total,
    netamount: total,
    status: "Pending",
    payment_status: "Unpaid",
  });

  // Razorpay Order
  const razorpayOrder = await razorpay.orders.create({
    amount: total * 100,
    currency: "INR",
    receipt: orderNumber,
  });

  order.razorpay_order_id = razorpayOrder.id;
  await order.save();

  return ResponseHelper.success(res, "Order created successfully", {
    order_number: order.order_number,
    razorpay_order_id: razorpayOrder.id,
    total: order.total,
    name: req.user?.full_name,
    email: req.user?.email,
    phone: req.user?.phone,
  }, 200);
});





  // POST /api/user/order/Checkout - Checkout order
  static checkout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { order_id } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order || order.user_id !== req.userId!) {
      return ResponseHelper.notFound(res, 'Order not found');
    }

    return ResponseHelper.success(res, 'Proceed to payment', { order });
  });

  // GET /api/user/order/history - Get order history
  static getOrderHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20 } = req.query;

  const { count, rows } = await Order.findAndCountAll({
  where: { user_id: req.userId! },
  include: [
    { model: Package, as: 'package' },
    { model: PaymentOrder, as: 'paymentOrder' }
  ],
  order: [['created_at', 'DESC']],
  limit: Number(limit),
  offset: (Number(page) - 1) * Number(limit),
});


    return ResponseHelper.paginated(res, 'Order history retrieved', rows, count, Number(page), Number(limit));
  });

  // POST /api/user/plansuscribe - Subscribe to package
  static subscribePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { package_id, order_id } = req.body;

    const pkg = await Package.findByPk(package_id);
    if (!pkg) {
      return ResponseHelper.notFound(res, 'Package not found');
    }

    const user = await User.findByPk(req.userId!);
    if (!user) {
      return ResponseHelper.notFound(res, 'User not found');
    }

    // Update user package
    const startDate = new Date();
    const endDate = moment(startDate).add(pkg.package_duration, 'days').toDate();

    user.pacakge_id = pkg.id;
    user.pacakge_expiry = endDate;
    // user.total_profile_view_count = pkg.total_profile_view;
    await user.save();

    // Create package payment record
    await PackagePayment.create({
      user_id: user.id,
      package_id: pkg.id,
      start_date: startDate,
      end_date: endDate,
      // amount: pkg.price,
      status: 'Active',
    });

    // Update order status
    if (order_id) {
      await Order.update(
        { status: 'Completed', payment_status: 'Paid' },
        { where: { id: order_id } }
      );
    }

    return ResponseHelper.success(res, 'Package subscribed successfully');
  });

  // GET /api/My-Orders - Get all orders (alternative endpoint)
  static getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const orders = await Order.findAll({
      where: { user_id: req.userId! },
      include: ['package'],
      order: [['created_at', 'DESC']],
    });

    return ResponseHelper.success(res, 'Orders retrieved', orders);
  });

  // GET /api/OrderByid/:id - Get order by ID
  static getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.userId! },
      include: ['package', 'paymentOrder'],
    });

    if (!order) {
      return ResponseHelper.notFound(res, 'Order not found');
    }

    return ResponseHelper.success(res, 'Order retrieved', order);
  });

  // POST /api/Order-Status-change - Change order status
  static changeOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { order_id, status } = req.body;

    const order = await Order.findOne({
      where: { id: order_id, user_id: req.userId! },
    });

    if (!order) {
      return ResponseHelper.notFound(res, 'Order not found');
    }

    order.status = status;
    await order.save();

    return ResponseHelper.success(res, 'Order status updated');
  });

  // POST /api/Order-Checkout - Order checkout (alias)
  static orderCheckout = OrderController.checkout;

  // POST /api/order/generate-order-id - Generate order ID
  static generateOrderId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const orderNumber = Helper.generateOrderNumber();
    return ResponseHelper.success(res, 'Order ID generated', { order_number: orderNumber });
  });

  // GET /api/all-orders - Get all orders (admin)
  static getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20 } = req.query;

    const { count, rows } = await Order.findAndCountAll({
      include: ['package', 'user'],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    return ResponseHelper.paginated(res, 'All orders retrieved', rows, count, Number(page), Number(limit));
  });

  // GET /api/ordersByStatus/:status - Get orders by status
  static getOrdersByStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { count, rows } = await Order.findAndCountAll({
      where: { status },
      include: ['package', 'user'],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    return ResponseHelper.paginated(res, `Orders with status ${status} retrieved`, rows, count, Number(page), Number(limit));
  });

  // GET /api/payment-gateway - Get payment gateway configuration
  static getPaymentGateways = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Return available payment gateways from config
    return ResponseHelper.success(res, 'Payment gateways retrieved', {
      razorpay: {
        enabled: true,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
      ccavenue: {
        enabled: true,
      },
    });
  });


// ENDPOINT FOR RAZORPAY WEBHOOK

static paymentWebhook = asyncHandler(async (req: any, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers["x-razorpay-signature"];

    const crypto = require("crypto");
    const expected = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (expected !== signature) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ status: "Failed", message: "Invalid signature" });
    }

    const data = JSON.parse(req.body.toString());
    console.log("WEBHOOK RECEIVED ==> ", data.event);

    const payment = data.payload.payment.entity;
    const razorpay_order_id = payment.order_id;
    const razorpay_payment_id = payment.id;

    const order = await Order.findOne({ where: { razorpay_order_id } });

    if (!order) {
      console.error("Order not found in DB");
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order payment status
    order.payment_status = "Paid";
    order.status = "Completed";
    order.razorpay_payment_id = razorpay_payment_id;
    await order.save();

    const pkg = await Package.findByPk(order.package_id);
    const user = await User.findByPk(order.user_id);

    if (pkg && user) {
      const startDate = new Date();
      const endDate = moment(startDate).add(pkg.package_duration, "days").toDate();

      user.pacakge_id = pkg.id;
      user.pacakge_expiry = endDate;
      await user.save();

      // Save payment record properly
      await PackagePayment.create({
        user_id: user.id,
        order_id: order.id,
        package_id: pkg.id,
        start_date: startDate,
        end_date: endDate,
        amount: order.total,
        status: "Active",
        payment_data: data
      });

      console.log("🎉 Subscription Activated!");
    }

    return res.status(200).json({ status: "success" });

  } catch (err) {
    console.error("Webhook error", err);
    return res.status(500).json({ status: "error" });
  }
});



}
