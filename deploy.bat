@echo off
REM Health Connect Deployment Helper for Windows
REM This script helps you deploy the application to various platforms

echo 🚀 Health Connect Deployment Helper (Windows)
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "client" (
    echo ❌ Error: Client directory not found
    pause
    exit /b 1
)

if not exist "server" (
    echo ❌ Error: Server directory not found
    pause
    exit /b 1
)

echo 📋 Choose deployment option:
echo 1) Deploy Client to Vercel
echo 2) Setup Railway deployment
echo 3) Setup Render deployment
echo 4) Setup Heroku deployment
echo 5) Local development setup
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo 🌐 Deploying Client to Vercel...
    echo.
    echo 📝 Steps to deploy:
    echo 1. Install Vercel CLI: npm i -g vercel
    echo 2. Login to Vercel: vercel login
    echo 3. Set environment variables in Vercel dashboard:
    echo    - VITE_API_URL = https://your-server-domain.com
    echo 4. Deploy: vercel --prod
    echo.
    echo 📄 Don't forget to update client/.env.example with your production API URL
) else if "%choice%"=="2" (
    echo 🚂 Setting up Railway deployment...
    echo.
    echo 📝 Steps:
    echo 1. Go to https://railway.app and create account
    echo 2. Connect your GitHub repository
    echo 3. Create new project from GitHub repo
    echo 4. Add environment variables in Railway dashboard:
    echo    - MONGO_URI = your MongoDB Atlas connection string
    echo    - JWT_SECRET = generate a strong secret
    echo    - CLIENT_ORIGIN = https://your-client.vercel.app
    echo 5. Deploy automatically
    echo.
    echo 📄 Update server/.env.example with your production values
) else if "%choice%"=="3" (
    echo 🎨 Setting up Render deployment...
    echo.
    echo 📝 Steps:
    echo 1. Go to https://render.com and create account
    echo 2. Connect your GitHub repository
    echo 3. Create new Web Service
    echo 4. Set build command: npm install ^&^& cd server ^&^& npm install
    echo 5. Set start command: cd server ^&^& npm start
    echo 6. Add environment variables same as Railway
    echo.
    echo 📄 Update server/.env.example with your production values
) else if "%choice%"=="4" (
    echo 🐳 Setting up Heroku deployment...
    echo.
    echo 📝 Steps:
    echo 1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
    echo 2. Login: heroku login
    echo 3. Create app: heroku create your-app-name
    echo 4. Set environment variables:
    echo    heroku config:set MONGO_URI=your_mongodb_atlas_uri
    echo    heroku config:set JWT_SECRET=your_strong_secret
    echo    heroku config:set CLIENT_ORIGIN=https://your-client.vercel.app
    echo 5. Deploy: git push heroku main
    echo.
    echo 📄 Update server/.env.example with your production values
) else if "%choice%"=="5" (
    echo 💻 Local development setup...
    echo.
    echo 📝 Steps:
    echo 1. Copy environment files:
    echo    copy server\.env.example server\.env
    echo    copy client\.env.example client\.env
    echo.
    echo 2. Update server\.env with your local MongoDB URI:
    echo    MONGO_URI=mongodb://localhost:27017/webathon
    echo    CLIENT_ORIGIN=http://localhost:5173
    echo.
    echo 3. Start MongoDB locally or use MongoDB Atlas
    echo.
    echo 4. Install and start:
    echo    npm install
    echo    npm run dev
    echo.
    echo 🌐 Client: http://localhost:5173
    echo 🚀 Server: http://localhost:5000
) else (
    echo ❌ Invalid choice. Please run the script again and choose 1-5.
)

echo.
echo 📚 For more details, check the README.md file
echo 🔗 Need help? Check the deployment section in README.md
echo.
pause
