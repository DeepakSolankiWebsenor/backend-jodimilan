# Laravel to Express Routes Migration

This document outlines all routes that have been migrated from the Laravel backend (`laravel-backend/routes/api.php`) to the Express application (`new-express-app`).

## Overview

All Laravel API routes have been recreated in the Express application with **identical paths**, allowing you to simply change the base URL in your frontend without any other modifications.

**Laravel Base URL:** `http://your-domain.com/api/`
**Express Base URL:** `http://your-domain.com:3000/api/`

## Routes Summary

### ✅ Public Routes (No Authentication Required)

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| GET | `/api/testsms` | `/api/testsms` | ✅ |
| GET | `/api/test` | `/api/test` | ✅ |
| GET | `/api/home` | `/api/home` | ✅ |
| GET | `/api/mailVerified/:id` | `/api/mailVerified/:id` | ✅ |
| GET | `/api/config` | `/api/config` | ✅ |
| GET | `/api/phone-codes` | `/api/phone-codes` | ✅ |
| GET | `/api/order/:id/invoice` | `/api/order/:id/invoice` | ✅ |
| GET | `/api/razorpay-callback` | `/api/razorpay-callback` | ✅ |
| GET | `/api/get-user-profiles` | `/api/get-user-profiles` | ✅ |
| GET | `/api/cms` | `/api/cms` | ✅ |
| GET | `/api/cms/:cms_type/:category_id?` | `/api/cms/:cms_type/:category_id?` | ✅ |
| GET | `/api/cms_page/:cms_type/:subject_id` | `/api/cms_page/:cms_type/:subject_id` | ✅ |
| GET | `/api/cms_page/:cms_type/:subject_id/:id` | `/api/cms_page/:cms_type/:subject_id/:id` | ✅ |
| GET | `/api/cmsById/:id` | `/api/cmsById/:id` | ✅ |
| GET | `/api/utilities/all` | `/api/utilities/all` | ✅ |
| GET | `/api/currencies` | `/api/currencies` | ✅ |
| GET | `/api/countries` | `/api/countries` | ✅ |
| GET | `/api/userById/:id` | `/api/userById/:id` | ✅ |
| POST | `/api/customer/signup` | `/api/customer/signup` | ✅ |
| POST | `/api/customer/verify/phone` | `/api/customer/verify/phone` | ✅ |
| POST | `/api/customer/login` | `/api/customer/login` | ✅ |
| POST | `/api/vendor/signup` | `/api/vendor/signup` | ✅ |

### ✅ Customer Prefix Routes

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| GET | `/api/customer/Get-All-Category/:page?` | `/api/customer/Get-All-Category/:page?` | ✅ |
| GET | `/api/customer/CategoryById/:id` | `/api/customer/CategoryById/:id` | ✅ |
| GET | `/api/customer/CategoryBySlug/:slug` | `/api/customer/CategoryBySlug/:slug` | ✅ |
| GET | `/api/customer/Get-All-subject/:page?` | `/api/customer/Get-All-subject/:page?` | ✅ |
| GET | `/api/customer/SubjectById/:id` | `/api/customer/SubjectById/:id` | ✅ |
| GET | `/api/customer/SubjectWithCategory` | `/api/customer/SubjectWithCategory` | ✅ |
| GET | `/api/customer/SubjectByCategory/:id` | `/api/customer/SubjectByCategory/:id` | ✅ |
| GET | `/api/customer/profile` | `/api/customer/profile` | ✅ (Auth) |
| POST | `/api/customer/profile` | `/api/customer/profile` | ✅ (Auth) |
| GET | `/api/customer/payments` | `/api/customer/payments` | ✅ (Auth) |
| POST | `/api/customer/payments` | `/api/customer/payments` | ✅ (Auth) |
| GET | `/api/customer/coupons` | `/api/customer/coupons` | ✅ (Auth) |

### ✅ Authentication Routes (`/api/auth`)

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| POST | `/api/auth/login` | `/api/auth/login` | ✅ |
| POST | `/api/auth/otp/login` | `/api/auth/otp/login` | ✅ |
| POST | `/api/auth/signup` | `/api/auth/signup` | ✅ |
| POST | `/api/auth/create/otp` | `/api/auth/create/otp` | ✅ |
| POST | `/api/auth/resend/otp` | `/api/auth/resend/otp` | ✅ |
| POST | `/api/auth/forgot-password` | `/api/auth/forgot-password` | ✅ |
| POST | `/api/auth/verify-phone` | `/api/auth/verify-phone` | ✅ (Auth) |
| POST | `/api/auth/logout` | `/api/auth/logout` | ✅ (Auth) |
| GET | `/api/auth/user` | `/api/auth/user` | ✅ (Auth) |
| POST | `/api/auth/change-password` | `/api/auth/change-password` | ✅ (Auth) |
| GET | `/api/auth/userMailVerified/:id` | `/api/auth/userMailVerified/:id` | ✅ (Auth) |
| POST | `/api/auth/updateProfile` | `/api/auth/updateProfile` | ✅ (Auth) |
| POST | `/api/auth/profileFieldUpdate` | `/api/auth/profileFieldUpdate` | ✅ (Auth) |
| POST | `/api/auth/verifyOtp` | `/api/auth/verifyOtp` | ✅ (Auth) |

### ✅ User Routes (`/api/user`)

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| GET | `/api/user/encrypted-data` | `/api/user/encrypted-data` | ✅ |
| GET | `/api/user/state/:country_code` | `/api/user/state/:country_code` | ✅ |
| GET | `/api/user/city/:state_id` | `/api/user/city/:state_id` | ✅ |
| GET | `/api/user/area/:city_id` | `/api/user/area/:city_id` | ✅ |
| GET | `/api/user/thikana/:area_id` | `/api/user/thikana/:area_id` | ✅ |
| GET | `/api/user/slider` | `/api/user/slider` | ✅ |
| GET | `/api/user/common-options` | `/api/user/common-options` | ✅ |
| GET | `/api/user/packages` | `/api/user/packages` | ✅ |
| GET | `/api/user/cms/:type` | `/api/user/cms/:type` | ✅ |
| GET | `/api/user/customer/search` | `/api/user/customer/search` | ✅ |
| GET | `/api/user/thikhana/search` | `/api/user/thikhana/search` | ✅ |
| GET | `/api/user/thikhana-searchByName` | `/api/user/thikhana-searchByName` | ✅ |
| GET | `/api/user/thikhana/:id` | `/api/user/thikhana/:id` | ✅ |
| GET | `/api/user/serachById` | `/api/user/serachById` | ✅ |
| GET | `/api/user/userprofiles` | `/api/user/userprofiles` | ✅ |
| POST | `/api/user/customer/signup` | `/api/user/customer/signup` | ✅ |
| POST | `/api/user/customer/verify/phone` | `/api/user/customer/verify/phone` | ✅ |
| POST | `/api/user/customer/verify/email` | `/api/user/customer/verify/email` | ✅ |
| POST | `/api/user/resendOtp` | `/api/user/resendOtp` | ✅ |
| POST | `/api/user/customer/login` | `/api/user/customer/login` | ✅ |
| POST | `/api/user/forgot-password` | `/api/user/forgot-password` | ✅ |
| POST | `/api/user/thikhanaenquiry` | `/api/user/thikhanaenquiry` | ✅ |
| GET | `/api/user/thikhanaquestion` | `/api/user/thikhanaquestion` | ✅ |
| POST | `/api/user/send/enquiry` | `/api/user/send/enquiry` | ✅ |

### ✅ Authenticated User Routes

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| POST | `/api/user/create/otp` | `/api/user/create/otp` | ✅ (Auth) |
| POST | `/api/user/create/otp/email` | `/api/user/create/otp/email` | ✅ (Auth) |
| POST | `/api/user/subscribe` | `/api/user/subscribe` | ✅ (Auth) |
| POST | `/api/user/unsubscribe` | `/api/user/unsubscribe` | ✅ (Auth) |
| POST | `/api/user/change-password` | `/api/user/change-password` | ✅ (Auth) |
| GET | `/api/user/profile` | `/api/user/profile` | ✅ (Auth) |
| POST | `/api/user/profile/update` | `/api/user/profile/update` | ✅ (Auth) |
| POST | `/api/user/profile/update-partner-preferences` | `/api/user/profile/update-partner-preferences` | ✅ (Auth) |
| GET | `/api/user/currrent-plan` | `/api/user/currrent-plan` | ✅ (Auth) |
| GET | `/api/user/profileById/:id` | `/api/user/profileById/:id` | ✅ (Auth) |
| GET | `/api/user/view-contact/:id` | `/api/user/view-contact/:id` | ✅ (Auth) |
| GET | `/api/user/wishlist` | `/api/user/wishlist` | ✅ (Auth) |
| POST | `/api/user/add/wishlist` | `/api/user/add/wishlist` | ✅ (Auth) |
| POST | `/api/user/remove/wishlist/:id` | `/api/user/remove/wishlist/:id` | ✅ (Auth) |
| POST | `/api/user/block/profile` | `/api/user/block/profile` | ✅ (Auth) |
| GET | `/api/user/block/profile/user` | `/api/user/block/profile/user` | ✅ (Auth) |
| GET | `/api/user/browseProfile` | `/api/user/browseProfile` | ✅ (Auth) |
| POST | `/api/user/plansuscribe` | `/api/user/plansuscribe` | ✅ (Auth) |
| POST | `/api/user/friend/request/send` | `/api/user/friend/request/send` | ✅ (Auth) |
| GET | `/api/user/auth/user/friend/requests` | `/api/user/auth/user/friend/requests` | ✅ (Auth) |
| POST | `/api/user/friend/requests/accept` | `/api/user/friend/requests/accept` | ✅ (Auth) |
| GET | `/api/user/friend/requests/accepted` | `/api/user/friend/requests/accepted` | ✅ (Auth) |
| GET | `/api/user/friend/requests/pending` | `/api/user/friend/requests/pending` | ✅ (Auth) |
| POST | `/api/user/friend/requests/decline` | `/api/user/friend/requests/decline` | ✅ (Auth) |
| POST | `/api/user/album/images/upload` | `/api/user/album/images/upload` | ✅ (Auth) |
| POST | `/api/user/album/images/delete/:id` | `/api/user/album/images/delete/:id` | ✅ (Auth) |
| POST | `/api/user/delete/account` | `/api/user/delete/account` | ✅ (Auth) |
| GET | `/api/user/daily/recommendation/profile` | `/api/user/daily/recommendation/profile` | ✅ (Auth) |
| GET | `/api/user/notifications` | `/api/user/notifications` | ✅ (Auth) |
| GET | `/api/user/readnotifications/:id` | `/api/user/readnotifications/:id` | ✅ (Auth) |
| POST | `/api/user/profile/image/remove` | `/api/user/profile/image/remove` | ✅ (Auth) |
| POST | `/api/user/photo/request/send` | `/api/user/photo/request/send` | ✅ (Auth) |

### ✅ Order Routes (Authenticated)

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| POST | `/api/Order-Create` | `/api/Order-Create` | ✅ (Auth) |
| POST | `/api/Order-Checkout` | `/api/Order-Checkout` | ✅ (Auth) |
| GET | `/api/My-Orders` | `/api/My-Orders` | ✅ (Auth) |
| GET | `/api/OrderByid/:id` | `/api/OrderByid/:id` | ✅ (Auth) |
| POST | `/api/Order-Status-change` | `/api/Order-Status-change` | ✅ (Auth) |
| POST | `/api/order/generate-order-id` | `/api/order/generate-order-id` | ✅ (Auth) |
| GET | `/api/all-orders` | `/api/all-orders` | ✅ (Auth) |
| GET | `/api/ordersByStatus/:status` | `/api/ordersByStatus/:status` | ✅ (Auth) |
| GET | `/api/payment-gateway` | `/api/payment-gateway` | ✅ (Auth) |
| POST | `/api/user/order/create` | `/api/user/order/create` | ✅ (Auth) |
| POST | `/api/user/order/Checkout` | `/api/user/order/Checkout` | ✅ (Auth) |
| GET | `/api/user/order/history` | `/api/user/order/history` | ✅ (Auth) |
| POST | `/api/user/plansuscribe` | `/api/user/plansuscribe` | ✅ (Auth) |

### ✅ Cart & Coupon Routes (Authenticated)

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| POST | `/api/Add-Cart` | `/api/Add-Cart` | ✅ (Auth) |
| POST | `/api/Check-Price` | `/api/Check-Price` | ✅ (Auth) |
| POST | `/api/Apply-Coupon` | `/api/Apply-Coupon` | ✅ (Auth) |

### ✅ Chat Routes (Authenticated)

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| POST | `/api/session/create` | `/api/session/create` | ✅ (Auth) |
| GET | `/api/customer/chat/list` | `/api/customer/chat/list` | ✅ (Auth) |
| POST | `/api/getFriends` | `/api/getFriends` | ✅ (Auth) |
| POST | `/api/session/:session/chats` | `/api/session/:session/chats` | ✅ (Auth) |
| POST | `/api/session/:session/read` | `/api/session/:session/read` | ✅ (Auth) |
| POST | `/api/session/:session/clear` | `/api/session/:session/clear` | ✅ (Auth) |
| POST | `/api/session/:session/block` | `/api/session/:session/block` | ✅ (Auth) |
| POST | `/api/session/:session/unblock` | `/api/session/:session/unblock` | ✅ (Auth) |
| POST | `/api/send/:session` | `/api/send/:session` | ✅ (Auth) |

### ✅ Order Chat Routes (Authenticated)

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| GET | `/api/orderChat/list` | `/api/orderChat/list` | ✅ (Auth) |
| POST | `/api/order-session/create` | `/api/order-session/create` | ✅ (Auth) |
| POST | `/api/order-session/:id/chats` | `/api/order-session/:id/chats` | ✅ (Auth) |
| POST | `/api/order-session/:id/read` | `/api/order-session/:id/read` | ✅ (Auth) |
| POST | `/api/order-session/send/:id` | `/api/order-session/send/:id` | ✅ (Auth) |
| POST | `/api/order-session/:session/clear` | `/api/order-session/:session/clear` | ✅ (Auth) |

### ✅ Payment Routes

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| GET | `/api/razorpay-callback` | `/api/razorpay-callback` | ✅ |
| POST | `/api/user/razorpay-create-order` | `/api/user/razorpay-create-order` | ✅ (Auth) |
| POST | `/api/user/razorpay-verify-payment` | `/api/user/razorpay-verify-payment` | ✅ (Auth) |
| POST | `/api/user/cc-avenue-create-order` | `/api/user/cc-avenue-create-order` | ✅ (Auth) |

### ✅ Notification Routes (Authenticated)

| Method | Laravel Route | Express Route | Status |
|--------|--------------|---------------|---------|
| GET | `/api/notification_status/:status?` | `/api/notification_status/:status?` | ✅ (Auth) |
| GET | `/api/notification/:type?/:page?` | `/api/notification/:type?/:page?` | ✅ (Auth) |

## File Structure

```
new-express-app/
├── src/
│   ├── routes/
│   │   ├── index.ts              # Main router (combines all routes)
│   │   ├── auth.routes.ts        # Authentication routes
│   │   ├── common.routes.ts      # Public common routes
│   │   ├── user.routes.ts        # User-specific routes
│   │   ├── customer.routes.ts    # Customer routes (Category, Subject, etc.)
│   │   ├── order.routes.ts       # Order management routes
│   │   ├── cart.routes.ts        # Cart & pricing routes
│   │   ├── chat.routes.ts        # Chat & messaging routes
│   │   ├── payment.routes.ts     # Payment gateway routes
│   │   └── notification.routes.ts # Notification routes
│   ├── controllers/
│   │   ├── auth/
│   │   │   └── auth.controller.ts
│   │   ├── common/
│   │   │   └── common.controller.ts
│   │   ├── user/
│   │   │   ├── profile.controller.ts
│   │   │   └── social.controller.ts
│   │   ├── customer/
│   │   │   └── customer.controller.ts
│   │   ├── order/
│   │   │   └── order.controller.ts
│   │   ├── cart/
│   │   │   └── cart.controller.ts
│   │   ├── coupon/
│   │   │   └── coupon.controller.ts
│   │   ├── chat/
│   │   │   └── chat.controller.ts
│   │   ├── payment/
│   │   │   └── payment.controller.ts
│   │   └── notification/
│   │       └── notification.controller.ts
│   └── middlewares/
│       ├── auth.ts               # Authentication middleware
│       ├── errorHandler.ts       # Error handling
│       └── validation.ts         # Request validation
```

## How to Use

### 1. Start the Express Server

```bash
cd new-express-app
npm install
npm run dev
```

The server will start on `http://localhost:3000` by default.

### 2. Update Frontend Configuration

In your frontend application, simply update the API base URL:

**Before (Laravel):**
```javascript
const API_BASE_URL = 'http://your-domain.com/api';
```

**After (Express):**
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### 3. Authentication

The Express app uses the same authentication mechanism as Laravel:
- JWT tokens via Laravel Passport compatibility
- Same token format and validation
- Tokens are sent in the `Authorization` header: `Bearer <token>`

## Implementation Status

### ✅ Completed (100% Route Coverage)
- All route paths match Laravel exactly
- All route files created and organized
- All controller stubs created with proper response structure
- Authentication middleware configured
- Validation middleware in place

### 🔨 TODO (Business Logic Implementation)
Most routes return success responses with placeholder data. You need to implement:

1. **Database Integration**
   - Connect to MySQL database (models already set up)
   - Implement actual queries in controllers

2. **Business Logic**
   - Cart calculations
   - Coupon validation
   - Order processing
   - Payment gateway integration (Razorpay, CCAvenue)
   - SMS sending
   - Email sending
   - Firebase notifications

3. **File Uploads**
   - Profile images
   - Album images
   - Document uploads

4. **Real-time Features**
   - WebSocket for chat
   - Real-time notifications

## Testing

You can test the routes using the provided Postman collection:
- `Jodi_Milan_API.postman_collection.json`
- `Jodi_Milan_Environment.postman_environment.json`

Simply update the `baseUrl` variable in the environment to point to `http://localhost:3000/api`.

## Notes

- All routes are prefixed with `/api`
- All authenticated routes require `Authorization: Bearer <token>` header
- Response format matches Laravel's API response helper
- Error handling returns consistent error responses
- All controller methods have TODO comments indicating what business logic needs to be implemented

## Next Steps

1. **Start the Express server** and verify all routes are accessible
2. **Update your frontend** to use the Express base URL
3. **Test basic routes** (public routes, authentication)
4. **Gradually implement business logic** in controllers as needed
5. **Connect to your MySQL database** to persist data

Your frontend should work immediately with the Express backend, though some features will return placeholder data until the business logic is fully implemented.
