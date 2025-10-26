# Health Connect - Full-Stack Vercel Deployment Guide

## 🚀 Deploying to Vercel (Monorepo Setup)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- MongoDB Atlas database

### Architecture
This setup deploys both frontend and backend to Vercel:
- **Frontend**: Static React app served from `/`
- **Backend**: Serverless functions in `/api/` directory
- **Database**: MongoDB Atlas

### Step 1: Prepare Your Project
```bash
# From project root
npm install

# Setup production environment
npm run setup:prod

# Build for production
npm run build
```

### Step 2: Deploy to Vercel
1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Setup full-stack Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Connect your GitHub repository
   - Vercel will auto-detect the configuration
   - Set build command: `npm run vercel:build`
   - Set output directory: `dist`

### Step 3: Configure Environment Variables
In Vercel dashboard (Project Settings → Environment Variables):

1. **`MONGODB_URI`**
   ```
   mongodb+srv://Vercel-Admin-Health-Connect:3mpoSBxMevqD8eC4@health-connect.lrj8cw8.mongodb.net/healthconnect?retryWrites=true&w=majority
   ```

2. **`JWT_SECRET`**
   ```
   df2545394d42b3926c00a6f9cf101b16676496f76ac10951bb15f89f517ae141058f3e237c8a2ee84b7bf847b001b52f6c6ec4d67276cab663ce6865c46d3d85
   ```

3. **`CLIENT_ORIGIN`** (Auto-filled by Vercel)
   - Will be set to your deployment URL (e.g., `https://your-project.vercel.app`)

4. **`VITE_API_URL`** (For client-side)
   ```
   https://your-project.vercel.app/api
   ```

### Step 4: Deploy
```bash
# Using the deployment script
bash deploy.vercel.sh

# Or manually
vercel login
vercel --prod
```

### Troubleshooting

1. **404 Errors**: Check that `vercel.json` routes are correct
2. **API Issues**: Ensure API files are in root `api/` directory
3. **Build Failures**: Verify all dependencies are installed
4. **Environment Variables**: Make sure all required variables are set in Vercel dashboard

### Example Configuration

#### Vercel Environment Variables:
```
MONGODB_URI=mongodb+srv://Vercel-Admin-Health-Connect:3mpoSBxMevqD8eC4@health-connect.lrj8cw8.mongodb.net/healthconnect?retryWrites=true&w=majority
JWT_SECRET=df2545394d42b3926c00a6f9cf101b16676496f76ac10951bb15f89f517ae141058f3e237c8a2ee84b7bf847b001b52f6c6ec4d67276cab663ce6865c46d3d85
CLIENT_ORIGIN=https://your-project.vercel.app
VITE_API_URL=https://your-project.vercel.app/api
```

### Support

For more details, check:
- README.md (deployment section)
- vercel.json (configuration)
- .env.vercel (environment variables template)

Your modern Health Connect application is ready for deployment! 🎉
