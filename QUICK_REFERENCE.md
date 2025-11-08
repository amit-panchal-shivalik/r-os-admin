# 🚀 Quick Reference Card

## 🎯 Start the App

```bash
npm start
```
Opens at: `http://localhost:3002`

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@communityplatform.com | Admin@123 |
| Manager | manager@communityplatform.com | Manager@123 |
| User | john.doe@example.com | User@123 |

## 🚨 CORS Error? (Most Common Issue)

**Quick Fix:**
1. Open backend `server.js` or `app.js`
2. Copy code from `BACKEND_CORS_SNIPPET.js`
3. Paste before your routes
4. Restart backend: `Ctrl+C` then `npm start`
5. Refresh frontend

**Details:** See [CORS_FIX.md](CORS_FIX.md)

## 📁 Key Files

| File | Purpose |
|------|---------|
| `START_HERE.md` | ⭐ Start here! Complete guide |
| `CORS_FIX.md` | Fix CORS errors |
| `TROUBLESHOOTING.md` | All common issues |
| `README.md` | Project overview |
| `QUICK_START.md` | 3-step setup |

## 🗺️ Main Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/dashboard` | User dashboard |
| `/communities` | Browse communities |
| `/communities/:id` | Community details |
| `/communities/:id/manage` | Manage community (Manager) |
| `/events` | All events |
| `/marketplace` | Marketplace |
| `/pulses` | Community pulses |
| `/admin/overview` | Admin panel |

## 🎨 Key Components

| Component | Location |
|-----------|----------|
| Sidebar | `src/components/layout/Sidebar.tsx` |
| Header | `src/components/layout/Header.tsx` |
| Layout | `src/components/layout/Layout.tsx` |
| AuthContext | `src/contexts/AuthContext.tsx` |

## 🔧 Common Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install dependencies
npm install

# Clean install
rm -rf node_modules && npm install
```

## 🐛 Quick Fixes

### 404 Error for /api/auth/profile?
- **This is OK!** App works without this endpoint
- User data is saved from login response
- See `BACKEND_API_NOTES.md` for details

### Can't Login?
```bash
# Check backend is running
curl http://localhost:3000/api/health
```

### Clear Cache
```javascript
// In browser console (F12)
localStorage.clear();
```

### Check API URL
```bash
# View .env
cat .env
# Should show: REACT_APP_API_URL=http://localhost:3000/api
```

### Restart Everything
```bash
# Stop frontend (Ctrl+C)
# Stop backend (Ctrl+C)
# Start backend: npm start
# Start frontend: npm start
```

## 📊 Project Stats

- **46 Source Files**
- **8 Documentation Files**
- **18 Components**
- **10 Pages**
- **8 API Clients**
- **100+ Features**

## 🎯 Feature Access by Role

### User
- ✅ Browse communities
- ✅ Join communities
- ✅ Create pulses
- ✅ Create listings
- ✅ Register for events

### Manager (+ User features)
- ✅ Approve join requests
- ✅ Moderate content
- ✅ Create events
- ✅ Block members
- ✅ 5-tab management

### Admin (+ Manager features)
- ✅ Create communities
- ✅ Admin panel
- ✅ Platform analytics

## 🔍 Debugging

### Browser Console (F12)
- Console tab: See errors
- Network tab: See API calls
- Application tab: See localStorage

### Check Token
```javascript
localStorage.getItem('token');
```

### Check User
```javascript
JSON.parse(localStorage.getItem('user'));
```

## 📞 Need Help?

1. **CORS Error?** → Read `CORS_FIX.md`
2. **Other Issues?** → Read `TROUBLESHOOTING.md`
3. **Setup Help?** → Read `START_HERE.md`
4. **Technical Details?** → Read `IMPLEMENTATION_GUIDE.md`

## ✅ Pre-Launch Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 3002
- [ ] CORS configured on backend
- [ ] .env file configured
- [ ] Can login successfully
- [ ] Can browse communities
- [ ] Can create content
- [ ] Responsive design works

## 🚀 You're Ready!

Everything is set up and documented. Just:
1. Fix CORS on backend (if needed)
2. Run `npm start`
3. Login and explore!

---

**Quick Links:**
- 📖 [START_HERE.md](START_HERE.md) - Complete guide
- 🔧 [CORS_FIX.md](CORS_FIX.md) - Fix CORS
- 🐛 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- 📚 [README.md](README.md) - Project overview
