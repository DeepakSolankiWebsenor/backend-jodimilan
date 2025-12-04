import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { Session, Chat, User } from '../../models';
import { Op } from 'sequelize';
import { getSocketServer } from '../../socket';

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
      include: [
        'user1', 
        'user2',
        {
          model: Chat,
          as: 'lastMessage',
          required: false,
        },
      ],
      order: [['last_message_at', 'DESC']],
    });

    // Format response with only friend data (not current user)
    const friendsList = await Promise.all(
      sessions.map(async (session) => {
        const sessionData = session.toJSON() as any;
        
        // Determine which user is the friend (not the current user)
        // If current user is user1, then friend is user2
        // If current user is user2, then friend is user1
        const friendUser = sessionData.user1_id === req.userId! 
          ? sessionData.user2   // Current user is user1, so friend is user2
          : sessionData.user1;  // Current user is user2, so friend is user1
        
        console.log('DEBUG - Session:', {
          sessionId: sessionData.id,
          user1_id: sessionData.user1_id,
          user1_name: sessionData.user1?.name,
          user2_id: sessionData.user2_id,
          user2_name: sessionData.user2?.name,
          currentUserId: req.userId,
          selectedFriendId: friendUser?.id,
          selectedFriendName: friendUser?.name
        });
        
        const unreadCount = await Chat.count({
          where: {
            session_id: session.id,
            to_user_id: req.userId!,
            is_read: false,
          },
        });

        return {
          id: sessionData.id,
          user1_id: sessionData.user1_id,
          user2_id: sessionData.user2_id,
          block: sessionData.block,
          last_message_id: sessionData.last_message_id,
          last_message_at: sessionData.last_message_at,
          typing_users: sessionData.typing_users,
          created_at: sessionData.created_at,
          updated_at: sessionData.updated_at,
          lastMessage: sessionData.lastMessage,
          unreadCount,
          // Only include the friend's user data
          friend: friendUser,
        };
      })
    );

    return ResponseHelper.success(res, 'Friends retrieved', friendsList);
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
    const { message, message_type = 'text', reply_to } = req.body;
    console.log("BODY:", req.body);

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
      status: 'sent',
      reply_to: reply_to || undefined,
    });

    // Update session last message
    sessionData.last_message_id = chat.id;
    sessionData.last_message_at = new Date();
    await sessionData.save();

    // Fetch complete message with relations
    const completeMessage = await Chat.findByPk(chat.id, {
      include: ['fromUser', 'toUser', 'replyToMessage'],
    });

    // Emit real-time event via Socket.IO - ONLY to recipient, not sender
    const socketServer = getSocketServer();
    if (socketServer) {
      const messageData = {
        ...completeMessage?.toJSON(),
        session_id: Number(session),
      };
      
      console.log('📤 Emitting message:new to session:', session, 'Message ID:', chat.id);
      
      // Emit to the entire session room (both users will receive it)
      // Frontend will filter out sender's own message
      socketServer.getIO().to(`session:${session}`).emit('message:new', messageData);
    }

    return ResponseHelper.success(res, 'Message sent', completeMessage);
  });

  // POST /api/user/session/:session/read - Mark messages as read
  static markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { session } = req.params;

    const readAt = new Date();

    // Update all unread messages where current user is the recipient
    const [updatedCount] = await Chat.update(
      { 
        is_read: true,
        status: 'read',
        read_at: readAt,
      },
      { 
        where: { 
          session_id: session, 
          to_user_id: req.userId!, 
          is_read: false 
        } 
      }
    );

    console.log(`📖 Marked ${updatedCount} messages as read in session ${session} for user ${req.userId}`);

    // Emit read receipt via Socket.IO to notify the sender
    if (updatedCount > 0) {
      const socketServer = getSocketServer();
      if (socketServer) {
        const readReceiptData = {
          sessionId: Number(session),
          userId: req.userId!,
          readAt: readAt,
        };
        
        console.log('📤 Emitting messages:read event:', readReceiptData);
        
        socketServer.getIO().to(`session:${session}`).emit('messages:read', readReceiptData);
      }
    }

    return ResponseHelper.success(res, 'Messages marked as read', { updatedCount });
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
