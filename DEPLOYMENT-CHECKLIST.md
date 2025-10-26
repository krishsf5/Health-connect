# Health Connect - Vercel Deployment Checklist
# Follow this checklist to ensure your app works properly

## ✅ PREREQUISITES CHECKLIST

### 1. MongoDB Atlas Setup
- [ ] Created MongoDB Atlas account (https://cloud.mongodb.com)
- [ ] Created a cluster (free tier is fine)
- [ ] Got connection string from Connect → Connect your application
- [ ] Updated connection string with your username and password
- [ ] Database name set to: healthconnect

### 2. JWT Secret Generation
- [ ] Generated strong JWT secret using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Saved the secret for Vercel setup

### 3. Vercel Account Setup
- [ ] Created Vercel account (https://vercel.com)
- [ ] Connected GitHub repository to Vercel
- [ ] Ready to deploy

## 🚀 DEPLOYMENT CHECKLIST

### 1. Environment Variables in Vercel
- [ ] Set MONGODB_URI with your MongoDB Atlas connection string
- [ ] Set JWT_SECRET with your generated secret
- [ ] CLIENT_ORIGIN will be auto-filled by Vercel

### 2. Deployment Commands
- [ ] Installed Vercel CLI: `npm i -g vercel`
- [ ] Logged in: `vercel login`
- [ ] Deployed: `vercel --prod`

### 3. Post-Deployment Verification
- [ ] Check if frontend loads: https://your-app.vercel.app
- [ ] Test registration: Create patient and doctor accounts
- [ ] Test appointment booking: Patient books appointment
- [ ] Test real-time updates: Doctor accepts/rejects appointment
- [ ] Test chat functionality between doctor and patient

## 🔧 TROUBLESHOOTING CHECKLIST

### Common Issues:
- [ ] MongoDB connection error → Check MONGODB_URI format
- [ ] Authentication error → Check JWT_SECRET matches
- [ ] CORS error → CLIENT_ORIGIN should match Vercel URL
- [ ] API not found → Check Vercel routing configuration
- [ ] Build failure → Ensure all dependencies are installed

### Testing Commands:
```bash
# Test API endpoints
curl https://your-app.vercel.app/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Check MongoDB connection
curl https://your-app.vercel.app/api/appointments/doctors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📋 FINAL VERIFICATION

### Features to Test:
- [ ] User registration (patient/doctor roles)
- [ ] Login functionality
- [ ] Doctor listing
- [ ] Appointment booking
- [ ] Appointment status updates
- [ ] Real-time notifications (polling)
- [ ] Chat between doctor and patient
- [ ] Notes functionality
- [ ] File upload with OCR
- [ ] Heart rate charts
- [ ] Multi-language support
- [ ] Responsive design

## 🎉 SUCCESS CRITERIA

Your app is working if:
- ✅ Frontend loads without errors
- ✅ Users can register and login
- ✅ Appointments can be booked and managed
- ✅ Real-time updates work (appointment status changes)
- ✅ All UI components are functional
- ✅ No console errors in browser
- ✅ MongoDB data persists correctly

## 📞 NEED HELP?

If something doesn't work:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Check browser console for errors
5. Review the documentation in README.md

## 🚀 YOUR APP IS READY!

Once all checkboxes are ticked, your modern healthcare platform is live and ready for users! 🎉

Access your app at: https://your-project-name.vercel.app
