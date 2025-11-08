# 🔧 CORS Error Fix

## Problem
You're seeing this error:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:3002' 
has been blocked by CORS policy
```

This happens because your **backend** needs to allow requests from your **frontend** (running on port 3002).

## Solution: Update Backend CORS Configuration

### Option 1: Allow Specific Origin (Recommended)

In your backend code, update the CORS configuration:

**For Express.js:**
```javascript
// In your backend server.js or app.js
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Option 2: Allow All Origins (Development Only)

**For Express.js:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: '*',
  credentials: true
}));
```

⚠️ **Warning**: Only use `origin: '*'` in development. In production, specify exact origins.

### Option 3: Manual CORS Headers

If you're not using the `cors` package:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3002');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

## Quick Fix Steps

1. **Stop your backend server** (Ctrl+C)

2. **Update your backend CORS configuration** (see options above)

3. **Restart your backend server**
   ```bash
   npm start
   # or
   node server.js
   ```

4. **Refresh your frontend** (http://localhost:3002)

5. **Try logging in again**

## Verify Backend is Running

```bash
# Check if backend is accessible
curl http://localhost:3000/api/health

# Or open in browser
http://localhost:3000/api-docs
```

## Alternative: Change Frontend Port

If you can't modify the backend, change your frontend to run on port 3001:

1. **Stop the frontend** (Ctrl+C)

2. **Update .env**:
   ```
   PORT=3001
   REACT_APP_API_URL=http://localhost:3000/api
   ```

3. **Restart frontend**:
   ```bash
   npm start
   ```

## Common Backend CORS Configurations

### Express.js with cors package
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3000'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### NestJS
```typescript
// In main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
```

### Fastify
```javascript
const fastify = require('fastify')({
  logger: true
});

fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
});
```

## Testing CORS Configuration

After updating your backend, test with curl:

```bash
# Test preflight request
curl -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost:3002" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Should see:
# Access-Control-Allow-Origin: http://localhost:3002
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## Still Having Issues?

### Check Backend Logs
Look for CORS-related errors in your backend console.

### Check Browser Console
1. Open DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Click on the failed request
5. Check Response Headers

### Verify Backend Configuration
Make sure your backend:
- Is running on port 3000
- Has CORS middleware installed
- CORS middleware is applied BEFORE routes
- Allows the correct origin

### Check Firewall/Antivirus
Sometimes security software blocks local requests. Try temporarily disabling it.

## Production Configuration

For production, use environment variables:

**Backend:**
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
  credentials: true
};

app.use(cors(corsOptions));
```

**Frontend .env:**
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Summary

The CORS error is a **backend issue**, not a frontend issue. You need to:

1. ✅ Update backend CORS configuration
2. ✅ Allow requests from `http://localhost:3002`
3. ✅ Restart backend server
4. ✅ Refresh frontend and try again

---

**Need More Help?**
- Check your backend framework's CORS documentation
- Verify backend is running: `curl http://localhost:3000/api/health`
- Check backend console for errors
- Try the alternative: change frontend port to 3001
