import { Response } from 'express';
import { AuthRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middlewares/errorHandler';
import { Country, State, City, Area, Religion, Caste, Banner, Cms, Package, Category, Config, User, Setting, Thikhana,Enquiry ,Clan} from '../../models';
import { Op } from 'sequelize';
import { customConfig } from '../../config/custom';



const CMS_SLUG_MAP: Record<string, string> = {
  about: 'about-myshaadi',
  privacy: 'privacy-policy',
  refund: 'refund-and-cancellation',
  terms: 'terms-and-conditions',
};

export class CommonController {
  // GET /api/user/state/:country_code - Get states by country
  static getStates = asyncHandler(async (req: AuthRequest, res: Response) => {
    const states = await State.findAll({
      where: { country_id: req.params.country_code },
    });
    return ResponseHelper.success(res, 'States retrieved', states);
  });

  // GET /api/user/city/:state_id - Get cities by state
  static getCities = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cities = await City.findAll({
      where: { state_id: req.params.state_id },
    });
    return ResponseHelper.success(res, 'Cities retrieved', cities);
  });

  // GET /api/user/area/:city_id - Get areas by city
  static getAreas = asyncHandler(async (req: AuthRequest, res: Response) => {
    const areas = await Area.findAll({
      where: { city_id: req.params.city_id },
    });
    return ResponseHelper.success(res, 'Areas retrieved', areas);
  });

  // GET /api/user/slider - Get active banners
  static getBanners = asyncHandler(async (req: AuthRequest, res: Response) => {
    const banners = await Banner.findAll({
      where: { status: 'Active' },
      order: [['sort', 'ASC']],
    });
    return ResponseHelper.success(res, 'Banners retrieved', banners);
  });

  // GET /api/user/common-options - Get all dropdown options
  // GET /api/user/common-options - Get all dropdown options

  
 static getCommonOptions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [
    religions,
    countries,
    states,
    cities,
    settings,
    areas,
    thikanas
  ] = await Promise.all([
    Religion.findAll({
      include: [
        {
          model: Caste,
          include: [
            {
              model: Clan,
            },
          ],
        },
      ],
    }),
    Country.findAll(),
    State.findAll(),
    City.findAll({ where: { country_id: '101', state_id: '30' } }),
    Setting.findAll(),
    Area.findAll(),
    Thikhana.findAll(),
  ]);

  const prefix_id = settings[0]?.prefix_id || 'T';

  return ResponseHelper.success(res, 'Options retrieved', {
    prefix_id,
    gender: customConfig.user.gender,
    profile: customConfig.user.profile,
    mat_status: customConfig.user.mat_status,
    options_type: customConfig.options_type,
    religion: religions,
    country: countries,
    state: states,
    city: cities,
    area: areas,
    thikhana: thikanas,
  });
});







  // GET /api/user/packages - Get active packages
  static getPackages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const packages = await Package.findAll({
      where: { status: 'Active' },
      order: [['package_price', 'ASC']],
    });
    return ResponseHelper.success(res, 'Packages retrieved', packages);
  });

  // GET /api/user/cms/:slug

static getCmsPage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const param = req.params.type?.toLowerCase();

  if (!param) {
    return ResponseHelper.error(res, 'CMS param required', 400);
  }

  const finalSlug = CMS_SLUG_MAP[param] || param;

  const page = await Cms.findOne({
    where: {
      slug: finalSlug,
      status: 'Active',
    },
  });

  if (!page) {
    return ResponseHelper.error(res, 'CMS page not found', 404);
  }

  return ResponseHelper.success(res, 'CMS page retrieved', page);
});






  // GET /api/cms - Get all CMS pages
  static getAllCms = asyncHandler(async (req: AuthRequest, res: Response) => {
    const pages = await Cms.findAll({ where: { status: 'Active' } });
    return ResponseHelper.success(res, 'CMS pages retrieved', pages);
  });

  // GET /api/phone-codes - Get phone dialing codes
  static getPhoneCodes = asyncHandler(async (req: AuthRequest, res: Response) => {
    const countries = await Country.findAll({
      where: { status: 'Active', dialing_code: { [Op.not]: null } },
      attributes: ['id', 'name', 'country_code', 'dialing_code'],
      order: [['name', 'ASC']],
    });
    return ResponseHelper.success(res, 'Phone codes retrieved', countries);
  });

  // GET /api/config - Get app configuration
  static getConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const configs = await Config.findAll();
    const configObj = configs.reduce((acc: any, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {});
    return ResponseHelper.success(res, 'Configuration retrieved', configObj);
  });

  // GET /api/home - Home page data
  static getHomeData = asyncHandler(async (req: AuthRequest, res: Response) => {
    const [banners, packages] = await Promise.all([
      Banner.findAll({ where: { status: 'Active' }, order: [['order_by', 'ASC']], limit: 5 }),
      Package.findAll({ where: { status: 'Active' }, order: [['price', 'ASC']], limit: 3 }),
    ]);

    return ResponseHelper.success(res, 'Home data retrieved', { banners, packages });
  });

  // GET /api/user/customer/search - Global user search
 static searchProfiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  let { gender, mat_status, religion, caste, min_age, max_age, city, page = 1, limit = 20 } = req.query;

  // Normalize camelCase query params
  min_age = min_age || req.query.minAge;
  max_age = max_age || req.query.maxAge;

  const where: any = { status: 'Active' };
  if (gender) where.gender = gender;
  if (mat_status) where.mat_status = mat_status;
  if (religion) where.religion = religion;
  if (caste) where.caste = caste;
  if (city) where.state = city;

  if (min_age || max_age) {
    where.age = {};
    if (min_age) where.age[Op.gte] = Number(String(min_age).trim());
    if (max_age) where.age[Op.lte] = Number(String(max_age).trim());
  }

  // Mutual block check
  if (req.userId) {
    const { BlockProfile } = await import('../../models');
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
    where.id = { [Op.notIn]: [req.userId, ...blockedIds] };
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    include: ['profile', 'religionRelation', 'casteRelation'],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    attributes: { exclude: ['password', 'otp'] },
  });

  return ResponseHelper.paginated(res, 'Search results', rows, count, Number(page), Number(limit));
});

  // GET /api/user/serachById - Search user by RYT ID
  static searchByRytId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ryt_id } = req.query;
    const { BlockProfile } = await import('../../models');

    if (!ryt_id) {
      return ResponseHelper.error(res, 'RYT ID is required', 400);
    }
    
    const user = await User.findOne({
      where: { ryt_id, status: 'Active' },
      include: ['profile'],
      attributes: { exclude: ['password'] },
    });

    if (user && req.userId) {
      // Mutual block check
      const isBlocked = await BlockProfile.findOne({
        where: {
          [Op.or]: [
            { user_id: req.userId, block_profile_id: user.id, status: 'Yes' },
            { user_id: user.id, block_profile_id: req.userId, status: 'Yes' }
          ]
        }
      });
      if (isBlocked) {
        return ResponseHelper.success(res, 'User not found', null);
      }
    }

    return ResponseHelper.success(res, user ? 'User found' : 'User not found', user);
  });

  // GET /api/userById/:id - Get user by ID
  static getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findByPk(req.params.id, {
      include: ['profile'],
      attributes: { exclude: ['password'] },
    });

    return ResponseHelper.success(res, 'User retrieved', user);
  });

static sendEnquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, contact_no, message } = req.body;

  const enquiry = await Enquiry.create({
    name,
    contact_no,
    message,
  });

  return ResponseHelper.success(
    res,
    "Enquiry submitted successfully",
    enquiry // <-- Pass as data instead of status
  );
});



  // GET /api/testsms - Test SMS functionality
  static testSms = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement SMS test
    return ResponseHelper.success(res, 'SMS test endpoint');
  });

  // GET /api/test - Test route
  static test = asyncHandler(async (req: AuthRequest, res: Response) => {
    return ResponseHelper.success(res, 'Test endpoint working');
  });

  // GET /api/mailVerified/:id - Mail verification
  static mailVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement email verification logic
    return ResponseHelper.success(res, 'Email verified successfully');
  });

  // GET /api/order/:id/invoice - Get order invoice
  static getOrderInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Generate and return order invoice
    return ResponseHelper.success(res, 'Invoice retrieved', {});
  });

  // GET /api/get-user-profiles - Get user profiles
  static getUserProfiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement get all user profiles with filtering
    return ResponseHelper.success(res, 'User profiles retrieved', []);
  });

  // GET /api/cms_page/:cms_type/:subject_id - Get samples by subject
  static getSamplesBySubject = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement get samples by subject
    return ResponseHelper.success(res, 'Samples retrieved', []);
  });

  // GET /api/cms_page/:cms_type/:subject_id/:id - Get samples by subject and CMS ID
  static getSamplesBySubjectCmsId = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement get samples by subject and CMS ID
    return ResponseHelper.success(res, 'Sample retrieved', {});
  });

  // GET /api/cmsById/:id - Get CMS by ID
  static getCmsById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cms = await Cms.findByPk(req.params.id);
    return ResponseHelper.success(res, 'CMS retrieved', cms);
  });

  // GET /api/utilities/all - Get all utilities
  static getAllUtilities = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement get all utilities (religions, castes, countries, states, cities, areas)
    return ResponseHelper.success(res, 'Utilities retrieved', {});
  });

  // GET /api/currencies - Get currencies
  static getCurrencies = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement get currencies
    return ResponseHelper.success(res, 'Currencies retrieved', []);
  });

  // GET /api/countries - Get countries
  static getCountries = asyncHandler(async (req: AuthRequest, res: Response) => {
    const countries = await Country.findAll({
      where: { status: 'Active' },
      order: [['name', 'ASC']],
    });
    return ResponseHelper.success(res, 'Countries retrieved', countries);
  });

  // POST /api/customer/signup - Customer signup
  static customerSignup = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement customer signup
    return ResponseHelper.success(res, 'Customer registered successfully', {});
  });

  // POST /api/customer/verify/phone - Verify phone
  static verifyPhone = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement phone verification
    return ResponseHelper.success(res, 'Phone verified successfully');
  });

  // POST /api/customer/login - Customer login
  static customerLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement customer login
    return ResponseHelper.success(res, 'Login successful', {});
  });

  // POST /api/vendor/signup - Vendor signup
  static vendorSignup = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement vendor signup
    return ResponseHelper.success(res, 'Vendor registered successfully', {});
  });

  // GET /api/user/encrypted-data - Get encrypted data
  static getEncryptedData = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement encryption logic
    return ResponseHelper.success(res, 'Encrypted data', {});
  });

  // GET /api/user/thikana/:area_id - Get thikana by area
  static getThikanaByArea = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement get thikana by area
    return ResponseHelper.success(res, 'Thikana retrieved', []);
  });

  // GET /api/user/thikhana/search - Search thikana
  static searchThikana = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement thikana search
    return ResponseHelper.success(res, 'Thikana search results', []);
  });

  // GET /api/user/thikhana-searchByName - Search thikana by name
  static searchThikanaByName = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement thikana search by name
    return ResponseHelper.success(res, 'Thikana search results', []);
  });

  // GET /api/user/thikhana/:id - Get thikana by ID
  static getThikanaById = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement get thikana by ID
    return ResponseHelper.success(res, 'Thikana retrieved', {});
  });

  // POST /api/user/thikhanaenquiry - Thikana enquiry
  static thikhanaEnquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Save thikana enquiry to database
    return ResponseHelper.success(res, 'Enquiry submitted successfully');
  });

  // GET /api/user/thikhanaquestion - Get thikana questions
  static getThikhanaQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement get thikana questions
    return ResponseHelper.success(res, 'Questions retrieved', []);
  });
}
