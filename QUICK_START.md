# Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Make sure your `.env` file has:
```
REACT_APP_API_URL=http://localhost:3000/api
```

### Step 3: Start the App
```bash
npm start
```

The app will open at `http://localhost:3001`

## 🔑 Test Credentials

Use these credentials to test different roles:

**Admin Account:**
- Email: `admin@communityplatform.com`
- Password: `Admin@123`

**Manager Account:**
- Email: `manager@communityplatform.com`
- Password: `Manager@123`

**User Account:**
- Email: `john.doe@example.com`
- Password: `User@123`

## 📋 What You Can Do

### As a User:
- ✅ Browse communities
- ✅ Join communities
- ✅ Create pulses
- ✅ Create marketplace listings
- ✅ Register for events
- ✅ View member directory

### As a Manager:
- ✅ All user features
- ✅ Approve/reject join requests
- ✅ Approve/reject pulses
- ✅ Approve/reject marketplace listings
- ✅ Create events
- ✅ Block/unblock members
- ✅ Manage community (5 tabs)

### As an Admin:
- ✅ All manager features
- ✅ Create new communities
- ✅ View analytics
- ✅ Manage territories

## 🗺️ Navigation Guide

### Main Menu (Sidebar)
1. **Dashboard** - Overview and quick links
2. **Communities** - Browse and join communities
3. **Events** - View and register for events
4. **Marketplace** - Buy and sell items
5. **Pulses** - Community updates
6. **Directory** - Member directory
7. **Manage Communities** (Manager/Admin only)
8. **Approval Queue** (Manager/Admin only)
9. **Analytics** (Admin only)

### Community Detail Page (User View)
- View community information
- Join community button
- 4 tabs: Pulses, Marketplace, Directory, Events

### Community Management Page (Manager View)
- 5 tabs for complete community management:
  1. **Join Requests** - Approve/reject members
  2. **Pulses** - Moderate community posts
  3. **Marketplace** - Moderate listings
  4. **Directory** - Manage members
  5. **Events** - Manage events

## 🎯 Key Workflows

### Joining a Community
1. Go to Communities page
2. Click on a community
3. Click "Join Community"
4. Wait for manager approval
5. Access community features once approved

### Creating a Pulse
1. Go to a community you're a member of
2. Click "Pulses" tab
3. Click "Create Pulse"
4. Fill in content and media URLs
5. Submit (requires manager approval)

### Creating a Marketplace Listing
1. Go to a community you're a member of
2. Click "Marketplace" tab
3. Click "Create Listing"
4. Fill in details, price, images
5. Submit (requires manager approval)

### Registering for an Event
1. Go to Events page or community events tab
2. Click on an event
3. Click "Register"
4. Confirmation message appears

### Managing Join Requests (Manager)
1. Go to "Manage Communities"
2. Select your community
3. Go to "Join Requests" tab
4. Approve or reject requests

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Role-Based Navigation**: Menu items change based on your role
- **Status Badges**: Visual indicators for pending/approved/rejected items
- **Search Functionality**: Search members in directory
- **Tab Navigation**: Easy switching between different sections
- **Modal Forms**: Clean popup forms for creating content

## 🔧 Troubleshooting

### Can't Login?
- Make sure backend is running on port 3000
- Check credentials are correct
- Clear browser cache and localStorage

### Not Seeing Communities?
- Make sure you're logged in
- Check if backend has seed data
- Refresh the page

### Features Not Working?
- Check browser console for errors
- Verify API URL in .env
- Make sure you have the right role/permissions

## 📱 Mobile Usage

On mobile devices:
- Sidebar shows icons only
- Tap hamburger menu to expand
- Swipe to navigate tabs
- Forms are touch-optimized

## 🎓 Learning the Codebase

### Key Files to Understand:
1. `src/App.tsx` - Routing and app structure
2. `src/contexts/AuthContext.tsx` - Authentication logic
3. `src/components/layout/` - Layout components
4. `src/api/` - API integration
5. `src/types/index.ts` - TypeScript types

### Adding a New Feature:
1. Create component in appropriate folder
2. Add API methods if needed
3. Add route in App.tsx
4. Update types if needed
5. Style in App.css

## 🚀 Production Build

To create a production build:
```bash
npm run build
```

The build folder will contain optimized files ready for deployment.

## 📞 Need Help?

- Check `IMPLEMENTATION_GUIDE.md` for detailed documentation
- Review component code for examples
- Test with different user roles
- Check API documentation at `http://localhost:3000/api-docs`

---

**Happy Coding! 🎉**
