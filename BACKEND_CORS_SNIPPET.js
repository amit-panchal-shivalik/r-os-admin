// ============================================
// BACKEND CORS CONFIGURATION
// Add this to your backend server.js or app.js
// ============================================

// Option 1: Using cors package (Recommended)
// npm install cors

const cors = require('cors');

// Allow specific origins
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// OR Option 2: Manual CORS headers
// ============================================

app.use((req, res, next) => {
  // Allow requests from frontend
  res.header('Access-Control-Allow-Origin', 'http://localhost:3002');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ============================================
// IMPORTANT: Place CORS middleware BEFORE routes!
// ============================================

// Example:
// app.use(cors(...));  // ← CORS first
// app.use('/api/auth', authRoutes);  // ← Routes after
// app.use('/api/communities', communityRoutes);

// ============================================
// After adding this, restart your backend:
// Ctrl+C to stop, then npm start
// ============================================
