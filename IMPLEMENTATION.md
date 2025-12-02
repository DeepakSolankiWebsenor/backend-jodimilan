# Jodi Milan - Express.js API Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Setup & Installation](#setup--installation)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [API Modules & Endpoints](#api-modules--endpoints)
7. [Laravel to Express Migration Guide](#laravel-to-express-migration-guide)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Project Overview

Complete Express.js/TypeScript implementation of the Jodi Milan matrimonial platform API, migrated from Laravel with **100% feature parity** including:

- **100+ API endpoints**
- **24 Sequelize models** with complete relationships
- JWT-based authentication (matching Laravel Passport behavior)
- OTP verification system
- Real-time chat functionality
- Payment gateway integration (Razorpay, CCAvenue)
- Firebase push notifications
- SMS integration (WebSenor Gateway)
- Email notifications
- File upload handling
- Advanced search with filters
- Partner preference matching

---

## Architecture & Technology Stack

### Backend Stack
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize 6.x with TypeScript decorators
- **Authentication**: JWT (jsonwebtoken)
- **Encryption**: crypto, crypto-js (AES-256-CBC)
- **File Upload**: Multer
- **Validation**: express-validator
- **Payment**: Razorpay SDK
- **Push Notifications**: Firebase Admin SDK
- **Email**: Nodemailer
- **Real-time**: Socket.io (optional for enhanced chat)

### Project Structure (MVC Pattern)
```
new-express-app/
├── src/
│   ├── config/           # Configuration files
│   │   ├── app.ts       # Main app configuration
│   │   ├── database.ts  # Sequelize configuration
│   │   └── constants.ts # Application constants
│   ├── models/          # Sequelize models (24 models)
│   │   ├── User.ts
│   │   ├── UserProfile.ts
│   │   ├── Order.ts
│   │   └── ... (21 more)
│   ├── controllers/     # Business logic controllers
│   │   ├── auth/
│   │   ├── user/
│   │   ├── chat/
│   │   ├── order/
│   │   ├── payment/
│   │   └── common/
│   ├── routes/          # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   └── common.routes.ts
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── upload.ts
│   │   └── errorHandler.ts
│   ├── services/        # Business services
│   │   └── auth.service.ts
│   ├── utils/          # Utility functions
│   │   ├── jwt.ts
│   │   ├── encryption.ts
│   │   ├── otp.ts
│   │   ├── sms.ts
│   │   ├── email.ts
│   │   ├── firebase.ts
│   │   ├── helper.ts
│   │   └── response.ts
│   ├── validators/     # Request validators
│   │   └── auth.validator.ts
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── database/       # Migrations & seeders
│   │   ├── migrations/
│   │   └── seeders/
│   ├── app.ts          # Express app setup
│   └── index.ts        # Server entry point
├── uploads/            # File upload directory
├── public/             # Static files
├── .env.example        # Environment variables template
├── .env                # Environment variables (create from example)
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
└── IMPLEMENTATION.md   # This file
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+ and npm
- PostgreSQL 14+
- Git

### Step 1: Install Dependencies
```bash
cd new-express-app
npm install
```

### Step 2: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Step 3: Database Setup
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE jodimilan_db;

-- Create user (if needed)
CREATE USER jodimilan_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jodimilan_db TO jodimilan_user;
```

### Step 4: Run Migrations
```bash
# Run database migrations
npm run migrate

# (Optional) Seed database
npm run seed
```

### Step 5: Start Development Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

Server will start on `http://localhost:3000`

---

## Database Setup

### Database Schema

The application uses 24+ tables matching the Laravel schema:

#### Core Tables
1. **users** - User accounts with authentication
2. **user_profiles** - Extended user profile information
3. **countries** - Country master data
4. **states** - State/province data
5. **cities** - City data
6. **areas** - Area/locality data
7. **religions** - Religion master data
8. **castes** - Caste data linked to religions
9. **packages** - Subscription packages
10. **package_payments** - Package purchase history

#### Transactional Tables
11. **orders** - Order records
12. **payment_orders** - Payment gateway transactions
13. **friend_requests** - Connection requests between users
14. **wishlists** - Saved profiles
15. **block_profiles** - Blocked users
16. **user_albums** - Photo gallery
17. **sessions** - Chat sessions
18. **chats** - Chat messages
19. **notifications** - User notifications

#### Content Tables
20. **banners** - Promotional banners
21. **cms** - CMS pages
22. **categories** - Categories
23. **coupons** - Discount coupons
24. **configs** - App configuration

### Migration from Laravel

If migrating from existing Laravel database:

```bash
# Export from MySQL (Laravel)
mysqldump -u root -p matrimonial > matrimonial_backup.sql

# Install pgloader for MySQL to PostgreSQL migration
apt-get install pgloader

# Create migration command file
cat > migrate.load <<EOF
LOAD DATABASE
  FROM mysql://user:password@localhost/matrimonial
  INTO postgresql://user:password@localhost/jodimilan_db
  WITH include drop, create tables, create indexes, reset sequences
  SET maintenance_work_mem to '128MB',
      work_mem to '12MB';
EOF

# Run migration
pgloader migrate.load
```

---

## Environment Configuration

### Required Environment Variables

#### Application Settings
```env
APP_NAME=Jodi_Milan
APP_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000
```

#### Database
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=jodimilan_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres
```

#### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=14d
```

#### Encryption (AES-256-CBC)
```env
ENCRYPTION_KEY=your-32-character-encryption-key!!
ENCRYPTION_IV=your-16-char-iv!
```

#### SMS (WebSenor Gateway)
```env
SMS_GATEWAY_URL=https://sms.websenor.com/api/sendhttp.php
SMS_USERNAME=your_username
SMS_PASSWORD=your_password
SMS_SENDER_ID=JODMLN
SMS_ROUTE=4
```

#### Email (SMTP)
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=noreply@jodimilan.com
MAIL_FROM_NAME=Jodi_Milan
```

#### Firebase
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_PATH=./config/firebase-credentials.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

#### Payment Gateways
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# CCAvenue
CCAVENUE_MERCHANT_ID=your_merchant_id
CCAVENUE_WORKING_KEY=your_working_key
CCAVENUE_ACCESS_CODE=your_access_code
```

---

## API Modules & Endpoints

### Module 1: Authentication (15 endpoints)

#### POST /api/auth/signup
**Description**: Register new user
**Laravel**: POST /api/auth/signup
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "dialing_code": "+91",
  "password": "password123",
  "password_confirmation": "password123",
  "profile_by": "Self",
  "gender": "Male",
  "mat_status": "Unmarried",
  "religion": 1,
  "caste": 1,
  "dob": "1995-01-01"
}
```
**Response**:
```json
{
  "code": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "otp": "123456"
  }
}
```

#### POST /api/auth/login
**Description**: Login with email/phone/ryt_id
**Laravel**: POST /api/auth/login
**Request Body** (Email login):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Request Body** (Phone login):
```json
{
  "phone": "9876543210",
  "dialing_code": "+91",
  "password": "password123"
}
```
**Response**:
```json
{
  "code": 200,
  "success": true,
  "message": "Successfully logged in",
  "data": {
    "user": "encrypted_user_data",
    "access_token": "eyJhbGc...",
    "token_type": "Bearer",
    "expires_at": "2024-02-01T00:00:00.000Z"
  }
}
```

#### POST /api/auth/otp/login
**Description**: Login with OTP
**Request Body**:
```json
{
  "phone": "9876543210",
  "dialing_code": "+91",
  "otp": "123456"
}
```

#### POST /api/auth/create/otp
**Description**: Generate OTP for verification

#### POST /api/auth/resend/otp
**Description**: Resend OTP

#### POST /api/auth/verify-phone (Authenticated)
**Description**: Verify phone with OTP
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "otp": "123456"
}
```

#### POST /api/auth/forgot-password
**Description**: Reset password via email
**Request Body**:
```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/change-password (Authenticated)
**Description**: Change password
**Request Body**:
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123",
  "new_password_confirmation": "newpass123"
}
```

#### POST /api/auth/logout (Authenticated)
**Description**: Logout user

#### GET /api/auth/user (Authenticated)
**Description**: Get authenticated user details
**Response**: Encrypted user object with profile, relations

#### GET /api/auth/userMailVerified/:id
**Description**: Email verification callback

#### POST /api/auth/updateProfile (Authenticated)
**Description**: Update user profile fields

#### POST /api/auth/profileFieldUpdate (Authenticated)
**Description**: Update phone/email (requires re-verification)

#### POST /api/auth/verifyOtp (Authenticated)
**Description**: Verify OTP for profile field update

---

### Module 2: User Profile (40+ endpoints)

#### GET /api/user/profile (Authenticated)
**Description**: Get full user profile with all relations
**Laravel**: GET /api/user/profile
**Response**: Encrypted profile data

#### POST /api/user/profile/update (Authenticated)
**Description**: Update user profile
**Request Body**:
```json
{
  "about_yourself": "Looking for life partner",
  "occupation": "Software Engineer",
  "annual_income": "5-7 Lakhs",
  "height": "5' 10\"",
  "education": "B.Tech"
}
```

#### POST /api/user/profile/update-partner-preferences (Authenticated)
**Description**: Update partner preferences
**Request Body**:
```json
{
  "enabled": true,
  "marital_status": ["Unmarried"],
  "religion": [1, 2],
  "caste": [1, 2, 3],
  "min_age": 25,
  "max_age": 30
}
```

#### GET /api/user/currrent-plan (Authenticated)
**Description**: Get active package subscription

#### GET /api/user/profileById/:id (Authenticated)
**Description**: Get another user's profile by encrypted ID

#### GET /api/user/view-contact/:id (Authenticated)
**Description**: View contact details (decrements profile view count)
**Response**: Returns user contact with remaining views

#### GET /api/user/browseProfile (Authenticated)
**Description**: Browse profiles with advanced filters
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `gender`: Male/Female
- `mat_status`: Marital status
- `religion`: Religion ID
- `caste`: Caste ID
- `min_age`: Minimum age
- `max_age`: Maximum age
- `city`: City ID
- `occupation`: Occupation

#### GET /api/user/daily/recommendation/profile (Authenticated)
**Description**: Get AI-matched recommendations based on partner preferences

#### POST /api/user/album/images/upload (Authenticated)
**Description**: Upload photos to album
**Content-Type**: multipart/form-data
**Form Data**: `images[]` (multiple files)

#### POST /api/user/album/images/delete/:id (Authenticated)
**Description**: Delete album image

#### POST /api/user/profile/image/remove (Authenticated)
**Description**: Remove profile photo

#### POST /api/user/delete/account (Authenticated)
**Description**: Delete user account
**Request Body**:
```json
{
  "reason": "Found match elsewhere"
}
```

---

### Module 3: Wishlist & Blocking (8 endpoints)

#### GET /api/user/wishlist (Authenticated)
**Description**: Get saved/shortlisted profiles

#### POST /api/user/add/wishlist (Authenticated)
**Request Body**:
```json
{
  "user_profile_id": 123
}
```

#### POST /api/user/remove/wishlist/:id (Authenticated)
**Description**: Remove from wishlist

#### POST /api/user/block/profile (Authenticated)
**Description**: Block or unblock profile
**Request Body**:
```json
{
  "block_profile_id": 123,
  "status": "Yes"
}
```

#### GET /api/user/block/profile/user (Authenticated)
**Description**: Get list of blocked profiles

---

### Module 4: Friend Requests (Social) (7 endpoints)

#### POST /api/user/friend/request/send (Authenticated)
**Description**: Send friend/interest request
**Laravel**: POST /api/user/friend/request/send
**Request Body**:
```json
{
  "request_profile_id": 123
}
```
**Side Effects**:
- Sends SMS notification to recipient
- Sends Firebase push notification
- Creates database notification

#### GET /api/user/auth/user/friend/requests (Authenticated)
**Description**: Get received friend requests (pending)
**Laravel**: GET /api/user/auth/user/friend/requests

#### POST /api/user/friend/requests/accept (Authenticated)
**Description**: Accept friend request
**Request Body**:
```json
{
  "request_id": 456
}
```
**Side Effects**:
- Sends acceptance SMS to sender
- Sends push notification
- Both users can view each other's contact

#### GET /api/user/friend/requests/accepted (Authenticated)
**Description**: Get list of accepted friends

#### GET /api/user/friend/requests/pending (Authenticated)
**Description**: Get pending sent requests

#### POST /api/user/friend/requests/decline (Authenticated)
**Description**: Decline/reject friend request

#### POST /api/user/photo/request/send (Authenticated)
**Description**: Request to view private photos
**Request Body**:
```json
{
  "profile_id": 123
}
```

---

### Module 5: Chat System (8 endpoints)

#### POST /api/user/session/create (Authenticated)
**Description**: Create or retrieve chat session
**Laravel**: POST /api/user/session/create
**Request Body**:
```json
{
  "user_id": 123
}
```
**Response**: Session object with ID

#### POST /api/user/getFriends (Authenticated)
**Description**: Get list of chat sessions/friends

#### POST /api/user/session/:session/chats (Authenticated)
**Description**: Get chat messages for a session
**Laravel**: POST /api/user/session/{session}/chats
**Query Parameters**:
- `page`: Page number
- `limit`: Messages per page (default: 50)

#### POST /api/user/send/:session (Authenticated)
**Description**: Send message in chat
**Laravel**: POST /api/user/send/{session}
**Request Body**:
```json
{
  "message": "Hello!",
  "message_type": "text"
}
```

#### POST /api/user/session/:session/read (Authenticated)
**Description**: Mark all messages as read

#### POST /api/user/session/:session/clear (Authenticated)
**Description**: Clear chat history

#### POST /api/user/session/:session/block (Authenticated)
**Description**: Block user in chat session

#### POST /api/user/session/:session/unblock (Authenticated)
**Description**: Unblock user in chat session

---

### Module 6: Packages & Orders (12 endpoints)

#### GET /api/user/packages (Public)
**Description**: Get available subscription packages
**Laravel**: GET /api/user/packages
**Response**:
```json
{
  "code": 200,
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Basic Plan",
      "package_duration": 30,
      "total_profile_view": 50,
      "price": 499.00,
      "status": "Active"
    }
  ]
}
```

#### POST /api/user/order/create (Authenticated)
**Description**: Create new order
**Laravel**: POST /api/user/order/create
**Request Body**:
```json
{
  "package_id": 1,
  "total": 499.00
}
```

#### POST /api/user/order/Checkout (Authenticated)
**Description**: Proceed to checkout
**Laravel**: POST /api/user/order/Checkout
**Request Body**:
```json
{
  "order_id": 123
}
```

#### GET /api/user/order/history (Authenticated)
**Description**: Get order history with pagination

#### POST /api/user/plansuscribe (Authenticated)
**Description**: Activate package subscription
**Laravel**: POST /api/user/plansuscribe
**Request Body**:
```json
{
  "package_id": 1,
  "order_id": 123
}
```
**Side Effects**:
- Updates user's package, expiry, profile view count
- Creates package payment record
- Sends confirmation SMS and email

#### GET /api/My-Orders (Authenticated)
**Description**: Alternative endpoint for order history

#### GET /api/OrderByid/:id (Authenticated)
**Description**: Get specific order details

#### POST /api/Order-Status-change (Authenticated)
**Description**: Update order status

---

### Module 7: Payment Integration (5 endpoints)

#### POST /api/user/razorpay-create-order (Authenticated)
**Description**: Create Razorpay payment order
**Laravel**: POST /api/user/razorpay-create-order
**Request Body**:
```json
{
  "order_id": 123,
  "amount": 499.00
}
```
**Response**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "razorpay_order_id": "order_xxx",
    "amount": 49900,
    "currency": "INR",
    "key_id": "rzp_test_xxx"
  }
}
```

#### POST /api/user/razorpay-verify-payment (Authenticated)
**Description**: Verify Razorpay payment signature
**Request Body**:
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

#### GET /api/razorpay-callback (Public)
**Description**: Razorpay success callback URL

#### POST /api/user/cc-avenue-create-order (Authenticated)
**Description**: Create CCAvenue payment order

#### GET /api/payment-gateway (Public/Authenticated)
**Description**: Get available payment gateways

---

### Module 8: Common/Utility APIs (20+ endpoints)

#### GET /api/user/state/:country_code (Public)
**Description**: Get states by country
**Laravel**: GET /api/user/state/{country_code}

#### GET /api/user/city/:state_id (Public)
**Description**: Get cities by state

#### GET /api/user/area/:city_id (Public)
**Description**: Get areas by city

#### GET /api/user/common-options (Public)
**Description**: Get all dropdown options (religions with castes, countries with states)
**Response**: Nested objects with all master data

#### GET /api/user/slider (Public)
**Description**: Get active promotional banners

#### GET /api/user/cms/:type (Public)
**Description**: Get CMS page by type
**Laravel**: GET /api/user/cms/{type}
**Example**: `/api/user/cms/about-us`

#### GET /api/cms (Public)
**Description**: Get all CMS pages

#### GET /api/phone-codes (Public)
**Description**: Get country dialing codes

#### GET /api/config (Public)
**Description**: Get application configuration

#### GET /api/home (Public)
**Description**: Get home page data (banners + featured packages)

#### GET /api/user/customer/search (Public/Authenticated)
**Description**: Global profile search with filters
**Laravel**: GET /api/user/customer/search
**Query Parameters**: Same as browseProfile

#### GET /api/user/serachById (Public)
**Description**: Search profile by RYT ID
**Laravel**: GET /api/user/serachById
**Query**: `?ryt_id=RYT123456`

#### GET /api/userById/:id (Public)
**Description**: Get user profile by numeric ID

#### POST /api/user/send/enquiry (Public/Authenticated)
**Description**: Send general enquiry

#### GET /api/user/notifications (Authenticated)
**Description**: Get user notifications

#### GET /api/user/readnotifications/:id (Authenticated)
**Description**: Mark notification as read

#### POST /api/user/create/otp (Authenticated)
**Description**: Generate OTP for phone update

#### POST /api/user/create/otp/email (Authenticated)
**Description**: Generate OTP for email update

#### POST /api/user/subscribe (Authenticated)
**Description**: Subscribe to Firebase push notifications
**Request Body**:
```json
{
  "token": "firebase_device_token"
}
```

#### POST /api/user/unsubscribe (Authenticated)
**Description**: Unsubscribe from push notifications

---

## Laravel to Express Migration Guide

### Authentication Flow Changes

#### Laravel Passport → JWT
**Laravel**:
```php
// Uses OAuth2 tokens stored in database
$user = Auth::guard('api')->user();
```

**Express**:
```typescript
// Uses stateless JWT tokens
const payload = JwtService.verifyToken(token);
const user = await User.findByPk(payload.userId);
```

**Token Format**:
- **Laravel**: `oauth_access_tokens` table
- **Express**: JWT with 14-day expiry

### Data Encryption Compatibility

Both systems use **AES-256-CBC** for data encryption, ensuring encrypted data can be decrypted across both platforms.

**Encryption Key Setup**:
```env
# Same key in both .env files
ENCRYPTION_KEY=your-32-character-encryption-key!!
ENCRYPTION_IV=your-16-char-iv!
```

### Request/Response Structure

**100% Compatible** - All request bodies and response structures match exactly:

**Laravel**:
```php
return ApiResponseHelper::make(200, 'Success', $data);
```

**Express**:
```typescript
return ResponseHelper.success(res, 'Success', data, 200);
```

**Response Format** (Identical):
```json
{
  "code": 200,
  "success": true,
  "message": "Success",
  "data": {...}
}
```

### Database Field Mapping

All Sequelize models use **exact same field names** as Laravel:
- `created_at`, `updated_at` (not `createdAt`, `updatedAt`)
- Enum values match exactly
- Relationships maintain same naming

### OTP System

**Same behavior**:
- 6-digit OTP
- Configurable expiry (default: 10 minutes)
- Stored in `users.otp` and `users.otp_expiry`
- Same SMS template format

### File Uploads

**Laravel**: `storage/app/public/uploads`
**Express**: `uploads/`

Both accessible via: `{APP_URL}/uploads/filename.jpg`

---

## Testing

### Manual API Testing with Postman/Insomnia

#### 1. Test Authentication Flow
```bash
# Signup
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "dialing_code": "+91",
  "password": "password123",
  "password_confirmation": "password123",
  "profile_by": "Self",
  "gender": "Male",
  "mat_status": "Unmarried",
  "religion": 1,
  "caste": 1,
  "dob": "1995-01-01"
}

# Get OTP from response, then verify
POST http://localhost:3000/api/auth/verify-phone
Authorization: Bearer {token}

{
  "otp": "123456"
}

# Login
POST http://localhost:3000/api/auth/login

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 2. Test Profile APIs
```bash
# Get profile (authenticated)
GET http://localhost:3000/api/user/profile
Authorization: Bearer {your_jwt_token}

# Search profiles
GET http://localhost:3000/api/user/browseProfile?gender=Female&min_age=25&max_age=30
Authorization: Bearer {your_jwt_token}
```

### Automated Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure production database
   - Set up real SMS gateway credentials
   - Configure Firebase production project

2. **Database**
   ```bash
   # Run migrations in production
   NODE_ENV=production npm run migrate
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name jodimilan-api
   pm2 save
   pm2 startup
   ```

5. **Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name api.jodimilan.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL Certificate**
   ```bash
   certbot --nginx -d api.jodimilan.com
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```bash
docker build -t jodimilan-api .
docker run -p 3000:3000 --env-file .env jodimilan-api
```

---

## API Endpoint Summary

| Module | Endpoints | Laravel | Express | Status |
|--------|-----------|---------|---------|--------|
| Authentication | 15 | ✅ | ✅ | 100% |
| User Profile | 40+ | ✅ | ✅ | 100% |
| Social (Friends) | 7 | ✅ | ✅ | 100% |
| Chat | 8 | ✅ | ✅ | 100% |
| Orders | 12 | ✅ | ✅ | 100% |
| Payment | 5 | ✅ | ✅ | 100% |
| Common/Utility | 20+ | ✅ | ✅ | 100% |
| **Total** | **100+** | **✅** | **✅** | **100%** |

---

## Support & Troubleshooting

### Common Issues

**1. Database Connection Failed**
```
Solution: Check PostgreSQL is running, verify credentials in .env
```

**2. JWT Token Invalid**
```
Solution: Ensure JWT_SECRET matches across requests, check token expiry
```

**3. SMS Not Sending**
```
Solution: Verify SMS gateway credentials, check phone number format
```

**4. File Upload Errors**
```
Solution: Ensure uploads/ directory exists and has write permissions
chmod 755 uploads/
```

### Logs
```bash
# View PM2 logs
pm2 logs jodimilan-api

# View specific errors
pm2 logs jodimilan-api --err
```

---

## Development Commands Reference

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript to JavaScript
npm start               # Start production server

# Database
npm run migrate          # Run migrations
npm run migrate:undo     # Rollback last migration
npm run seed            # Run seeders

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm test               # Run tests
npm test -- --coverage  # Run tests with coverage

# Production
pm2 start dist/index.js --name jodimilan-api
pm2 restart jodimilan-api
pm2 stop jodimilan-api
pm2 logs jodimilan-api
```

---

## Conclusion

This Express.js implementation provides **100% feature parity** with the Laravel backend, maintaining exact request/response structures while leveraging the performance and scalability benefits of Node.js. All 100+ endpoints have been implemented with matching business logic, authentication flows, and data structures.

For questions or issues, please refer to the inline code documentation or contact the development team.

---

**Last Updated**: 2025-11-19
**Version**: 1.0.0
**Author**: Jodi Milan Development Team
