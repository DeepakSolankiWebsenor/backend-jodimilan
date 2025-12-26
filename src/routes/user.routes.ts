import { Router } from 'express';
import { ProfileController } from '../controllers/user/profile.controller';
import { SocialController } from '../controllers/user/social.controller';
import { CommonController } from '../controllers/common/common.controller';
import { AuthController } from '../controllers/auth/auth.controller';
import { OrderController } from '../controllers/order/order.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { uploadMultiple, uploadSingle } from '../middlewares/upload';
import { Notification } from '../models';
import { ResponseHelper } from '../utils/response';
import { User } from '../models';

const router = Router();

// Public routes
router.get('/encrypted-data', CommonController.getEncryptedData);
router.get('/state/:country_code', CommonController.getStates);
router.get('/city/:state_id', CommonController.getCities);
router.get('/area/:city_id', CommonController.getAreas);
router.get('/thikana/:area_id', CommonController.getThikanaByArea);
router.get('/slider', CommonController.getBanners);
router.get('/common-options', CommonController.getCommonOptions);
router.get('/packages', CommonController.getPackages);
router.get('/cms/:type', CommonController.getCmsPage);
router.get('/customer/search', optionalAuth, CommonController.searchProfiles);
router.get('/thikhana/search', CommonController.searchThikana);
router.get('/thikhana-searchByName', CommonController.searchThikanaByName);
router.get('/thikhana/:id', CommonController.getThikanaById);
router.get('/serachById', optionalAuth, CommonController.searchByRytId);
router.get('/userprofiles', optionalAuth, ProfileController.getUserProfiles);

// Public auth routes (under /user prefix)
router.post('/customer/signup', AuthController.signup);
router.post('/customer/verify/phone', AuthController.verifyPhone);
router.post('/customer/verify/email', AuthController.verifyEmail);
router.post('/customer/email/resend-otp', AuthController.resendEmailOtp);
router.post('/resendOtp', AuthController.resendOtp);
router.post('/customer/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);

// Public enquiry routes
router.post('/thikhanaenquiry', CommonController.thikhanaEnquiry);
router.get('/thikhanaquestion', CommonController.getThikhanaQuestions);
router.post('/send/enquiry', CommonController.sendEnquiry);

import { OtpService } from '../utils/otp'; 

// Authenticated routes
router.use(authenticate);

// OTP creation
router.post('/create/otp', async (req: any, res) => {
  const { OtpService } = await import('../utils/otp');
  const otp = await OtpService.saveOtp(req.userId);
  return ResponseHelper.success(res, 'OTP created', { otp: otp.otp });
});


router.post('/verify/mobile-otp', authenticate, async (req: any, res) => {
  try {
    const { phone, otp } = req.body;
    const userId = req.userId;

    if (!phone || !otp) {
      return ResponseHelper.error(res, "Phone & OTP required", 400);
    }

    const isValid = await OtpService.verifyMobileandUpdate(userId, otp, phone);

    if (!isValid) {
      return ResponseHelper.error(res, "Invalid or expired OTP", 400);
    }

    return ResponseHelper.success(res, "Mobile updated successfully");

  } catch (error: any) {
    console.error("OTP Verify Error:", error);
    return ResponseHelper.error(res, error.message, 500);
  }
});







router.post('/create/otp/email', async (req: any, res) => {
  const { OtpService } = await import('../utils/otp');
  const otp = await OtpService.saveOtp(req.userId);
  return ResponseHelper.success(res, 'OTP created for email', { otp: otp.otp });
});


router.post("/verify/email-otp", authenticate, async (req: any, res) => {
  try {
    const { email, otp } = req.body;
    const userId = req.userId;

    if (!email || !otp) {
      return ResponseHelper.error(res, "Email & OTP required", 400);
    }

    const isValid = await OtpService.verifyEmailAndUpdate(userId, otp, email);

    if (!isValid) {
      return ResponseHelper.error(res, "Invalid or expired OTP", 400);
    }

    return ResponseHelper.success(res, "Email updated successfully");

  } catch (error: any) {
    console.error("Email OTP Verify Error:", error);
    return ResponseHelper.error(res, error.message, 500);
  }
});



// Firebase subscriptions
router.post('/subscribe', async (req: any, res) => {
  const { FirebaseService } = await import('../utils/firebase');
  await FirebaseService.subscribeToTopic(req.body.token, req.userId);
  return ResponseHelper.success(res, 'Subscribed to notifications');
});

router.post('/unsubscribe', async (req: any, res) => {
  const { FirebaseService } = await import('../utils/firebase');
  await FirebaseService.unsubscribeFromTopic(req.body.token, req.userId);
  return ResponseHelper.success(res, 'Unsubscribed from notifications');
});

// Password management
router.post('/change-password', AuthController.changePassword);

// Profile management
router.get('/profile', ProfileController.getProfile);
router.post('/profile/update', uploadSingle('profile_image'), ProfileController.updateProfile);
router.post('/profile/update-partner-preferences', ProfileController.updatePartnerPreferences);
router.get('/currrent-plan', ProfileController.getCurrentPlan);
router.get('/profileById/:id', ProfileController.getProfileById);
router.get('/view-contact/:id', ProfileController.viewContact);
router.post('/album/images/upload', uploadMultiple('images', 10), ProfileController.uploadAlbumImages);
router.post('/album/images/delete/:id', ProfileController.deleteAlbumImage);
router.post('/profile/image/remove', ProfileController.removeProfileImage);
router.post('/delete/account', ProfileController.deleteAccount);
router.get('/browseProfile', ProfileController.browseProfiles);
router.get('/daily/recommendation/profile', ProfileController.getDailyRecommendations);

// Wishlistfor
router.get('/wishlist', ProfileController.getWishlist);
router.post('/add/wishlist', ProfileController.addToWishlist);
router.post('/remove/wishlist/:id', ProfileController.removeFromWishlist);

// Block profiles
router.post('/block/profile', ProfileController.blockProfile);
router.get('/block/profile/user', ProfileController.getBlockedProfiles);

// Package subscription
router.post('/plansuscribe', ProfileController.subscribePlan);

// Friend requests
router.post('/friend/request/send', SocialController.sendFriendRequest);
router.get('/auth/user/friend/requests', SocialController.getReceivedRequests);
router.post('/friend/requests/accept', SocialController.acceptFriendRequest);
router.get('/friend/requests/accepted', SocialController.getAcceptedRequests);
router.get('/friend/requests/pending', SocialController.getPendingRequests);
router.post('/friend/requests/decline', SocialController.declineFriendRequest);
router.post('/photo/request/send', SocialController.sendPhotoRequest);

// Notifications
router.get('/notifications', async (req: any, res) => {
  const notifications = await Notification.findAll({
    where: { user_id: req.userId },
    order: [['created_at', 'DESC']],
    limit: 50,
  });

  // Count unread
  const unreadCount = await Notification.count({
    where: {
      user_id: req.userId,
      read_at: null
    }
  });

  return ResponseHelper.success(res, 'Notifications retrieved', { notifications, unreadCount });
});

router.post('/notifications/read-all', async (req: any, res) => {
  const { NotificationService } = await import('../services/notification.service');
  await NotificationService.markAllAsRead(req.userId);
  return ResponseHelper.success(res, 'All notifications marked as read');
});

router.get('/readnotifications/:id', async (req: any, res) => {
  await Notification.update({ read_at: new Date() }, { where: { id: req.params.id } });
  return ResponseHelper.success(res, 'Notification marked as read');
});

// Order routes (under /user prefix)
router.post('/order/create', OrderController.createOrder);
router.post('/order/Checkout', OrderController.orderCheckout);
router.get('/order/history', OrderController.getOrderHistory);

export default router;
