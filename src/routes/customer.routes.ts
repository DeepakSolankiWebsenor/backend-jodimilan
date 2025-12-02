import { Router } from 'express';
import { CustomerController } from '../controllers/customer/customer.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Category routes (public under /customer prefix)
router.get('/Get-All-Category/:page?', CustomerController.getAllCategories);
router.get('/CategoryById/:id', CustomerController.getCategoryById);
router.get('/CategoryBySlug/:slug', CustomerController.getCategoryBySlug);

// Subject routes (public under /customer prefix)
router.get('/Get-All-subject/:page?', CustomerController.getAllSubjects);
router.get('/SubjectById/:id', CustomerController.getSubjectById);
router.get('/SubjectWithCategory', CustomerController.getSubjectWithCategory);
router.get('/SubjectByCategory/:id', CustomerController.getSubjectByCategory);

// Authenticated customer-specific routes
router.use(authenticate);

// Customer profile routes (with Customer role)
router.post('/profile', CustomerController.updateProfile);
router.get('/profile', CustomerController.getProfile);

// Payments resource routes
router.get('/payments', CustomerController.getPayments);
router.post('/payments', CustomerController.createPayment);
router.get('/payments/:id', CustomerController.getPaymentById);
router.put('/payments/:id', CustomerController.updatePayment);
router.delete('/payments/:id', CustomerController.deletePayment);

// Coupons resource routes
router.get('/coupons', CustomerController.getCoupons);
router.post('/coupons', CustomerController.createCoupon);
router.get('/coupons/:id', CustomerController.getCouponById);
router.put('/coupons/:id', CustomerController.updateCoupon);
router.delete('/coupons/:id', CustomerController.deleteCoupon);

export default router;
