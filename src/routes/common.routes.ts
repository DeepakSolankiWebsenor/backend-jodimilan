import { Router } from 'express';
import { CommonController } from '../controllers/common/common.controller';

const router = Router();

// Test routes
router.get('/testsms', CommonController.testSms);
router.get('/test', CommonController.test);

// Public routes
router.get('/home', CommonController.getHomeData);
router.get('/mailVerified/:id', CommonController.mailVerification);
router.get('/config', CommonController.getConfig);
router.get('/phone-codes', CommonController.getPhoneCodes);
router.get('/order/:id/invoice', CommonController.getOrderInvoice);

// User profiles
router.get('/get-user-profiles', CommonController.getUserProfiles);

// CMS routes
router.get('/cms', CommonController.getAllCms);
router.get('/cms/:cms_type/:category_id?', CommonController.getCmsPage);
router.get('/cms_page/:cms_type/:subject_id', CommonController.getSamplesBySubject);
router.get('/cms_page/:cms_type/:subject_id/:id', CommonController.getSamplesBySubjectCmsId);
router.get('/cmsById/:id', CommonController.getCmsById);

// Utilities
router.get('/utilities/all', CommonController.getAllUtilities);
router.get('/currencies', CommonController.getCurrencies);
router.get('/countries', CommonController.getCountries);

// User routes
router.get('/userById/:id', CommonController.getUserById);

// Signup routes (public)
router.post('/customer/signup', CommonController.customerSignup);
router.post('/customer/verify/phone', CommonController.verifyPhone);
router.post('/customer/login', CommonController.customerLogin);
router.post('/vendor/signup', CommonController.vendorSignup);

export default router;
