# Health Connect - Vercel Environment Variables Setup
# Copy and paste these into your Vercel project dashboard

# =====================================================
# REQUIRED ENVIRONMENT VARIABLES FOR VERCEL
# =====================================================

# MongoDB Atlas Connection String (REQUIRED)
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/healthconnect?retryWrites=true&w=majority

# Strong JWT Secret for Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-12345

# Client Origin for CORS (Auto-filled by Vercel)
CLIENT_ORIGIN=https://your-project-name.vercel.app

# =====================================================
# SETUP INSTRUCTIONS:
# =====================================================

# 1. MongoDB Atlas Setup:
#    - Go to https://cloud.mongodb.com
#    - Create account and cluster (free tier)
#    - Go to Connect → Connect your application
#    - Copy the connection string
#    - Replace <username>, <password>, <cluster> in MONGODB_URI

# 2. Generate JWT Secret:
#    Run this command: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
#    Copy the output to JWT_SECRET

# 3. In Vercel Dashboard:
#    - Go to Project Settings → Environment Variables
#    - Add each variable above
#    - CLIENT_ORIGIN will be auto-filled with your Vercel URL

# =====================================================
# OPTIONAL VARIABLES (if needed):
# =====================================================

# Node.js Runtime Version (default: 18.x)
# VERCEL_NODE_OPTIONS="--max-old-space-size=4096"

# Database Connection Timeout (default: 5 seconds)
# MONGODB_TIMEOUT=5000

# =====================================================
# TESTING YOUR SETUP:
# =====================================================

# After setting variables:
# 1. Deploy: vercel --prod
# 2. Test API: https://your-app.vercel.app/api/auth/login
# 3. Test Frontend: https://your-app.vercel.app
# 4. Register a patient and doctor account
# 5. Test appointment booking and real-time updates

# =====================================================
# TROUBLESHOOTING:
# =====================================================

# Common Issues:
# 1. "MongoDB connection error" → Check MONGODB_URI format
# 2. "Invalid token" → Check JWT_SECRET matches
# 3. CORS errors → CLIENT_ORIGIN should match your Vercel URL
# 4. Build failures → Check all dependencies are installed

# Need help? Check:
# - README.md deployment section
# - VERCEL-DEPLOYMENT.md
# - DEPLOYMENT-READY.md
