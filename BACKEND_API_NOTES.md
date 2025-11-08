# Backend API Notes

## Expected API Response Formats

### Authentication

#### POST /api/auth/login
**Request:**
```json
{
  "email": "admin@communityplatform.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "_id": "user-id",
      "name": "Admin User",
      "email": "admin@communityplatform.com",
      "phone": "1234567890",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST /api/auth/register
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "Password@123"
}
```

**Response:** Same as login

#### GET /api/auth/profile (Optional)
**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "name": "Admin User",
      "email": "admin@communityplatform.com",
      "role": "admin"
    }
  }
}
```

**Note:** This endpoint is optional. The frontend will work without it by using the user data from the login response.

### Communities

#### GET /api/communities
**Response:**
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "_id": "community-id",
        "name": "Tech Community",
        "description": "A community for tech enthusiasts",
        "category": "Technology",
        "bannerUrl": "https://example.com/banner.jpg",
        "memberCount": 150,
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### GET /api/communities/:id
**Response:**
```json
{
  "success": true,
  "data": {
    "community": {
      "_id": "community-id",
      "name": "Tech Community",
      "description": "A community for tech enthusiasts",
      "category": "Technology",
      "memberCount": 150
    },
    "membershipStatus": "member" // or "not-member" or "requested"
  }
}
```

## Important Notes

### 1. Response Format
All API responses should follow this format:
```json
{
  "success": true,
  "data": {
    // Your data here
  }
}
```

Or for errors:
```json
{
  "success": false,
  "error": {
    "message": "Error message here",
    "code": "ERROR_CODE"
  }
}
```

### 2. Authentication
- Token should be sent in `Authorization: Bearer {token}` header
- Frontend automatically adds this header to all requests
- Token is stored in localStorage

### 3. CORS
Backend must allow requests from:
- `http://localhost:3001`
- `http://localhost:3002`

See `BACKEND_CORS_SNIPPET.js` for implementation.

### 4. Optional Endpoints
These endpoints are optional and the frontend will work without them:
- `GET /api/auth/profile` - User data is cached from login

### 5. Error Handling
The frontend expects errors in this format:
```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message"
  }
}
```

## Testing Without Full Backend

If your backend is not fully implemented yet, you can:

1. **Implement Login First**
   - Just implement `/api/auth/login`
   - Return the expected format
   - Frontend will work with just this

2. **Mock Other Endpoints**
   - Return empty arrays for lists
   - Return 404 for optional endpoints
   - Frontend handles these gracefully

3. **Add Endpoints Gradually**
   - Start with authentication
   - Add communities
   - Add other features as needed

## Quick Backend Test

Test if your backend is working:

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@communityplatform.com","password":"Admin@123"}'

# Should return token and user data
```

## Common Backend Issues

### 1. CORS Not Configured
**Error:** "blocked by CORS policy"
**Fix:** See `BACKEND_CORS_SNIPPET.js`

### 2. Wrong Response Format
**Error:** Frontend shows "undefined" or errors
**Fix:** Ensure response matches expected format above

### 3. Token Not Accepted
**Error:** 401 Unauthorized
**Fix:** Check token validation in backend

### 4. Wrong Status Codes
**Error:** Frontend doesn't handle response correctly
**Fix:** Use proper HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Backend Checklist

- [ ] CORS configured for localhost:3001 and localhost:3002
- [ ] POST /api/auth/login implemented
- [ ] Response format matches expected structure
- [ ] Token authentication working
- [ ] GET /api/communities implemented
- [ ] Error responses in correct format

---

**The frontend is flexible and will work even if some endpoints are not implemented yet!**
