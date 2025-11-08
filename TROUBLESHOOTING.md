# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. 🚨 CORS Error (Most Common)

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:3002' 
has been blocked by CORS policy
```

**Solution:**
This is a **backend issue**. Your backend needs to allow requests from the frontend.

**Quick Fix:**
1. Open your backend code (server.js or app.js)
2. Add CORS configuration (see BACKEND_CORS_SNIPPET.js)
3. Restart backend server
4. Refresh frontend

**Detailed Guide:** See [CORS_FIX.md](CORS_FIX.md)

---

### 2. ❌ Can't Login

**Symptoms:**
- Login button doesn't work
- No response after clicking login
- Error in console

**Solutions:**

#### Check Backend is Running
```bash
# Test if backend is accessible
curl http://localhost:3000/api/health

# Or open in browser
http://localhost:3000/api-docs
```

#### Check .env Configuration
```bash
# View .env file
cat .env

# Should contain:
REACT_APP_API_URL=http://localhost:3000/api
```

#### Check Credentials
Make sure you're using correct test credentials:
- Admin: `admin@communityplatform.com` / `Admin@123`
- Manager: `manager@communityplatform.com` / `Manager@123`
- User: `john.doe@example.com` / `User@123`

#### Clear Browser Cache
```javascript
// In browser console (F12)
localStorage.clear();
// Then refresh page
```

---

### 3. 🔄 Page Not Loading / Blank Screen

**Solutions:**

#### Check Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for error messages
4. Share errors if asking for help

#### Clear Cache and Reload
- Chrome/Edge: Ctrl+Shift+R
- Firefox: Ctrl+F5
- Or use Incognito/Private mode

#### Check React App is Running
```bash
# Should see:
# Compiled successfully!
# webpack compiled with 1 warning
# On Your Network: http://192.168.x.x:3002
```

---

### 4. 🐛 Build Errors

**Error:** `npm start` fails or shows errors

**Solutions:**

#### Clean Install
```bash
# Remove node_modules
rm -rf node_modules
# Or on Windows:
rmdir /s /q node_modules

# Remove package-lock.json
rm package-lock.json

# Reinstall
npm install
```

#### Check Node Version
```bash
node --version
# Should be v16 or higher

npm --version
# Should be v8 or higher
```

#### Clear npm Cache
```bash
npm cache clean --force
npm install
```

---

### 5. 🔐 Authentication Issues

**Symptoms:**
- Logged in but redirected to login
- Token expired immediately
- Can't access protected routes

**Solutions:**

#### Check Token Storage
```javascript
// In browser console (F12)
localStorage.getItem('token');
// Should show a JWT token
```

#### Clear and Re-login
```javascript
// In browser console
localStorage.clear();
// Then login again
```

#### Check Backend Token Expiration
Make sure backend JWT tokens have reasonable expiration (e.g., 24 hours)

---

### 6. 📱 Responsive Design Issues

**Symptoms:**
- Sidebar not showing on mobile
- Layout broken on small screens
- Content overlapping

**Solutions:**

#### Test in Browser DevTools
1. Press F12
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select different device sizes
4. Check if layout adapts

#### Clear CSS Cache
- Hard refresh: Ctrl+Shift+R
- Or clear browser cache

---

### 7. 🌐 API Endpoints Not Working

**Symptoms:**
- 404 errors for API calls
- Data not loading
- Features not working

**Solutions:**

#### Verify API URL
```javascript
// Check in browser console
console.log(process.env.REACT_APP_API_URL);
// Should show: http://localhost:3000/api
```

#### Check Backend Routes
Make sure backend has these routes:
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/profile
- GET /api/communities
- etc.

#### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try the action that's failing
4. Click on the failed request
5. Check Status, Response, Headers

---

### 8. 🎨 Styling Issues

**Symptoms:**
- No styles applied
- Layout looks broken
- Colors not showing

**Solutions:**

#### Check App.css is Imported
In `src/App.tsx`:
```typescript
import './App.css';
```

#### Clear Browser Cache
- Hard refresh: Ctrl+Shift+R
- Or use Incognito mode

#### Check for CSS Errors
Look in browser console for CSS-related errors

---

### 9. 🔄 Hot Reload Not Working

**Symptoms:**
- Changes not reflecting
- Need to restart server for changes

**Solutions:**

#### Restart Development Server
```bash
# Stop server (Ctrl+C)
# Start again
npm start
```

#### Check File Watchers
On Linux, you might need to increase file watchers:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### 10. 📦 Module Not Found Errors

**Error:** `Module not found: Can't resolve 'xyz'`

**Solutions:**

#### Install Missing Package
```bash
npm install xyz
```

#### Check Import Paths
Make sure import paths are correct:
```typescript
// Correct
import { useAuth } from '../../contexts/AuthContext';

// Wrong
import { useAuth } from '../contexts/AuthContext';
```

#### Restart Development Server
```bash
# Stop (Ctrl+C) and restart
npm start
```

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Backend is running on port 3000
- [ ] Frontend is running on port 3002 (or 3001)
- [ ] .env file exists with correct API_URL
- [ ] CORS is configured on backend
- [ ] Test credentials are correct
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] localStorage has token after login

---

## Getting Help

If you're still stuck:

1. **Check Browser Console** (F12 → Console tab)
2. **Check Network Tab** (F12 → Network tab)
3. **Check Backend Logs** (terminal where backend is running)
4. **Try Incognito Mode** (rules out cache issues)
5. **Check Documentation** (README.md, IMPLEMENTATION_GUIDE.md)

---

## Common Error Messages

### "Params are not set"
- **Fix:** Updated in latest code, refresh page

### "Failed to load resource: net::ERR_FAILED"
- **Fix:** Backend not running or CORS issue

### "401 Unauthorized"
- **Fix:** Token expired, login again

### "404 Not Found" for /api/auth/profile
- **This is OK!** The app will work without this endpoint
- User data is saved from login response
- Backend can optionally implement this endpoint later

### "404 Not Found" for other endpoints
- **Fix:** Check API endpoint exists on backend

### "Network Error"
- **Fix:** Backend not running or wrong API URL

---

## Still Need Help?

1. Read [CORS_FIX.md](CORS_FIX.md) for CORS issues
2. Read [START_HERE.md](START_HERE.md) for setup guide
3. Read [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for technical details
4. Check all documentation files in the project root

---

**Most issues are related to:**
1. 🚨 CORS configuration (backend)
2. ❌ Backend not running
3. 🔐 Wrong credentials
4. 🌐 Wrong API URL in .env

Fix these first! 🚀
