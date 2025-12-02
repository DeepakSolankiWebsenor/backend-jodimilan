# Jodi Milan - Express.js API

Complete Express.js/TypeScript implementation of the Jodi Milan matrimonial platform API with **100+ endpoints** matching the existing Laravel backend.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
createdb jodimilan_db
npm run migrate

# Start development server
npm run dev
```

Server runs on `http://localhost:3000`

## Features

✅ **100+ API Endpoints** - Complete feature parity with Laravel
✅ **JWT Authentication** - Matching Laravel Passport behavior
✅ **24 Database Models** - Full Sequelize ORM with relationships
✅ **OTP Verification** - Phone & email verification
✅ **Real-time Chat** - Session-based messaging
✅ **Payment Integration** - Razorpay & CCAvenue
✅ **Firebase Notifications** - Push notification support
✅ **SMS Integration** - WebSenor gateway
✅ **File Uploads** - Profile photos & albums
✅ **Advanced Search** - Multi-filter profile search
✅ **Partner Matching** - AI-based recommendations

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize 6.x
- **Authentication**: JWT
- **Validation**: express-validator
- **Encryption**: AES-256-CBC (Laravel compatible)

## Project Structure

```
src/
├── controllers/    # Business logic (auth, user, chat, order, payment, common)
├── models/        # Sequelize models (24 models)
├── routes/        # API routes
├── middlewares/   # Auth, validation, upload, error handling
├── services/      # Business services
├── utils/         # JWT, encryption, OTP, SMS, email, Firebase
├── validators/    # Request validation
├── types/         # TypeScript definitions
└── config/        # App & database configuration
```

## API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Authentication** | 15 | Signup, login, OTP, password management |
| **User Profile** | 40+ | Profile CRUD, albums, preferences |
| **Social** | 7 | Friend requests, photo requests |
| **Chat** | 8 | Real-time messaging system |
| **Orders** | 12 | Package subscriptions |
| **Payment** | 5 | Razorpay, CCAvenue integration |
| **Common** | 20+ | Location data, CMS, search |

## Scripts

```bash
npm run dev          # Development server with auto-reload
npm run build        # Compile TypeScript
npm start           # Production server
npm run migrate      # Run database migrations
npm run seed        # Seed database
npm test           # Run tests
npm run lint        # Lint code
npm run format      # Format code
```

## Environment Variables

Key variables to configure in `.env`:

```env
# App
APP_PORT=3000
JWT_SECRET=your-secret-key

# Database
DB_HOST=127.0.0.1
DB_NAME=jodimilan_db
DB_USER=postgres
DB_PASSWORD=your_password

# Payment
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# SMS
SMS_USERNAME=your_username
SMS_PASSWORD=your_password

# Firebase
FIREBASE_PRIVATE_KEY_PATH=./config/firebase-credentials.json
```

See `.env.example` for complete configuration.

## Documentation

📖 **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Complete implementation guide with:
- Detailed setup instructions
- Database schema & migrations
- All API endpoints with request/response examples
- Laravel to Express migration guide
- Deployment guide

## API Examples

### Authentication
```bash
# Signup
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "gender": "Male",
  "dob": "1995-01-01"
  ...
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

# Response
{
  "code": 200,
  "success": true,
  "message": "Successfully logged in",
  "data": {
    "access_token": "eyJhbGc...",
    "token_type": "Bearer",
    "expires_at": "2024-02-01T00:00:00.000Z"
  }
}
```

### Profile Search
```bash
GET /api/user/browseProfile?gender=Female&min_age=25&max_age=30
Authorization: Bearer {token}
```

### Create Order & Payment
```bash
# Create order
POST /api/user/order/create
Authorization: Bearer {token}
{
  "package_id": 1,
  "total": 499.00
}

# Create Razorpay payment
POST /api/user/razorpay-create-order
{
  "order_id": 123,
  "amount": 499.00
}
```

## Deployment

### Production with PM2
```bash
npm run build
pm2 start dist/index.js --name jodimilan-api
pm2 save
```

### Docker
```bash
docker build -t jodimilan-api .
docker run -p 3000:3000 --env-file .env jodimilan-api
```

## Key Features

### 1. Laravel-Compatible Encryption
Data encrypted with AES-256-CBC can be decrypted by both Laravel and Express implementations.

### 2. Exact Request/Response Matching
All endpoints maintain identical request bodies and response structures with the Laravel backend.

### 3. JWT with 14-day Expiry
Matches Laravel Passport token behavior with 2-week validity.

### 4. Partner Preference Matching
AI-based daily recommendations using user preferences.

### 5. Profile View Tracking
Package-based profile view limits with automatic decrement.

## License

Proprietary - Jodi Milan

## Support

For detailed documentation, see [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-19
# jodimelan-backend-express
