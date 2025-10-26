#!/bin/bash

# Final Health Connect Vercel Deployment Setup
# This script helps you deploy both frontend and backend to Vercel

echo "🚀 Health Connect - Full-Stack Vercel Deployment"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "api" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo "🔐 Setting up environment variables..."
echo ""

# Check if .env.vercel exists
if [ -f ".env.vercel" ]; then
    echo "📄 Found .env.vercel template"
    echo "Please update .env.vercel with your actual values:"
    echo "1. MONGODB_URI - Your MongoDB Atlas connection string"
    echo "2. JWT_SECRET - Generate a strong secret"
    echo "3. CLIENT_ORIGIN - Will be auto-filled by Vercel"
    echo ""
else
    echo "⚠️  .env.vercel template not found"
    echo "Please set these environment variables in Vercel dashboard:"
    echo "- MONGODB_URI"
    echo "- JWT_SECRET"
    echo "- CLIENT_ORIGIN"
fi

echo "🔧 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo ""
echo "🌐 Ready to deploy to Vercel!"
echo ""
echo "📋 Deployment steps:"
echo "1. Login to Vercel: vercel login"
echo "2. Deploy: vercel --prod"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Your app will be available at: https://your-project.vercel.app"
echo ""
echo "📚 For detailed instructions, check:"
echo "- README.md (deployment section)"
echo "- VERCEL-DEPLOYMENT.md"
echo ""
echo "🎉 Your modern healthcare application is ready for deployment!"
echo "Features: Modern UI, Real-time updates, Multi-language support, Drag-and-drop uploads"
echo ""

read -p "Do you want to deploy now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
    echo ""
    echo "🚀 Starting Vercel deployment..."
    vercel --prod
else
    echo ""
    echo "📝 To deploy later, run: vercel --prod"
    echo "💡 For development: vercel dev"
fi
