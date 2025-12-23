import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { User, UserProfile, Wishlist, BlockProfile, FriendRequest, UserAlbum, PackagePayment, Package, Thikhana,State,Caste, UserViewedProfile } from '../../models';
import { EncryptionService } from '../../utils/encryption';
import { Op } from 'sequelize';
import { Helper } from '../../utils/helper';
import { SmsService } from '../../utils/sms';
import { FirebaseService } from '../../utils/firebase';
import moment from 'moment';

export class ProfileController {
  // GET /api/user/profile - Get user profile with relations
static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(req.userId!, {
    include: [
      {
        model: UserProfile,
        as: 'profile',
        include: ['thikhanaRelation', 'thikanaState', 'thikanaCity', 'thikanaArea', 'birthCountry', 'birthState', 'birthCity', 'motherCaste', 'edCountry', 'edState', 'edCity']
      }, 
      'countryRelation', 'stateRelation', 'religionRelation',
      'casteRelation', 'package', 'albums'
    ],
    attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry', 'otp_attempts'] },
  });

  if (!user) return ResponseHelper.error(res, 'User not found');

  const userData = user.toJSON();
  console.log("💎 Profile retrieved for user ID:", userData.id, "| Package:", userData.package_id);

  const encryptedUser = EncryptionService.encrypt(userData);

  return ResponseHelper.success(res, 'Profile retrieved successfully', {
    user: encryptedUser
  });
});


  // POST /api/user/profile/update - Update profile
 // POST /api/user/profile/update
static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  console.log('================ UPDATE PROFILE START ================');
  console.log('👤 USER ID =>', userId);

  // Handle uploaded image
  if (req.file) {
    req.body.profile_photo = (req.file as any).location;
  }

  console.log('📦 RAW REQUEST BODY =>', req.body);

  /* ================= FIELD SEPARATION ================= */
  const userFields = [
    'name',
    'last_name',
    'email',
    'phone',
    'dialing_code',
    'profile_by',
    'gender',
    'mat_status',
    'religion',
    'caste',
    'country',
    'state',
    'dob',
    'profile_photo',
    'partner_preferences',
  ];

  const userUpdate: any = {};
  const profileUpdate: any = {};

  Object.keys(req.body).forEach((key) => {
    if (key === 'id') return; // never allow PK update

    if (userFields.includes(key)) {
      userUpdate[key] = req.body[key];
    } else {
      profileUpdate[key] = req.body[key];
    }
  });

  console.log('🟢 USER UPDATE PAYLOAD =>', userUpdate);
  console.log('🟣 PROFILE UPDATE PAYLOAD =>', profileUpdate);

  /* ================= UPDATE USER ================= */
  if (Object.keys(userUpdate).length > 0) {
    if (userUpdate.dob) {
      userUpdate.age = moment().diff(moment(userUpdate.dob), 'years');
    }

    const [affected] = await User.update(userUpdate, {
      where: { id: userId },
    });

    console.log('✅ USER ROWS UPDATED =>', affected);
  }

  /* ================= ENSURE PROFILE EXISTS ================= */
  let profile = await UserProfile.findOne({
    where: { user_id: userId },
  });

  if (!profile) {
    console.log('🆕 CREATING USER PROFILE');
    profile = await UserProfile.create({
      user_id: userId,
    });
  }

  /* ================= UPDATE PROFILE ================= */
  if (Object.keys(profileUpdate).length > 0) {
    await profile.update(profileUpdate);
    console.log('✅ PROFILE UPDATED');
  }

  /* ================= FETCH UPDATED USER ================= */
  const updatedUser = await User.findByPk(userId, {
    include: [
      {
        model: UserProfile,
        as: 'profile',
        include: [
          'thikhanaRelation',
          'thikanaState',
          'thikanaCity',
          'thikanaArea',
          'birthCountry',
          'birthState',
          'birthCity',
          'motherCaste',
          'edCountry',
          'edState',
          'edCity',
        ],
      },
      'countryRelation',
      'stateRelation',
      'religionRelation',
      'casteRelation',
      'package',
      'albums',
    ],
    attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry', 'otp_attempts'] },
  });

  console.log('📄 UPDATED USER (RAW) =>', updatedUser?.toJSON());

  const encryptedUser = EncryptionService.encrypt(updatedUser?.toJSON());

  console.log('================ UPDATE PROFILE END =================');

  return ResponseHelper.success(res, 'Profile updated successfully', {
    user: encryptedUser,
  });
});


  // POST /api/user/profile/update-partner-preferences
  static updatePartnerPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log("DEBUG: Partner Preferences Update Request:", {
        userId: req.userId,
        body: req.body
    });
    const user = await User.findByPk(req.userId!);
    if (!user) {
        console.log("DEBUG: User not found for preferences update:", req.userId);
        return ResponseHelper.error(res, 'User not found');
    }
    await user.update({ partner_preferences: req.body });
    console.log("DEBUG: Partner preferences updated successfully in DB");
    return ResponseHelper.success(res, 'Partner preferences updated');
  });

  // GET /api/user/currrent-plan
static getCurrentPlan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(req.userId!, {
    include: [
      {
        model: Package,
        as: 'package'
      }
    ]
  });

  if (!user?.package_id) {
    return ResponseHelper.success(res, 'No active plan', null);
  }

  const currentPlan = {
    package_id: user.package_id,
    expiry: user.package_expiry,
    package: user.package
  };

  return ResponseHelper.success(res, 'Current plan retrieved', currentPlan);
});


  // GET /api/user/profileById/:id - Get profile by ID
static getProfileById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rytId = req.params?.id; // RYT ID comes here as id param

  if (!rytId) {
    return ResponseHelper.error(res, "RYT ID is required");
  }

  // Membership check for viewer
  const viewer = await User.findByPk(req.userId!);
  if (!viewer?.package_id) {
    return ResponseHelper.error(res, "without membership not able to see view details", 403);
  }

  const user = await User.findOne({
    where: { ryt_id: rytId },
    attributes: { exclude: ["password", "user_password", "otp", "otp_expiry", "otp_attempts"] },
    include: [
      {
        model: UserProfile,
        as: 'profile',
        include: ['thikhanaRelation', 'thikanaState', 'thikanaCity', 'thikanaArea', 'birthCountry', 'birthState', 'birthCity', 'motherCaste', 'edCountry', 'edState', 'edCity']
      },
      'countryRelation', 'stateRelation', 'religionRelation',
      'casteRelation', 'package', 
      { association: "albums", attributes: ["id", "images", "created_at"] }
    ],


  });

  if (!user) {
    return ResponseHelper.notFound(res, "User not found");
  }

  // Track unique profile view and decrement count
  const alreadyViewed = await UserViewedProfile.findOne({
    where: {
      viewer_id: req.userId!,
      viewed_id: user.id
    }
  });

  if (!alreadyViewed) {
    // Check if viewer has views remaining
    if (viewer.total_profile_view_count <= 0) {
      return ResponseHelper.error(res, 'Insufficient profile views. Please upgrade your package.', 403);
    }

    // Decrement view count
    viewer.total_profile_view_count -= 1;
    await viewer.save();

    // Record this view
    await UserViewedProfile.create({
      viewer_id: req.userId!,
      viewed_id: user.id
    });

    console.log(`✅ Profile view recorded: User ${req.userId} viewed ${user.ryt_id}. Remaining views: ${viewer.total_profile_view_count}`);
  } else {
    console.log(`ℹ️ Profile already viewed: User ${req.userId} has already viewed ${user.ryt_id}`);
  }

  const shortlist = await Wishlist.findOne({
    where: { user_id: req.userId!, user_profile_id: user.id }
  });

  const friendRequest = await FriendRequest.findOne({
    where: {
      [Op.or]: [
        { user_id: req.userId!, request_profile_id: user.id },
        { user_id: user.id, request_profile_id: req.userId! }
      ]
    }
  });

  const userData = user.toJSON() as any;
  userData.shortlist_profile_id = shortlist ? shortlist.id : null;
  userData.friend_request_sent = friendRequest ? (friendRequest.user_id === req.userId && friendRequest.status === 'No') : false;
  userData.friend_request_approved = friendRequest ? friendRequest.status === 'Yes' : false;

  console.log("🔐 USER BEFORE ENCRYPTION:", userData);

  const encrypted = EncryptionService.encrypt(userData);

  return ResponseHelper.success(res, "Profile retrieved successfully", {
    user: encrypted,
    remaining_views: viewer.total_profile_view_count
  });
});


  // GET /api/user/view-contact/:id - View contact (decrements view count)
  static viewContact = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profileId = parseInt(req.params.id);
    const viewerId = req.userId!;
    
    const viewer = await User.findByPk(viewerId);
    if (!viewer) return ResponseHelper.error(res, 'User not found');

    if (!viewer.package_id) {
        return ResponseHelper.error(res, 'without membership not able to see view details', 403);
    }

    // Check if this profile was already viewed by this user
    const alreadyViewed = await UserViewedProfile.findOne({
      where: {
        viewer_id: viewerId,
        viewed_id: profileId
      }
    });

    if (!alreadyViewed) {
      if (viewer.total_profile_view_count <= 0) {
        return ResponseHelper.error(res, 'Insufficient profile views. Please upgrade your package.');
      }

      viewer.total_profile_view_count -= 1;
      await viewer.save();

      await UserViewedProfile.create({
        viewer_id: viewerId,
        viewed_id: profileId
      });
    }

    const targetUser = await User.findByPk(profileId, {
      include: ['profile'],
      attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry', 'otp_attempts'] },
    });

    return ResponseHelper.success(res, 'Contact viewed', { 
      user: targetUser, 
      remaining_views: viewer.total_profile_view_count 
    });
  });


  // POST /api/user/album/images/upload - Upload album images
  static uploadAlbumImages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const albums = await Promise.all(
      files.map((file) =>
        UserAlbum.create({
          user_id: req.userId!,
          image_path: (file as any).location,
          caption: req.body.caption,
        })
      )
    );

    return ResponseHelper.success(res, 'Images uploaded successfully', albums);
  });

  // POST /api/user/album/images/delete/:id - Delete album image
  static deleteAlbumImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    await UserAlbum.destroy({ where: { id: req.params.id, user_id: req.userId! } });
    return ResponseHelper.success(res, 'Image deleted successfully');
  });

  // POST /api/user/profile/image/remove - Remove profile image
  static removeProfileImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    await User.update({ profile_photo: null }, { where: { id: req.userId! } });
    return ResponseHelper.success(res, 'Profile image removed');
  });

  // POST /api/user/delete/account - Delete account
  static deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reason } = req.body;
    await User.update(
      { status: 'Deleted', delete_account_reason: reason, deleted_at: new Date() },
      { where: { id: req.userId! } }
    );

    return ResponseHelper.success(res, 'Account deleted successfully');
  });



  // GET /api/user/browseProfile - Browse profiles with filters


static browseProfiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log('================ BROWSE PROFILE API HIT ================');

  const {
    page = 1,
    limit = 20,
    state,        // frontend → religion
    caste,
    occupation,
    city,         // birth_city
  } = req.query;

  console.log('🔍 RAW QUERY PARAMS =>', req.query);

  const { offset } = Helper.paginate(Number(page), Number(limit));

  /* ================= USERS WHERE ================= */
  const userWhere: any = {
    status: 'Active',
  };

  // frontend "state" is actually religion
  if (state) {
    const religionIds = Array.isArray(state)
      ? state.map(Number)
      : [Number(state)];

    userWhere.religion = { [Op.in]: religionIds };
  }

  if (caste) {
    const casteIds = Array.isArray(caste)
      ? caste.map(Number)
      : [Number(caste)];

    userWhere.caste = { [Op.in]: casteIds };
  }

  console.log('🧱 USER WHERE =>');
  console.dir(userWhere, { depth: null });

  /* ================= USER_PROFILE WHERE ================= */
  const profileWhere: any = {};

if (occupation) {
  const occupations = Array.isArray(occupation)
    ? occupation
    : [occupation];

  // IMPORTANT FIX
  profileWhere.employeed_in = { [Op.in]: occupations };
}

if (city) {
  const cityIds = Array.isArray(city)
    ? city.map(Number)
    : [Number(city)];

  profileWhere.birth_city = { [Op.in]: cityIds };
}

  console.log('🧱 PROFILE WHERE =>');
  console.dir(profileWhere, { depth: null });

  /* ================= BLOCKED + SELF ================= */
  if (req.userId) {
    const blocked = await BlockProfile.findAll({
      where: { user_id: req.userId },
      attributes: ['block_profile_id'],
      raw: true,
    });

    const blockedIds = blocked.map(b => b.block_profile_id);

    userWhere.id = {
      [Op.notIn]: [req.userId, ...blockedIds],
    };
  }

  console.log('🧱 FINAL USER WHERE =>');
  console.dir(userWhere, { depth: null });

  /* ================= QUERY ================= */
  console.log('🚀 EXECUTING USER + PROFILE JOIN QUERY');

  const { count, rows } = await User.findAndCountAll({
    where: userWhere,
    include: [
      {
        model: UserProfile,
        as: 'profile',
        required: true, // 🔥 IMPORTANT: must match user_profiles
        where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
      },
    ],
    limit: Number(limit),
    offset,
    distinct: true,
    attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry', 'otp_attempts'] },
  });

  console.log('📊 TOTAL USERS =>', count);
  console.log('📦 ROWS RETURNED =>', rows.length);

  console.log('================ END BROWSE PROFILE API ================');

  return ResponseHelper.paginated(
    res,
    'Profiles retrieved',
    rows,
    count,
    Number(page),
    Number(limit)
  );
});








  // GET /api/user/daily/recommendation/profile - Daily recommendations
  static getDailyRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findByPk(req.userId!);
    const preferences = user?.partner_preferences || {};

    const where: any = {
      status: 'Active',
      gender: user?.gender === 'Male' ? 'Female' : 'Male',
    };

    if (preferences.enabled) {
      if (preferences.religion) where.religion = { [Op.in]: preferences.religion };
      if (preferences.caste) where.caste = { [Op.in]: preferences.caste };
      if (preferences.min_age || preferences.max_age) {
        where.age = {};
        if (preferences.min_age) where.age[Op.gte] = preferences.min_age;
        if (preferences.max_age) where.age[Op.lte] = preferences.max_age;
      }
    }

    const profiles = await User.findAll({
      where,
      include: ['profile'],
      limit: 10,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry', 'otp_attempts'] },
    });

    return ResponseHelper.success(res, 'Recommendations retrieved', profiles);
  });

  // GET /api/user/wishlist - Get wishlist
 static getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return ResponseHelper.error(res, 'Unauthorized', 401);
  }

  const wishlists = await Wishlist.findAll({
    where: { user_id: req.userId },
    order: [['created_at', 'DESC']],
    include: [
      {
        association: 'profileUser',
        attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry', 'otp_attempts'] },
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
  });

  return ResponseHelper.success(res, 'Wishlist retrieved', wishlists);
});


  // POST /api/user/add/wishlist - Add to wishlist
  static addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user_profile_id = Number(req.body.user_profile_id);
    const user_id = Number(req.userId);

    if (isNaN(user_profile_id)) {
      return ResponseHelper.error(res, 'Invalid profile ID', 400);
    }
    
    const [wishlist, created] = await Wishlist.findOrCreate({
      where: { 
        user_id, 
        user_profile_id 
      },
      defaults: { 
        user_id, 
        user_profile_id 
      }
    });

    if (!created) {
        return ResponseHelper.success(res, 'You are Already Shortlisted this user'); // Or handle as per UX preference
    }

    const { NotificationService } = await import('../../services/notification.service');
    // Notify the ACTOR (User who shortlisted) -> "Shortlisted user like you have shortlist this user"
    // Fetch profile user name to make it personal
    const profileUser = await User.findByPk(user_profile_id);
    if (profileUser) {
        await NotificationService.createNotification(
            user_id,
            'shortlist',
            {
                topic: 'Shortlisted User',
                message: `You have shortlisted ${profileUser.name || 'a user'}.`,
                name: 'System'
            },
            'Wishlist',
            wishlist.id
        );
    }

    return ResponseHelper.success(res, 'Added to wishlist');
  });

  // POST /api/user/remove/wishlist/:id - Remove from wishlist
  static removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    await Wishlist.destroy({ where: { id: req.params.id, user_id: req.userId! } });
    return ResponseHelper.success(res, 'Removed from wishlist');
  });

  // POST /api/user/block/profile - Block/unblock profile
  static blockProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { block_profile_id, status } = req.body;

    const existing = await BlockProfile.findOne({
      where: { user_id: req.userId!, block_profile_id },
    });

    if (existing) {
      await existing.update({ status });
    } else {
      await BlockProfile.create({ user_id: req.userId!, block_profile_id, status });
    }

    return ResponseHelper.success(res, status === 'Yes' ? 'Profile blocked' : 'Profile unblocked');
  });

  // GET /api/user/block/profile/user - Get blocked profiles
  static getBlockedProfiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const blocked = await BlockProfile.findAll({
      where: { user_id: req.userId!, status: 'Yes' },
      include: [{ association: 'blockedUser', include: ['profile'] }],
    });

    return ResponseHelper.success(res, 'Blocked profiles retrieved', blocked);
  });

  // GET /api/user/userprofiles - Get user profiles list
  static getUserProfiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.userId;

    const where: any = { status: 'Active' };

    // Exclude self and blocked profiles
    if (userId) {
      const blocked = await BlockProfile.findAll({
        where: { user_id: userId },
        attributes: ['block_profile_id'],
        raw: true,
      });
      const blockedIds = blocked.map((b) => b.block_profile_id);
      where.id = { [Op.notIn]: [userId, ...blockedIds] };
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        {
          model: UserProfile,
          as: 'profile',
          include: ['birthCity', 'birthState', 'birthCountry']
        },
        'stateRelation',
        'casteRelation'
      ],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      attributes: { exclude: ['password', 'user_password', 'otp', 'otp_expiry', 'otp_attempts'] },
    });
    return ResponseHelper.paginated(res, 'User profiles retrieved', rows, count, Number(page), Number(limit));
  });

  // POST /api/user/plansuscribe - Subscribe to a plan
  static subscribePlan = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { package_id, payment_id } = req.body;

    // TODO: Implement package subscription logic
    // - Verify payment
    // - Create package payment record
    // - Update user's package details
    // - Set expiry date based on package duration

    return ResponseHelper.success(res, 'Package subscribed successfully', {});
  });
}
