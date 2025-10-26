# Convert JDBC URL to MongoDB Connection String

# Your JDBC URL:
# jdbc:mongodb://atlas-sql-68b85ad15dbd4d3eebab4111-y57axj.z.query.mongodb.net/test?ssl=true&authSource=admin

# =====================================================
# CONVERTED TO MONGOOSE FORMAT:
# =====================================================

# MongoDB Connection String for your Node.js app:
MONGODB_URI=mongodb+srv://username:password@atlas-sql-68b85ad15dbd4d3eebab4111-y57axj.z.query.mongodb.net/healthconnect?retryWrites=true&w=majority

# =====================================================
# WHAT YOU NEED TO DO:
# =====================================================

# 1. Replace 'username' with your MongoDB Atlas username
# 2. Replace 'password' with your MongoDB Atlas password
# 3. Make sure database name is 'healthconnect' (or change to your preferred name)

# Example with actual credentials:
# MONGODB_URI=mongodb+srv://myuser:mypassword@atlas-sql-68b85ad15dbd4d3eebab4111-y57axj.z.query.mongodb.net/healthconnect?retryWrites=true&w=majority

# =====================================================
# FOR VERCEL DASHBOARD:
# =====================================================

# Set these in Vercel Project Settings → Environment Variables:

MONGODB_URI=mongodb+srv://username:password@atlas-sql-68b85ad15dbd4d3eebab4111-y57axj.z.query.mongodb.net/healthconnect?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-12345-abcdef

CLIENT_ORIGIN=https://your-project-name.vercel.app

# =====================================================
# VERIFICATION:
# =====================================================

# After setting in Vercel:
# 1. Deploy: vercel --prod
# 2. Test API: Visit https://your-app.vercel.app/api/auth/register
# 3. Check browser console for any connection errors

# =====================================================
# TROUBLESHOOTING:
# =====================================================

# Common issues:
# - "Authentication failed" → Check username/password
# - "Connection timeout" → Check if IP whitelisted in Atlas
# - "Database not found" → Make sure database name matches

# Need to whitelist IP? In MongoDB Atlas:
# Network Access → Add IP Address → 0.0.0.0/0 (all IPs)
