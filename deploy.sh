#!/bin/bash

# Railway Deployment Script for Room Booking System

echo "🚀 Starting Railway deployment process..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Link to Railway project (if not already linked)
echo "🔗 Linking to Railway project..."
railway link

# Set environment variables
echo "⚙️  Setting up environment variables..."
echo "Please make sure to set the following environment variables in Railway dashboard:"
echo "- MYSQL_URL (from your Railway MySQL service)"
echo "- JWT_SECRET (a secure random string)"
echo "- NODE_ENV=production"
echo "- ALLOWED_ORIGINS (comma-separated list of allowed frontend URLs)"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set up your MySQL database service in Railway"
echo "   2. Configure environment variables in Railway dashboard"
echo "   3. Update ALLOWED_ORIGINS with your actual frontend URL"