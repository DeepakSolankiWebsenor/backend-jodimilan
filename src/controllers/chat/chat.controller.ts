import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { Session, Chat, User } from '../../models';
import { Op } from 'sequelize';

export class ChatController {
  // POST /api/user/session/create - Create or get chat session
  static createSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { user_id } = req.body;

    let session = await Session.findOne({
      where: {
        [Op.or]: [
          { user1_id: req.userId!, user2_id: user_id },
          { user1_id: user_id, user2_id: req.userId! },
        ],
      },
    });

    if (!session) {
      session = await Session.create({
        user1_id: req.userId!,
        user2_id: user_id,
        block: {},
      });
    }

    return ResponseHelper.success(res, 'Session created', session);
  });

  // POST /api/user/getFriends - Get friends list for chat
  static getFriends = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sessions = await Session.findAll({
      where: {
        [Op.or]: [{ user1_id: req.userId! }, { user2_id: req.userId! }],
      },
      include: ['user1', 'user2'],
    });

    return ResponseHelper.success(res, 'Friends retrieved', sessions);
  });

  // POST /api/user/session/:session/chats - Get chat messages
  static getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { session } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const { count, rows } = await Chat.findAndCountAll({
      where: { session_id: session },
      include: ['fromUser', 'toUser'],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    return ResponseHelper.paginated(res, 'Messages retrieved', rows, count, Number(page), Number(limit));
  });

  // POST /api/user/send/:session - Send message
  static sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { session } = req.params;
    const { message, message_type = 'text' } = req.body;

    const sessionData = await Session.findByPk(session);
    if (!sessionData) {
      return ResponseHelper.notFound(res, 'Session not found');
    }

    const toUserId = sessionData.user1_id === req.userId! ? sessionData.user2_id : sessionData.user1_id;

    const chat = await Chat.create({
      session_id: Number(session),
      from_user_id: req.userId!,
      to_user_id: toUserId,
      message,
      message_type,
      is_read: false,
    });

    return ResponseHelper.success(res, 'Message sent', chat);
  });

  // POST /api/user/session/:session/read - Mark messages as read
  static markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { session } = req.params;

    await Chat.update(
      { is_read: true },
      { where: { session_id: session, to_user_id: req.userId!, is_read: false } }
    );

    return ResponseHelper.success(res, 'Messages marked as read');
  });

  // POST /api/user/session/:session/clear - Clear chat
  static clearChat = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { session } = req.params;
    await Chat.destroy({ where: { session_id: session } });
    return ResponseHelper.success(res, 'Chat cleared');
  });

  // POST /api/user/session/:session/block - Block user in chat
  static blockUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { session } = req.params;

    const sessionData = await Session.findByPk(session);
    if (!sessionData) {
      return ResponseHelper.notFound(res, 'Session not found');
    }

    const block = sessionData.block || {};
    block[req.userId!] = true;
    sessionData.block = block;
    await sessionData.save();

    return ResponseHelper.success(res, 'User blocked');
  });

  // POST /api/user/session/:session/unblock - Unblock user in chat
  static unblockUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { session } = req.params;

    const sessionData = await Session.findByPk(session);
    if (!sessionData) {
      return ResponseHelper.notFound(res, 'Session not found');
    }

    const block = sessionData.block || {};
    block[req.userId!] = false;
    sessionData.block = block;
    await sessionData.save();

    return ResponseHelper.success(res, 'User unblocked');
  });

  // GET /api/customer/chat/list - Get customer chat list
  static getCustomerChatList = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sessions = await Session.findAll({
      where: {
        [Op.or]: [{ user1_id: req.userId! }, { user2_id: req.userId! }],
      },
      include: ['user1', 'user2'],
      order: [['updated_at', 'DESC']],
    });

    return ResponseHelper.success(res, 'Chat list retrieved', sessions);
  });

  // GET /api/orderChat/list - Get order chat list
  static getOrderChatList = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement order chat list logic
    // - Get all order-related chat sessions for the user
    return ResponseHelper.success(res, 'Order chat list retrieved', []);
  });

  // POST /api/order-session/create - Create order chat session
  static createOrderSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { order_id, vendor_id } = req.body;

    // TODO: Implement order session creation logic
    // - Create or retrieve order-specific chat session
    // - Link with order ID and vendor

    return ResponseHelper.success(res, 'Order session created', {});
  });

  // POST /api/order-session/:id/chats - Get order chat messages
  static getOrderChats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // TODO: Implement order chat messages retrieval
    // Similar to regular chat but filtered by order session

    return ResponseHelper.success(res, 'Order chats retrieved', {
      chats: [],
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: 0,
      },
    });
  });

  // POST /api/order-session/:id/read - Mark order chat as read
  static markOrderChatRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // TODO: Implement mark order chat as read
    // - Update is_read status for order chat messages

    return ResponseHelper.success(res, 'Order chat marked as read');
  });

  // POST /api/order-session/send/:id - Send order chat message
  static sendOrderChat = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { message, message_type = 'text' } = req.body;

    // TODO: Implement send order chat message
    // - Create new order chat message
    // - Send notification to recipient

    return ResponseHelper.success(res, 'Order chat message sent', {});
  });

  // POST /api/order-session/:session/clear - Clear order chat
  static clearOrderChat = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { session } = req.params;

    // TODO: Implement clear order chat
    // - Delete order chat messages for session

    return ResponseHelper.success(res, 'Order chat cleared');
  });
}
