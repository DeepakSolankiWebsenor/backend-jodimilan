import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/app';
import { UserPresence, Chat, Session } from './models';
import { Op } from 'sequelize';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  activeSessions?: Set<number>; // Track which sessions this socket has joined
}

interface TypingData {
  sessionId: number;
  userId: number;
  userName: string;
}

interface MessageData {
  sessionId: number;
  messageId: number;
  fromUserId: number;
  toUserId: number;
}

export class SocketServer {
  private io: Server;

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };
        socket.userId = decoded.userId;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', async (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      console.log(`✅ User ${userId} connected with socket ${socket.id}`);

      // Update user presence
      await this.updateUserPresence(userId, socket.id, true);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Notify friends that user is online
      await this.notifyFriendsOnlineStatus(userId, true);

      // Handle joining chat sessions with validation
      socket.on('join:session', async (sessionId: number) => {
        try {
          // 🔒 SECURITY: Validate user is a participant in this session
          const session = await Session.findByPk(sessionId);
          
          if (!session) {
            console.error(`❌ Session ${sessionId} not found`);
            socket.emit('error', { message: 'Session not found' });
            return;
          }

          // Check if user is participant (user1 or user2)
          const isParticipant = session.user1_id === userId || session.user2_id === userId;
          
          if (!isParticipant) {
            console.error(`🚨 SECURITY: User ${userId} attempted to join session ${sessionId} they're not part of!`);
            socket.emit('error', { message: 'Unauthorized: You are not a participant in this session' });
            return;
          }

          // Initialize activeSessions set if not exists
          if (!socket.activeSessions) {
            socket.activeSessions = new Set<number>();
          }

          // Leave all previous sessions (user should only be in one chat at a time)
          socket.activeSessions.forEach(prevSessionId => {
            socket.leave(`session:${prevSessionId}`);
            console.log(`🚪 User ${userId} left previous session ${prevSessionId}`);
          });

          // Clear the set and add new session
          socket.activeSessions.clear();
          socket.activeSessions.add(sessionId);

          // Join the new session room
          socket.join(`session:${sessionId}`);
          console.log(`✅ User ${userId} joined session ${sessionId} (validated)`);
          
        } catch (error) {
          console.error('Error joining session:', error);
          socket.emit('error', { message: 'Failed to join session' });
        }
      });

      // Handle leaving chat sessions
      socket.on('leave:session', (sessionId: number) => {
        socket.leave(`session:${sessionId}`);
        
        // Remove from active sessions tracking
        if (socket.activeSessions) {
          socket.activeSessions.delete(sessionId);
        }
        
        console.log(`🚪 User ${userId} left session ${sessionId}`);
      });

      // Handle typing indicators
      socket.on('typing:start', async (data: TypingData) => {
        const { sessionId } = data;
        const typingUserId = userId; // Use authenticated userId
        
        // Update session typing_users
        const session = await Session.findByPk(sessionId);
        if (session) {
          // Parse existing typing_users or create new object
          let typingUsers: Record<string, number> = {};
          if (session.typing_users) {
            // If it's a string, parse it; if it's already an object, use it
            typingUsers = typeof session.typing_users === 'string' 
              ? JSON.parse(session.typing_users)
              : { ...session.typing_users };
          }
          
          typingUsers[typingUserId.toString()] = Date.now();
          session.typing_users = typingUsers;
          await session.save();

          // Broadcast to other user in session
          socket.to(`session:${sessionId}`).emit('typing:start', {
            sessionId,
            userId: typingUserId,
            userName: data.userName,
          });
        }
      });

      socket.on('typing:stop', async (data: TypingData) => {
        const { sessionId } = data;
        const typingUserId = userId; // Use authenticated userId
        
        // Update session typing_users
        const session = await Session.findByPk(sessionId);
        if (session) {
          // Parse existing typing_users or create new object
          let typingUsers: Record<string, number> = {};
          if (session.typing_users) {
            typingUsers = typeof session.typing_users === 'string'
              ? JSON.parse(session.typing_users)
              : { ...session.typing_users };
          }
          
          delete typingUsers[typingUserId.toString()];
          session.typing_users = typingUsers;
          await session.save();

          // Broadcast to other user in session
          socket.to(`session:${sessionId}`).emit('typing:stop', {
            sessionId,
            userId: typingUserId,
          });
        }
      });

      // Handle message delivery confirmation
      socket.on('message:delivered', async (data: MessageData) => {
        const { messageId, sessionId } = data;
        
        console.log('📬 Message delivered event:', { messageId, sessionId, userId });
        
        // Update message status
        const message = await Chat.findByPk(messageId);
        if (message && message.status !== 'read') {
          message.status = 'delivered';
          message.delivered_at = new Date();
          await message.save();

          console.log('✅ Updated message status to delivered:', messageId);

          // Notify sender
          socket.to(`session:${sessionId}`).emit('message:status', {
            messageId,
            status: 'delivered',
            deliveredAt: message.delivered_at,
          });
        }
      });

      // Handle message read confirmation (single message)
      socket.on('message:read', async (data: MessageData) => {
        const { messageId, sessionId } = data;
        
        console.log('📖 Message read event (single):', { messageId, sessionId, userId });
        
        // Update message status
        const message = await Chat.findByPk(messageId);
        if (message) {
          message.status = 'read';
          message.read_at = new Date();
          message.is_read = true; // Legacy field
          await message.save();

          console.log('✅ Updated message status to read:', messageId);

          // Notify sender
          socket.to(`session:${sessionId}`).emit('message:status', {
            messageId,
            status: 'read',
            readAt: message.read_at,
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`❌ User ${userId} disconnected`);
        
        // Leave all active sessions
        if (socket.activeSessions) {
          socket.activeSessions.forEach(sessionId => {
            socket.leave(`session:${sessionId}`);
            console.log(`🚪 User ${userId} left session ${sessionId} on disconnect`);
          });
          socket.activeSessions.clear();
        }
        
        // Update user presence
        await this.updateUserPresence(userId, undefined, false);

        // Notify friends that user is offline
        await this.notifyFriendsOnlineStatus(userId, false);
      });
    });
  }

  private async updateUserPresence(userId: number, socketId: string | undefined, isOnline: boolean) {
    try {
      const [presence] = await UserPresence.findOrCreate({
        where: { user_id: userId },
        defaults: {
          user_id: userId,
          is_online: isOnline,
          socket_id: socketId,
          last_seen: new Date(),
        },
      });

      presence.is_online = isOnline;
      presence.socket_id = socketId;
      presence.last_seen = new Date();
      await presence.save();
    } catch (error) {
      console.error('Error updating user presence:', error);
    }
  }

  private async notifyFriendsOnlineStatus(userId: number, isOnline: boolean) {
    try {
      // Find all sessions where user is participant
      const sessions = await Session.findAll({
        where: {
          [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
        },
      });

      // Get friend IDs
      const friendIds = sessions.map(session => 
        session.user1_id === userId ? session.user2_id : session.user1_id
      );

      // Emit presence update to each friend
      friendIds.forEach(friendId => {
        this.io.to(`user:${friendId}`).emit('user:presence', {
          userId,
          isOnline,
          lastSeen: new Date(),
        });
      });
    } catch (error) {
      console.error('Error notifying friends online status:', error);
    }
  }

  // Method to emit new message to recipient with validation
  public async emitNewMessage(sessionId: number, message: any) {
    try {
      // 🔒 SECURITY: Validate session exists and get participants
      const session = await Session.findByPk(sessionId);
      
      if (!session) {
        console.error(`❌ Cannot emit message: Session ${sessionId} not found`);
        return;
      }

      console.log(`📤 Emitting message to session ${sessionId} participants: ${session.user1_id}, ${session.user2_id}`);
      
      // Emit to session room (only users who properly joined with validation will receive)
      this.io.to(`session:${sessionId}`).emit('message:new', message);
      
    } catch (error) {
      console.error('Error emitting new message:', error);
    }
  }

  // Method to get Socket.IO instance
  public getIO(): Server {
    return this.io;
  }
}

let socketServer: SocketServer | null = null;

export const initializeSocketServer = (httpServer: HTTPServer): SocketServer => {
  socketServer = new SocketServer(httpServer);
  return socketServer;
};

export const getSocketServer = (): SocketServer | null => {
  return socketServer;
};
