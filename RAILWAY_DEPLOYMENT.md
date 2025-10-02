# Railway Deployment Guide

This guide will help you deploy the Room Booking System API to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install the Railway CLI
   ```bash
   npm install -g @railway/cli
   ```

## Deployment Steps

### 1. Prepare Your Repository

The repository is already configured with the necessary files for Railway deployment:
- `Procfile` - Tells Railway how to start your application
- `railway.json` - Railway-specific configuration
- `package.json` - Updated with engines and deployment scripts
- `.env.example` - Template for environment variables

### 2. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Choose "Deploy from GitHub repo" and select this repository
3. Railway will automatically detect it's a Node.js application

### 3. Add MySQL Database

1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "MySQL"
3. Railway will create a MySQL instance and provide connection details

### 4. Configure Environment Variables

In your Railway project dashboard, go to "Variables" and set:

```env
# Database (automatically provided by Railway MySQL service)
MYSQL_URL=${{ MySQL.MYSQL_URL }}

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_here

# Server Configuration
PORT=${{ PORT }}
NODE_ENV=production

# CORS Configuration (update with your actual frontend URLs)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-app.railway.app
```

### 5. Deploy

Railway will automatically deploy when you push to your main branch. You can also deploy manually:

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Deploy
railway up
```

### 6. Run Database Migrations

After deployment, you need to run the database migrations:

1. Go to your Railway project dashboard
2. Open the service terminal or use Railway CLI:
   ```bash
   railway run npm run migrate
   railway run npm run seed
   ```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MYSQL_URL` | Database connection string | `mysql://user:pass@host:port/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secure_secret` |
| `PORT` | Server port (auto-set by Railway) | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourapp.com` |

## Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] Database seeds run (optional, for initial data)
- [ ] Environment variables configured
- [ ] CORS origins updated with actual frontend URLs
- [ ] API endpoints accessible
- [ ] Database connections working

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure MYSQL_URL is correctly set
   - Check if MySQL service is running

2. **CORS Errors**
   - Update ALLOWED_ORIGINS with your frontend URL
   - Ensure the frontend URL is correct (https vs http)

3. **Migration Errors**
   - Run migrations manually: `railway run npm run migrate`
   - Check database permissions

### Useful Commands

```bash
# View logs
railway logs

# Run commands in Railway environment
railway run <command>

# Open Railway dashboard
railway open

# Check service status
railway status
```

## API Endpoints

Once deployed, your API will be available at:
- Base URL: `https://your-app-name.railway.app`
- API Documentation: `https://your-app-name.railway.app/api`
- Admin Routes: `https://your-app-name.railway.app/api/admin/*`
- Visitor Routes: `https://your-app-name.railway.app/api/visitor/*`

## Support

For Railway-specific issues, check:
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway GitHub](https://github.com/railwayapp/railway)