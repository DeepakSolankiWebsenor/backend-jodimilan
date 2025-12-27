import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { User, UserProfile, Wishlist, BlockProfile, FriendRequest, UserAlbum, PackagePayment, Package, Thikhana, State, Caste, UserViewedProfile, Religion, Session, City, Area } from '../../models';
import { EncryptionService } from '../../utils/encryption';
import { Op ,col } from 'sequelize';
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
    'state_name',
    'city_name',
    'block_name',
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

  /* ================= RESOLVE LOCATION NAMES ================= */
  if (req.body.thikana_state) {
    const state = await State.findByPk(req.body.thikana_state);
    if (state) userUpdate.state_name = state.name;
  }
  if (req.body.thikana_city) {
    const city = await City.findByPk(req.body.thikana_city);
    if (city) userUpdate.city_name = city.name;
  }
  if (req.body.thikana_area) {
    const area = await Area.findByPk(req.body.thikana_area);
    if (area) userUpdate.block_name = area.name;
  }

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

  const viewer = await User.findByPk(req.userId!);
  if (!viewer) return ResponseHelper.error(res, 'Viewer not found');

  const targetUser = await User.findOne({ where: { ryt_id: rytId } });
  if (!targetUser) return ResponseHelper.notFound(res, "User not found");

  // Mutual block check
  const isBlocked = await BlockProfile.findOne({
    where: {
      [Op.or]: [
        { user_id: req.userId!, block_profile_id: targetUser.id, status: 'Yes' },
        { user_id: targetUser.id, block_profile_id: req.userId!, status: 'Yes' }
      ]
    }
  });

  if (isBlocked) {
    return ResponseHelper.error(res, 'Profile blocked', 404);
  }

  const user = await User.findOne({
  where: { ryt_id: rytId },
  attributes: {
    exclude: ["password", "user_password", "otp", "otp_expiry", "otp_attempts"]
  },
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
        'edCity'
      ]
    },

    // ✅ RELIGION NAME
    {
      model: Religion,
      as: 'religionRelation',
      attributes: ['id', 'name']
    },

    // ✅ CASTE NAME
    {
      model: Caste,
      as: 'casteRelation',
      attributes: ['id', 'name']
    },

    'countryRelation',
    'stateRelation',
    'package',

    {
      association: "albums",
      attributes: ["id", "images", "created_at"]
    }
  ]
});


  if (!user) {
    return ResponseHelper.notFound(res, "User not found");
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
  userData.friend_request_received = friendRequest ? (friendRequest.request_profile_id === req.userId && friendRequest.status === 'No') : false;
  userData.friend_request_approved = friendRequest ? friendRequest.status === 'Yes' : false;

  // Decide if we reveal full details based on privacy and status
  const isFriend = userData.friend_request_approved;
  const isMember = !!viewer?.package_id;
  const contactPrivacy = user.profile?.contact_privacy || "Yes"; // Default to "Yes" (Show to all members/Premium Only)

  let revealDetails = false;

  // Determine if viewer gets FREE access based on friendship and privacy
  let freeAccess = false;
  if (contactPrivacy === "Yes") {
    // 🔒 "Show to all members" -> Friends only see if they are ALSO members.
    // However, if they are members, we don't want to charge them a view if they are friends.
    freeAccess = isFriend && isMember;
  } else {
    // 🔓 "Show to friends" -> Friends (member or not) get free access.
    freeAccess = isFriend;
  }

  if (freeAccess) {
    revealDetails = true;
  } else if (isMember) {
    // Check if already viewed in history
    const alreadyViewed = await UserViewedProfile.findOne({
      where: {
        viewer_id: req.userId!,
        viewed_id: user.id
      }
    });

    if (alreadyViewed) {
      revealDetails = true;
    }
    // Note: Automatic consumption logic removed as per user request.
    // Consumption now happens only via viewContact button click.
  }

  // Mask sensitive info if details are NOT revealed
  if (!revealDetails) {
    userData.email = userData.email ? 
        userData.email.substring(0, 3) + "****" + userData.email.substring(userData.email.indexOf("@")) 
        : null;
    userData.phone = userData.phone ? 
        userData.phone.substring(0, 4) + "******" 
        : null;
    
    // Add a flag for frontend to show specific message
    userData.access_restricted_by_privacy = (contactPrivacy === "Yes" && isFriend && !isMember);
  }

  console.log("🔐 USER BEFORE ENCRYPTION:", userData);

  const encrypted = EncryptionService.encrypt(userData);

  return ResponseHelper.success(res, "Profile retrieved successfully", {
    user: encrypted,
    remaining_views: viewer.total_profile_view_count
  });
});






  // GET /api/user/view-contact/:id - View contact (decrements view count)
  static viewContact = asyncHandler(async (req: AuthRequest, res: Response) => {
    const viewerId = req.userId!;
    const viewer = await User.findByPk(viewerId);
    if (!viewer) return ResponseHelper.error(res, 'User not found');

    const idParam = req.params.id;
    let targetUser;

    // Handle both numeric ID and RYT ID
    if (/^\d+$/.test(idParam)) {
      targetUser = await User.findByPk(idParam, { include: ['profile'] });
    } else {
      targetUser = await User.findOne({ where: { ryt_id: idParam }, include: ['profile'] });
    }

    if (!targetUser) return ResponseHelper.error(res, 'Target user not found');
    const profileId = targetUser.id;

    // Mutual block check
    const isBlocked = await BlockProfile.findOne({
      where: {
        [Op.or]: [
          { user_id: viewerId, block_profile_id: profileId, status: 'Yes' },
          { user_id: profileId, block_profile_id: viewerId, status: 'Yes' }
        ]
      }
    });

    if (isBlocked) {
      return ResponseHelper.error(res, 'Profile blocked', 404);
    }

    // Check if viewer has a membership
    const isMember = !!viewer.package_id;
    const contactPrivacy = targetUser.profile?.contact_privacy || "Yes";

    // Check if they are friends
    const friendRequest = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { user_id: viewerId, request_profile_id: profileId },
          { user_id: profileId, request_profile_id: viewerId }
        ],
        status: 'Yes'
      }
    });
    const isFriend = !!friendRequest;

    // Determine if they get free access
    let freeAccess = false;
    if (contactPrivacy === "Yes") {
      freeAccess = isFriend && isMember;
    } else {
      freeAccess = isFriend;
    }

    if (!isMember && !freeAccess) {
      return ResponseHelper.error(res, 'Without membership and friend not able to see view details', 403);
    }

    // Check privacy restriction specifically
    if (contactPrivacy === "Yes" && isFriend && !isMember) {
      return ResponseHelper.error(res, 'This user does not allow sharing details with friends. Please upgrade to premium to view.', 403);
    }

    // Check if this profile was already viewed by this user
    const alreadyViewed = await UserViewedProfile.findOne({
      where: {
        viewer_id: viewerId,
        viewed_id: profileId
      }
    });

    if (!alreadyViewed) {
      if (isMember) {
        if (viewer.total_profile_view_count <= 0) {
          return ResponseHelper.error(res, 'Membership profile count limit reached. Please upgrade your package.', 403);
        }

        // Update view counts: Decrement remaining, Increment consumed
        viewer.total_profile_view_count = Number(viewer.total_profile_view_count) - 1;
        viewer.profile_visit = Number(viewer.profile_visit) + 1;
        await viewer.save();
      }

      await UserViewedProfile.create({
        viewer_id: viewerId,
        viewed_id: profileId
      });
      console.log(`✅ viewContact: Recorded view for User ${viewerId} on ${targetUser.ryt_id}. Remaining: ${viewer.total_profile_view_count}, Consumed: ${viewer.profile_visit}`);
    }

    return ResponseHelper.success(res, 'Contact viewed', { 
      user: targetUser, 
      remaining_views: viewer.total_profile_view_count,
      profile_visit: viewer.profile_visit
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
    caste,
    clan,
    religion,
    occupation,
    state,
    city,
  } = req.query;

  console.log('🔍 RAW QUERY PARAMS =>', req.query);

  const { offset } = Helper.paginate(Number(page), Number(limit));

  /* ================= USERS WHERE ================= */
  const userWhere: any = {
    status: 'Active',
  };

  // ✅ Religion filter
  if (religion) {
    const religionIds = Array.isArray(religion)
      ? religion.map(Number)
      : [Number(religion)];

    userWhere.religion = { [Op.in]: religionIds };
  }

  // ✅ Caste filter
  if (caste) {
    const casteIds = Array.isArray(caste)
      ? caste.map(Number)
      : [Number(caste)];

    userWhere.caste = { [Op.in]: casteIds };
  }

  // ✅ Clan filter
  if (clan) {
    const clanIds = Array.isArray(clan)
      ? clan.map(Number)
      : [Number(clan)];

    userWhere.clan_id = { [Op.in]: clanIds };
  }

  /* ================= BLOCKED + SELF ================= */
  let friendIds = new Set<number>();
  
  if (req.userId) {
    // 1. Blocked Logic
    const blockedByMe = await BlockProfile.findAll({
      where: { user_id: req.userId, status: 'Yes' },
      attributes: ['block_profile_id'],
      raw: true,
    });

    const blockedMe = await BlockProfile.findAll({
      where: { block_profile_id: req.userId, status: 'Yes' },
      attributes: ['user_id'],
      raw: true,
    });

    const blockedIds = [
      ...blockedByMe.map(b => Number(b.block_profile_id)),
      ...blockedMe.map(b => Number(b.user_id)),
    ];

    userWhere.id = {
      [Op.notIn]: [req.userId, ...blockedIds],
    };

    // 2. Fetch Friend IDs (both sent and received where status is 'Yes')
    const friends = await FriendRequest.findAll({
      where: {
        [Op.or]: [
          { user_id: req.userId, status: 'Yes' },
          { request_profile_id: req.userId, status: 'Yes' }
        ]
      },
      attributes: ['user_id', 'request_profile_id'],
      raw: true
    });

    friends.forEach(f => {
      if (f.user_id === req.userId) friendIds.add(f.request_profile_id);
      else friendIds.add(f.user_id);
    });
  }

  console.log('🧱 USER WHERE =>');
  console.dir(userWhere, { depth: null });

  /* ================= USER_PROFILE WHERE ================= */
  const profileWhere: any = {};

  // ✅ occupation (array-safe)
  if (occupation) {
    const occupationValue = Array.isArray(occupation)
      ? occupation[0]
      : occupation;

    profileWhere.occupation = {
      [Op.like]: `%${occupationValue}%`,
    };
  }

  // ✅ state
  if (state) {
    profileWhere.thikana_state = {
      [Op.in]: Array.isArray(state)
        ? state.map(Number)
        : [Number(state)],
    };
  }

  // ✅ city
  if (city) {
    profileWhere.thikana_city = {
      [Op.in]: Array.isArray(city)
        ? city.map(Number)
        : [Number(city)],
    };
  }

  const isProfileFilterApplied = Object.keys(profileWhere).length > 0;

  console.log('🧱 PROFILE WHERE =>');
  console.dir(profileWhere, { depth: null });

  /* ================= QUERY ================= */
  console.log('🚀 EXECUTING USER + PROFILE JOIN QUERY');

  const { count, rows } = await User.findAndCountAll({
    where: userWhere,
    include: [
      {
        model: UserProfile,
        as: 'profile',
        required: isProfileFilterApplied, // 🔥 profile-only search works
        where: isProfileFilterApplied ? profileWhere : undefined,
      },
    ],
    limit: Number(limit),
    offset,
    distinct: true,
    attributes: {
      exclude: [
        'password',
        'user_password',
        'otp',
        'otp_expiry',
        'otp_attempts',
      ],
    },
  });

  // Attach is_friend flag
  const rowsWithFriendStatus = rows.map(user => {
    const u = user.toJSON();
    u.is_friend = friendIds.has(u.id);
    return u;
  });

  console.log('📊 TOTAL USERS =>', count);
  console.log('📦 ROWS RETURNED =>', rows.length);
  console.log('================ END BROWSE PROFILE API ================');

  return ResponseHelper.paginated(
    res,
    'Profiles retrieved',
    rowsWithFriendStatus,
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

    // Mutual block check in recommendations
    let friendIds = new Set<number>();

    if (req.userId) {
      const blockedByMe = await BlockProfile.findAll({
        where: { user_id: req.userId, status: 'Yes' },
        attributes: ['block_profile_id'],
        raw: true,
      });

      const blockedMe = await BlockProfile.findAll({
        where: { block_profile_id: req.userId, status: 'Yes' },
        attributes: ['user_id'],
        raw: true,
      });

      const blockedIds = [
        ...blockedByMe.map(b => Number(b.block_profile_id)),
        ...blockedMe.map(b => Number(b.user_id))
      ];

      where.id = {
        [Op.notIn]: [req.userId, ...blockedIds],
      };

      // Fetch Friend IDs
      const friends = await FriendRequest.findAll({
        where: {
          [Op.or]: [
            { user_id: req.userId, status: 'Yes' },
            { request_profile_id: req.userId, status: 'Yes' }
          ]
        },
        attributes: ['user_id', 'request_profile_id'],
        raw: true
      });

      friends.forEach(f => {
        if (f.user_id === req.userId) friendIds.add(f.request_profile_id);
        else friendIds.add(f.user_id);
      });
    }

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

    const profilesWithFriendStatus = profiles.map(user => {
        const u = user.toJSON();
        u.is_friend = friendIds.has(u.id);
        return u;
    });

    return ResponseHelper.success(res, 'Recommendations retrieved', profilesWithFriendStatus);
  });

  // GET /api/user/wishlist - Get wishlist
  static getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return ResponseHelper.error(res, 'Unauthorized', 401);
    }

    const { page = 1, limit = 10 } = req.query;
    const { offset } = Helper.paginate(Number(page), Number(limit));

    const { count, rows: wishlists } = await Wishlist.findAndCountAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
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

    // Fetch Friend IDs for current user
    let friendIds = new Set<number>();
    const friends = await FriendRequest.findAll({
      where: {
        [Op.or]: [
          { user_id: req.userId, status: 'Yes' },
          { request_profile_id: req.userId, status: 'Yes' }
        ]
      },
      attributes: ['user_id', 'request_profile_id'],
      raw: true
    });

    friends.forEach(f => {
      if (f.user_id === req.userId) friendIds.add(f.request_profile_id);
      else friendIds.add(f.user_id);
    });

    // Attach is_friend to profileUser
    const wishlistWithFriendStatus = wishlists.map(w => {
        const item = w.toJSON();
        if (item.profileUser) {
            item.profileUser.is_friend = friendIds.has(item.profileUser.id);
        }
        return item;
    });

    return ResponseHelper.paginated(
      res,
      'Wishlist retrieved',
      wishlistWithFriendStatus,
      count,
      Number(page),
      Number(limit)
    );
  });


  // POST /api/user/add/wishlist - Add to wishlist
  static addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user_profile_id = Number(req.body.user_profile_id);
    const user_id = Number(req.userId);

    if (isNaN(user_profile_id)) {
      return ResponseHelper.error(res, 'Invalid profile ID', 400);
    }

    // Check if blocked
    const isBlocked = await BlockProfile.findOne({
      where: {
        [Op.or]: [
          { user_id, block_profile_id: user_profile_id, status: 'Yes' },
          { user_id: user_profile_id, block_profile_id: user_id, status: 'Yes' }
        ]
      }
    });

    if (isBlocked) {
      return ResponseHelper.error(res, 'Cannot shortlist blocked profile', 403);
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

    if (status === 'Yes') {
      const user_id = req.userId!;
      
      // Remove from Wishlist (both ways)
      await Wishlist.destroy({
        where: {
          [Op.or]: [
            { user_id: user_id, user_profile_id: block_profile_id },
            { user_id: block_profile_id, user_profile_id: user_id }
          ]
        }
      });

      // Remove from FriendRequests (only PENDING requests)
      await FriendRequest.destroy({
        where: {
          [Op.or]: [
            { user_id: user_id, request_profile_id: block_profile_id },
            { user_id: block_profile_id, request_profile_id: user_id }
          ],
          status: 'No' 
        }
      });

      // NOTE: We comment out destruction of accepted friends and sessions so that unblocking restores the friendship.
      // If we want to fully disconnect even accepted friends:
      /*
      await FriendRequest.destroy({
        where: {
          [Op.or]: [
            { user_id: user_id, request_profile_id: block_profile_id },
            { user_id: block_profile_id, request_profile_id: user_id }
          ],
          status: 'Yes'
        }
      });
      
      // Note: Session deletion might be needed as well if we want to stop chat.
      await Session.destroy({
        where: {
          [Op.or]: [
            { user1_id: user_id, user2_id: block_profile_id },
            { user1_id: block_profile_id, user2_id: user_id }
          ]
        }
      });
      */
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
  console.log('\n================ GET USER PROFILES API HIT ================');

  const { page = 1, limit = 20 } = req.query;
  const userId = req.userId;

  console.log('➡️ PAGE:', page, 'LIMIT:', limit);
  console.log('➡️ USER ID:', userId);

  /* ================= BASE WHERE ================= */
  const where: any = {
    status: 'Active',
  };

  /* ================= BLOCKED + SELF EXCLUDE ================= */
  let friendIds = new Set<number>();

  if (userId) {
    // Users blocked by me
    const blockedByMe = await BlockProfile.findAll({
      where: { user_id: userId, status: 'Yes' },
      attributes: ['block_profile_id'],
      raw: true,
    });

    // Users who blocked me
    const blockedMe = await BlockProfile.findAll({
      where: { block_profile_id: userId, status: 'Yes' },
      attributes: ['user_id'],
      raw: true,
    });

    const blockedIds = [
      ...blockedByMe.map(b => Number(b.block_profile_id)),
      ...blockedMe.map(b => Number(b.user_id)),
    ];

    console.log('🚫 BLOCKED IDS:', blockedIds);

    // Exclude self + blocked users
    where.id = {
      [Op.notIn]: [userId, ...blockedIds],
    };

    /* ================= FRIEND IDS ================= */
    const friends = await FriendRequest.findAll({
      where: {
        status: 'Yes',
        [Op.or]: [
          { user_id: userId },
          { request_profile_id: userId },
        ],
      },
      attributes: ['user_id', 'request_profile_id'],
      raw: true,
    });

    friends.forEach(f => {
      if (f.user_id === userId) {
        friendIds.add(f.request_profile_id);
      } else {
        friendIds.add(f.user_id);
      }
    });
  }

  console.log('\n🧱 FINAL USER WHERE CLAUSE:');
  console.dir(where, { depth: null });

  const offset = (Number(page) - 1) * Number(limit);
  console.log('➡️ OFFSET:', offset);

  /* ================= QUERY ================= */
  console.log('\n🚀 EXECUTING Sequelize findAndCountAll...\n');

  const { count, rows } = await User.findAndCountAll({
    where,

    include: [
      {
        model: UserProfile,
        as: 'profile',
        required: false,
        include: ['birthCity', 'birthState', 'birthCountry'],
      },
      {
        association: 'stateRelation',
        required: false,
      },
      {
        association: 'casteRelation',
        required: false,
      },
    ],

    // 🔥 VERY IMPORTANT (MySQL + joins)
    subQuery: false,

    // 🔥 NEW USERS FIRST → OLD USERS LAST
    order: [
      ['created_at', 'DESC'], // newest first
      ['id', 'DESC'],         // tie-breaker
    ],

    limit: Number(limit),
    offset,

    distinct: true,

    attributes: {
      exclude: ['password', 'user_password', 'otp', 'otp_expiry', 'otp_attempts'],
    },
  });

  /* ================= ATTACH FRIEND FLAG ================= */
  const rowsWithFriendStatus = rows.map(user => {
    const u: any = user.toJSON();
    u.is_friend = friendIds.has(u.id);
    return u;
  });

  /* ================= LOG RESULT ORDER ================= */
  console.log('\n📊 TOTAL COUNT:', count);
  console.log(
    '📦 RESULT ORDER (id + created_at):',
    rowsWithFriendStatus.map(u => ({
      id: u.id,
      created_at: u.created_at,
    }))
  );

  console.log('================ END GET USER PROFILES API ================\n');

  return ResponseHelper.paginated(
    res,
    'User profiles retrieved',
    rowsWithFriendStatus,
    count,
    Number(page),
    Number(limit)
  );
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
