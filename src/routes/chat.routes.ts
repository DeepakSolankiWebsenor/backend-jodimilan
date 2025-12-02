import { Router } from 'express';
import { ChatController } from '../controllers/chat/chat.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// One-to-one chat routes (standard paths)
router.post('/session/create', ChatController.createSession);
router.get('/customer/chat/list', ChatController.getCustomerChatList);
router.post('/getFriends', ChatController.getFriends);
router.post('/session/:session/chats', ChatController.getMessages);
router.post('/session/:session/read', ChatController.markAsRead);
router.post('/session/:session/clear', ChatController.clearChat);
router.post('/session/:session/block', ChatController.blockUser);
router.post('/session/:session/unblock', ChatController.unblockUser);
router.post('/send/:session', ChatController.sendMessage);

// Order-chat routes
router.get('/orderChat/list', ChatController.getOrderChatList);
router.post('/order-session/create', ChatController.createOrderSession);
router.post('/order-session/:id/chats', ChatController.getOrderChats);
router.post('/order-session/:id/read', ChatController.markOrderChatRead);
router.post('/order-session/send/:id', ChatController.sendOrderChat);
router.post('/order-session/:session/clear', ChatController.clearOrderChat);

// User-prefixed routes (alternative paths)
router.post('/user/session/create', ChatController.createSession);
router.post('/user/getFriends', ChatController.getFriends);
router.post('/user/session/:session/chats', ChatController.getMessages);
router.post('/user/send/:session', ChatController.sendMessage);
router.post('/user/session/:session/read', ChatController.markAsRead);
router.post('/user/session/:session/clear', ChatController.clearChat);
router.post('/user/session/:session/block', ChatController.blockUser);
router.post('/user/session/:session/unblock', ChatController.unblockUser);

export default router;
