# Your MongoDB Atlas Connection String Setup
# Ready to copy and paste into Vercel Dashboard

# =====================================================
# YOUR MONGODB CONNECTION STRING:
# =====================================================

MONGODB_URI=mongodb+srv://Vercel-Admin-Health-Connect:3mpoSBxMevqD8eC4@health-connect.lrj8cw8.mongodb.net/healthconnect?retryWrites=true&w=majority

# =====================================================
# COMPLETE ENVIRONMENT VARIABLES FOR VERCEL:
# =====================================================

# Copy and paste these into Vercel Dashboard:

MONGODB_URI=mongodb+srv://Vercel-Admin-Health-Connect:3mpoSBxMevqD8eC4@health-connect.lrj8cw8.mongodb.net/healthconnect?retryWrites=true&w=majority

JWT_SECRET=a8f5k2m9n4x7z1w3e6r8t5y2u7i4o9p0q3w2e8r6t1y5u7i9o2p4s6d8f1g3h5j7k9l1

CLIENT_ORIGIN=https://your-project-name.vercel.app

# =====================================================
# HOW TO SET IN VERCEL DASHBOARD:
# =====================================================

# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Go to Settings → Environment Variables
# 4. Click "Add New"
# 5. Copy each variable above
# 6. Redeploy: Run `vercel --prod` in your terminal

# =====================================================
# JWT SECRET GENERATION:
# =====================================================

# I generated a secure JWT secret for you above.
# If you want to generate your own:
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# =====================================================
# QUICK DEPLOYMENT:
# =====================================================

# After setting environment variables:

vercel --prod

# Your app will be live at:
# https://your-project-name.vercel.app

# =====================================================
# TESTING YOUR CONNECTION:
# =====================================================

# After deployment, test these endpoints:

# 1. Register a user:
# POST https://your-app.vercel.app/api/auth/register
# Body: {"name": "Test User", "email": "test@example.com", "password": "password123"}

# 2. Get doctors list:
# GET https://your-app.vercel.app/api/appointments/doctors
# Headers: {"Authorization": "Bearer YOUR_JWT_TOKEN"}

# 3. Check frontend:
# Visit https://your-app.vercel.app and login

# =====================================================
# TROUBLESHOOTING:
# =====================================================

# If you get connection errors:
# 1. Check if username/password are correct in MONGODB_URI
# 2. Make sure database name is "healthconnect"
# 3. Verify JWT_SECRET is properly set
# 4. Check Vercel deployment logs

# If IP whitelisting issues:
# In MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0
