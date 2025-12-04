import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { FriendRequest, User, Notification,Session } from '../../models';
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
      return ResponseHelper.error(res, 'Friend request already sent');
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
    await Notification.create({
  user_id: recipient.id,
  type: 'friend_request',
  notifiable_type: 'FriendRequest',
  notifiable_id: friendRequest.id.toString(), // ensure string
  data: JSON.stringify({ sender_id: sender.id }),
});

    }

    return ResponseHelper.success(res, 'Friend request sent successfully', friendRequest);
  });

  // GET /api/user/auth/user/friend/requests - Get received friend requests
  static getReceivedRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    const requests = await FriendRequest.findAll({
      where: { request_profile_id: req.userId!, status: 'No' },
      include: [{ association: 'user', include: ['profile'] }],
      order: [['created_at', 'DESC']],
    });

    return ResponseHelper.success(res, 'Friend requests retrieved', requests);
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
      await Notification.create({
        user_id: userB.id,
        type: 'friend_accept',
        notifiable_type: 'friend_request',
        notifiable_id: friendRequest.id,
        data: JSON.stringify({
          acceptor_id: userA.id,
          name: userA.name,
          ryt_id: userA.ryt_id,
        }),
      });
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
    const sent = await FriendRequest.findAll({
      where: { user_id: req.userId!, status: 'Yes' },
      include: [{ association: 'friend', include: ['profile'] }],
    });

    const received = await FriendRequest.findAll({
      where: { request_profile_id: req.userId!, status: 'Yes' },
      include: [{ association: 'user', include: ['profile'] }],
    });

    return ResponseHelper.success(res, 'Friends retrieved', { sent, received });
  });

  // GET /api/user/friend/requests/pending - Get pending sent requests
  static getPendingRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    const requests = await FriendRequest.findAll({
      where: { user_id: req.userId!, status: 'No' },
      include: [{ association: 'friend', include: ['profile'] }],
      order: [['created_at', 'DESC']],
    });

    return ResponseHelper.success(res, 'Pending requests retrieved', requests);
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
      user_id: req.userId, // 👈 correct the field here
      status: 'No' // ensure only pending requests can be canceled
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

    const sender = await User.findByPk(req.userId!);
    const recipient = await User.findByPk(profile_id);

    if (sender && recipient) {
      await Notification.create({
        user_id: recipient.id,
        type: 'photo_request',
        title: 'Photo Request',
        message: `${sender.name} requested to view your photos`,
        data: { sender_id: sender.id },
      });

      await FirebaseService.sendNotification(
        recipient.id,
        'Photo Request',
        `${sender.name} requested to view your photos`
      );
    }

    return ResponseHelper.success(res, 'Photo request sent');
  });
}
