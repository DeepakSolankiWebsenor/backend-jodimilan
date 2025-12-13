# Authentication System API Documentation

## Overview
This document details the authentication endpoints for the Jodi Milan API. The system uses phone OTP for verification and JWT for session management.

## Base URL
`http://localhost:3000/api`

## Endpoints

### 1. Signup
**Endpoint:** `POST /auth/signup`
**Description:** Register a new user. Sends a 6-digit OTP to the provided phone number.

**Request Body:**
```json
{
  "name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "dialing_code": "91",
  "password": "SecurePassword123!",
  "gender": "Male",
  "dob": "1990-01-01",
  "profile_by": "Self",
  "mat_status": "Unmarried",
  "religion": 1,
  "caste": 1,
  "country": 1,
  "state": 1
}
```

**Response (201 Created):**
```json
{
  "code": 201,
  "success": true,
  "message": "User registered successfully. Verify Phone OTP.",
  "data": {
    "user_id": 123,
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

---

### 2. Verify OTP (Public)
**Endpoint:** `POST /auth/verify-otp`
**Description:** Verify phone number using OTP. Returns access token upon success.

**Request Body:**
```json
{
  "phone": "9876543210",
  "dialing_code": "91",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "message": "Phone verified successfully",
  "data": {
    "message": "Phone verified successfully",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2025-12-10T10:00:00.000Z",
    "user": "base64_encoded_encrypted_user_json",
    "user_id": 123
  }
}
```

---

### 3. Login
**Endpoint:** `POST /auth/login`
**Description:** Login with Email/Phone/RYT-ID and Password. Checks if phone is verified.

**Request Body:**
```json
{
  "email": "9876543210", 
  "password": "SecurePassword123!",
  "dialing_code": "91"
}
```
*(Note: `email` field can accept Email, Phone, or RYT ID)*

**Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "message": "Successfully logged in",
  "data": {
    "user": "base64_encoded_encrypted_user_json",
    "user_id": 123,
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_at": "2023-12-10T10:00:00.000Z"
  }
}
```

**Response (403 Forbidden - Unverified):**
```json
{
  "code": 403,
  "success": false,
  "message": "Account not verified. Please verify your phone number"
}
```

---

### 4. Resend OTP
**Endpoint:** `POST /auth/resend/otp`
**Description:** Resend OTP to phone. Enforces 30s cooldown and max 3 attempts.

**Request Body:**
```json
{
  "phone": "9876543210",
  "dialing_code": "91"
}
```

**Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "otp": "123456" 
  }
}
```

**Response (400 Bad Request):**
```json
{
  "code": 400,
  "success": false,
  "message": "Please wait 30 seconds before resending OTP" 
}
```

---

### 5. Login with OTP
**Endpoint:** `POST /auth/otp/login`
**Description:** Login directly using Phone and OTP (Passwordless).

**Request Body:**
```json
{
  "phone": "9876543210",
  "dialing_code": "91",
  "otp": "123456"
}
```

**Response (200 OK):**
*(Same as Login)*

## Authentication Flow
1. **Signup**: User enters details -> System sends OTP.
2. **Verify**: User enters OTP at `/auth/verify-otp`. System verifies and returns Token.
3. **Login**: User enters credentials. If unverified (403), Frontend prompts OTP verification.
4. **Token**: Includes `userId`, `email`, `phone`, `ryt_id`.
