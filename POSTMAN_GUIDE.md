# Jodi Milan API - Postman Collection Guide

This guide will help you use the Postman collection to test the Jodi Milan API.

## Files Included

1. **Jodi_Milan_API.postman_collection.json** - Complete API collection with all endpoints
2. **Jodi_Milan_Environment.postman_environment.json** - Environment variables for development

## Importing into Postman

### Step 1: Import Collection
1. Open Postman
2. Click on "Import" button (top left)
3. Select "Jodi_Milan_API.postman_collection.json"
4. Click "Import"

### Step 2: Import Environment
1. Click on "Import" again
2. Select "Jodi_Milan_Environment.postman_environment.json"
3. Click "Import"

### Step 3: Select Environment
1. In the top-right corner, click the environment dropdown
2. Select "Jodi Milan - Development"

## API Structure

The collection is organized into the following folders:

### 1. Authentication
- Login (email/password)
- Login with OTP
- Signup
- Create/Resend OTP
- Forgot Password
- Verify Email/Phone
- Logout
- Get Current User
- Change Password
- Update Profile

### 2. User Profile
- Get/Update Profile
- Update Partner Preferences
- Get Current Plan
- Get Profile By ID
- View Contact
- Upload/Delete Album Images
- Remove Profile Image
- Delete Account
- Browse Profiles
- Daily Recommendations

### 3. Wishlist
- Get Wishlist
- Add to Wishlist
- Remove from Wishlist

### 4. Block Profiles
- Block Profile
- Get Blocked Profiles

### 5. Friend Requests
- Send Friend Request
- Get Received/Accepted/Pending Requests
- Accept/Decline Friend Request
- Send Photo Request

### 6. Notifications
- Get Notifications
- Mark Notification as Read

### 7. OTP & Firebase
- Create OTP
- Subscribe/Unsubscribe to Firebase

### 8. Orders
- Create Order
- Checkout
- Get Order History
- Subscribe Package
- Get My Orders
- Get Order By ID
- Change Order Status

### 9. Payments
- Create Razorpay Order
- Verify Razorpay Payment
- Create CCAvenue Order
- Razorpay Callback
- Get Payment Gateways

### 10. Chat
- Create Session
- Get Friends
- Get Messages
- Send Message
- Mark as Read
- Clear Chat
- Block/Unblock User

### 11. Common (Public)
- Get Home Data
- Get Config
- Get Phone Codes
- Get All CMS
- Get CMS Page
- Get User By ID
- Get States/Cities/Areas
- Get Banners
- Get Common Options
- Get Packages
- Search Profiles
- Search By RYT ID

## How to Use

### Testing Public Endpoints

Public endpoints don't require authentication. Simply:
1. Navigate to the request in the "Common (Public)" folder
2. Click "Send"

### Testing Authenticated Endpoints

Most endpoints require authentication. Follow these steps:

#### Step 1: Login
1. Go to **Authentication > Login**
2. Update the request body with valid credentials:
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```
3. Click "Send"
4. Copy the `token` from the response

#### Step 2: Set Auth Token
**Option A: Manual (for current session)**
1. In the environment variables (top-right), click the eye icon
2. Click "Edit" next to "Jodi Milan - Development"
3. Paste the token in the `auth_token` value field
4. Click "Save"

**Option B: Automatic (using Tests)**
Add this to the "Tests" tab of the Login request:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.data.token);
    pm.environment.set("user_id", jsonData.data.user.id);
}
```

#### Step 3: Test Authenticated Endpoints
Now all authenticated endpoints will automatically use the token from the environment variable.

## Environment Variables

The collection uses these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3006/api` |
| `auth_token` | JWT authentication token | `eyJhbGciOiJIUzI1NiIs...` |
| `user_id` | Current user ID | `1` |
| `session_id` | Chat session ID | `session_abc123` |

## Common Request Examples

### 1. Signup New User
```json
{
  "name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "1234567890",
  "dialing_code": "+91",
  "profile_by": "Self",
  "gender": "Male",
  "mat_status": "Unmarried",
  "religion": 1,
  "caste": 1,
  "dob": "1990-01-01"
}
```

### 2. Login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Update Profile
```json
{
  "gothra": "Brahmin",
  "moon_sign": "Leo",
  "manglik": "Yes",
  "height": "5.8",
  "educations": "MBA",
  "occupation": "Software Engineer",
  "annual_income": "10-15 LPA"
}
```

### 4. Search Profiles
Query Parameters:
- `gender`: Male/Female
- `age_from`: 25
- `age_to`: 35
- `religion`: 1
- `caste`: 1
- `page`: 1
- `limit`: 10

### 5. Send Friend Request
```json
{
  "receiver_id": 1,
  "message": "Hi, I would like to connect with you"
}
```

### 6. Create Razorpay Order
```json
{
  "amount": 999,
  "package_id": 1
}
```

### 7. Send Chat Message
```json
{
  "message": "Hello, how are you?",
  "type": "text"
}
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

## Testing Tips

1. **Test in Order**: Start with authentication endpoints, then move to other features
2. **Save Responses**: Use Postman's "Save Response" feature to keep example responses
3. **Use Variables**: Replace hardcoded IDs with environment variables for easier testing
4. **Check Status Codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 404: Not Found
   - 500: Server Error

## File Upload Example

For endpoints that accept file uploads (like album images):

1. Select the request
2. Go to the "Body" tab
3. Select "form-data"
4. Add a key named "images" (or appropriate field name)
5. Change type to "File" from the dropdown
6. Click "Select Files" and choose your images
7. Add other fields as text (e.g., "caption")
8. Click "Send"

## Troubleshooting

### Common Issues

**1. 401 Unauthorized Error**
- Solution: Make sure you've set the `auth_token` in environment variables after logging in

**2. 404 Not Found**
- Solution: Check if the server is running on http://localhost:3006
- Verify the base_url in environment variables

**3. 400 Bad Request**
- Solution: Check request body format matches the expected schema
- Ensure all required fields are included

**4. Server not responding**
- Solution: Make sure the server is running with `npm run dev`
- Check if database connection is established

## Server Information

- **Base URL**: http://localhost:3006/api
- **Server Port**: 3006
- **Database**: MySQL (jodimilan)

## Support

For issues or questions:
- Check the server logs for detailed error messages
- Review the route files in `src/routes/` for endpoint documentation
- Check controller files in `src/controllers/` for business logic

## Notes

- All authenticated routes require Bearer token in Authorization header
- File uploads use multipart/form-data
- Most other requests use application/json
- Date format: YYYY-MM-DD
- Phone numbers should include country code
- Some endpoints have rate limiting enabled

---

**Happy Testing!** 🚀
