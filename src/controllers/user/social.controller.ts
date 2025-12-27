import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { FriendRequest, User, UserProfile, Notification, Session } from '../../models';
import { SmsService } from '../../utils/sms';
import { FirebaseService } from '../../utils/firebase';
import { Helper } from '../../utils/helper';
import { Op } from "sequelize";

export class SocialController {
  // POST /api/user/friend/request/send - Send friend request
  static sendFriendRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { request_profile_id } = req.body;

    const existing = await FriendRequest.findOne({
      where: { user_id: req.userId!, request_profile_id },
    });

    if (existing) {
      return ResponseHelper.success(res, 'Interest Request already sent to this user');
    }

    // Block check
    const { BlockProfile } = await import('../../models');
    const isBlocked = await BlockProfile.findOne({
      where: {
        [Op.or]: [
          { user_id: req.userId!, block_profile_id: request_profile_id, status: 'Yes' },
          { user_id: request_profile_id, block_profile_id: req.userId!, status: 'Yes' }
        ]
      }
    });

    if (isBlocked) {
      return ResponseHelper.error(res, 'Cannot send interest to blocked profile', 403);
    }

    const friendRequest = await FriendRequest.create({
      user_id: req.userId!,
      request_profile_id,
      status: 'No',
    });

    // Send notification
    const sender = await User.findByPk(req.userId!);
    const recipient = await User.findByPk(request_profile_id);

    if (sender && recipient) {
      // Send SMS
      const phone = Helper.formatPhoneNumber(recipient.dialing_code, recipient.phone);
      await SmsService.sendFriendRequest(phone, sender.name, sender.ryt_id || '');

      // Send push notification
      await FirebaseService.sendNotification(
        recipient.id,
        'New Friend Request',
        `${sender.name} sent you a friend request`
      );

      // Save notification
      // Save notification
      const { NotificationService } = await import('../../services/notification.service');
      await NotificationService.createNotification(
        recipient.id,
        'friend_request',
        {
          topic: 'New Interest Received',
          message: `${sender.name} sent you an interest request.`,
          name: sender.name,
          sender_id: sender.id,
          avatar: sender.profile_photo // Assuming profile_photo exists on User model directly or via relation logic
        },
        'FriendRequest',
        friendRequest.id
      );

    }

    return ResponseHelper.success(res, 'Friend request sent successfully', friendRequest);
  });

  // GET /api/user/auth/user/friend/requests - Get received friend requests
  static getReceivedRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const { offset } = Helper.paginate(Number(page), Number(limit));

    const { count, rows: requests } = await FriendRequest.findAndCountAll({
      where: { request_profile_id: req.userId!, status: 'No' },
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry'] },
          include: [
            {
               model: UserProfile,
               as: 'profile',
               include: ['birthCity', 'birthState', 'birthCountry']
            },
            'stateRelation',
            'casteRelation',
            'religionRelation'
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    return ResponseHelper.paginated(res, 'Friend requests retrieved', requests, count, Number(page), Number(limit));
  });

  // POST /api/user/friend/requests/accept - Accept friend request
static acceptFriendRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { request_id } = req.body;

  if (!request_id) {
    return ResponseHelper.error(res, 'request_id is required');
  }

  const friendRequest = await FriendRequest.findOne({
    where: { id: request_id, request_profile_id: req.userId! },
  });

  if (!friendRequest) {
    return ResponseHelper.notFound(res, 'Friend request not found');
  }

  // Update request status
  friendRequest.status = 'Yes';
  await friendRequest.save();

  const userA = await User.findByPk(req.userId!); // Accepting user
  const userB = await User.findByPk(friendRequest.user_id); // Sender user

  // ✔ Only run next logic if both users found
  if (userA && userB) {
    const phone = Helper.formatPhoneNumber(userB.dialing_code, userB.phone);

    try { 
      await SmsService.sendFriendAccepted(phone, userA.name, userA.ryt_id || ''); 
    } catch (e) { 
      console.error("SMS failed", e); 
    }

    try {
      await FirebaseService.sendNotification(
        userB.id,
        'Friend Request Accepted',
        `${userA.name} accepted your friend request`
      );
    } catch (e) {
      console.error("Firebase failed", e);
    }

    const existingNoti = await Notification.findOne({
      where: {
        user_id: userB.id,
        notifiable_type: 'friend_request',
        notifiable_id: friendRequest.id
      }
    });

    if (!existingNoti) {
      const { NotificationService } = await import('../../services/notification.service');
      await NotificationService.createNotification(
        userB.id,
        'friend_accept',
        {
          topic: 'Interest Accepted',
          message: `${userA.name} accepted your interest request.`,
          name: userA.name,
          acceptor_id: userA.id,
          ryt_id: userA.ryt_id
        },
        'FriendRequest',
        friendRequest.id
      );
    }

    // 👇 SAFE CHAT SESSION CREATION 👇
    const existingSession = await Session.findOne({
      where: {
        [Op.or]: [
          { user1_id: userA.id, user2_id: userB.id },
          { user1_id: userB.id, user2_id: userA.id }
        ]
      }
    });

    if (!existingSession) {
      await Session.create({
        user1_id: userA.id,
        user2_id: userB.id,
        block: []
      });
    }
  }

  return ResponseHelper.success(res, 'Friend request accepted & Chat session created');
});




  // GET /api/user/friend/requests/accepted - Get accepted requests (friends)
  static getAcceptedRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const { offset } = Helper.paginate(Number(page), Number(limit));

    const { count: sentCount, rows: sent } = await FriendRequest.findAndCountAll({
      where: { user_id: req.userId!, status: 'Yes' },
      include: [
        {
          association: 'friend',
          attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry'] },
          include: [
            {
              model: UserProfile,
              as: 'profile',
              include: ['birthCity', 'birthState', 'birthCountry'],
            },
            'stateRelation',
            'casteRelation',
            'religionRelation',
          ],
        },
      ],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    const { count: receivedCount, rows: received } = await FriendRequest.findAndCountAll({
      where: { request_profile_id: req.userId!, status: 'Yes' },
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry'] },
          include: [
            {
              model: UserProfile,
              as: 'profile',
              include: ['birthCity', 'birthState', 'birthCountry'],
            },
            'stateRelation',
            'casteRelation',
            'religionRelation',
          ],
        },
      ],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    const total = Math.max(sentCount, receivedCount); // Total for pagination purposes in this double list

    return ResponseHelper.paginated(res, 'Friends retrieved', { sent, received }, total, Number(page), Number(limit));
  });

  // GET /api/user/friend/requests/pending - Get pending sent requests
  static getPendingRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const { offset } = Helper.paginate(Number(page), Number(limit));

    const { count, rows: requests } = await FriendRequest.findAndCountAll({
      where: { user_id: req.userId!, status: 'No' },
      include: [
        {
          association: 'friend',
          attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry'] },
          include: [
            {
              model: UserProfile,
              as: 'profile',
              include: ['birthCity', 'birthState', 'birthCountry']
            },
            'stateRelation',
            'casteRelation',
            'religionRelation'
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    return ResponseHelper.paginated(res, 'Pending requests retrieved', requests, count, Number(page), Number(limit));
  });

  // POST /api/user/friend/requests/decline - Decline friend request
static declineFriendRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { request_id } = req.query;

  if (!request_id) {
    return ResponseHelper.error(res, 'request_id is required', 400);
  }

  const deletedCount = await FriendRequest.destroy({
    where: {
      id: request_id,
      [Op.or]: [
        { request_profile_id: req.userId },
        { user_id: req.userId }
      ],
      status: 'No'
    },
  });

  if (!deletedCount) {
    return ResponseHelper.error(res, 'Request not found or Unauthorized', 404);
  }

  return ResponseHelper.success(res, 'Friend request declined');
});



  // POST /api/user/photo/request/send - Send photo request
  static sendPhotoRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { profile_id } = req.body;

    // Block check
    const { BlockProfile } = await import('../../models');
    const isBlocked = await BlockProfile.findOne({
      where: {
        [Op.or]: [
          { user_id: req.userId!, block_profile_id: profile_id, status: 'Yes' },
          { user_id: profile_id, block_profile_id: req.userId!, status: 'Yes' }
        ]
      }
    });

    if (isBlocked) {
      return ResponseHelper.error(res, 'Cannot interact with blocked profile', 403);
    }

    const sender = await User.findByPk(req.userId!);
    const recipient = await User.findByPk(profile_id);

    if (sender && recipient) {
      const { NotificationService } = await import('../../services/notification.service');
      await NotificationService.createNotification(
        recipient.id,
        'photo_request',
        {
            topic: 'Photo Request',
            message: `${sender.name} requested to view your photos`,
            name: sender.name,
            sender_id: sender.id
        },
        'PhotoRequest',
        0 
      );

      await FirebaseService.sendNotification(
        recipient.id,
        'Photo Request',
        `${sender.name} requested to view your photos`
      );
    }

    return ResponseHelper.success(res, 'Photo request sent');
  });
}
