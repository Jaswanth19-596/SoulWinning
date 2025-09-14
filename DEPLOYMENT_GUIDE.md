# Soul Winning App - Deployment Guide 🚀

This guide will walk you through deploying your Soul Winning contact management app with cloud MongoDB and hosting providers.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup (Cloud Database)](#mongodb-atlas-setup-cloud-database)
3. [Backend Deployment Options](#backend-deployment-options)
4. [Frontend Deployment Options](#frontend-deployment-options)
5. [Environment Configuration](#environment-configuration)
6. [DNS and Domain Setup](#dns-and-domain-setup)
7. [Security Considerations](#security-considerations)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- GitHub account (for code repository)
- Credit card for cloud services (most have free tiers)
- Domain name (optional, but recommended)

## MongoDB Atlas Setup (Cloud Database)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

### Step 2: Create a Cluster
1. Choose "Build a Database"
2. Select **M0 Sandbox** (Free tier - 512MB storage)
3. Choose your preferred cloud provider and region (AWS/Google Cloud/Azure)
4. Name your cluster (e.g., "soul-winning-cluster")
5. Click "Create Cluster"

### Step 3: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and strong password (save these!)
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, restrict to your deployment server IPs
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@soul-winning-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add your database name: `...mongodb.net/soul-winning?retryWrites=true&w=majority`

## Backend Deployment Options

### Option A: Railway (Recommended - Easy & Free Tier)

#### Why Railway?
- Free tier with 500 hours/month
- Automatic deployments from GitHub
- Built-in environment variables
- Easy scaling

#### Steps:
1. **Prepare your repository:**
   ```bash
   cd "/Users/jaswanth/Desktop/Soul Winning"
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Railway account:**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub

3. **Deploy backend:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your Soul Winning repository
   - Railway will detect it's a Node.js app
   - Click "Deploy"

4. **Configure environment variables:**
   - Go to your project → Variables tab
   - Add these variables:
     ```
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://your-username:your-password@soul-winning-cluster.xxxxx.mongodb.net/soul-winning?retryWrites=true&w=majority
     JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
     PORT=5000
     CLIENT_URL=https://your-frontend-domain.com
     ```

5. **Configure build settings:**
   - Go to Settings → Build
   - Set "Root Directory" to `server`
   - Set "Build Command" to `npm install`
   - Set "Start Command" to `npm start`

### Option B: Render (Alternative)

#### Steps:
1. **Create Render account:**
   - Go to [Render.com](https://render.com)
   - Sign in with GitHub

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `soul-winning-api`
     - Root Directory: `server`
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Add environment variables** (same as Railway above)

### Option C: Heroku

#### Steps:
1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew install heroku/brew/heroku

   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and create app:**
   ```bash
   cd "/Users/jaswanth/Desktop/Soul Winning/server"
   heroku login
   heroku create soul-winning-api
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="mongodb+srv://your-username:your-password@soul-winning-cluster.xxxxx.mongodb.net/soul-winning?retryWrites=true&w=majority"
   heroku config:set JWT_SECRET="your-super-secure-jwt-secret"
   heroku config:set CLIENT_URL="https://your-frontend-domain.com"
   ```

4. **Deploy:**
   ```bash
   git subtree push --prefix server heroku main
   ```

## Frontend Deployment Options

### Option A: Vercel (Recommended for React)

#### Why Vercel?
- Optimized for React apps
- Automatic deployments from GitHub
- Excellent performance with CDN
- Free tier with custom domains

#### Steps:
1. **Create Vercel account:**
   - Go to [Vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Deploy frontend:**
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Create React App
     - Root Directory: `client`
     - Build Command: `npm run build`
     - Output Directory: `build`

3. **Add environment variables:**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-domain.railway.app/api
     ```

4. **Deploy:**
   - Click "Deploy"
   - Your app will be available at `https://your-project.vercel.app`

### Option B: Netlify

#### Steps:
1. **Create Netlify account:**
   - Go to [Netlify.com](https://netlify.com)
   - Sign in with GitHub

2. **Deploy:**
   - Click "New site from Git"
   - Choose GitHub and your repository
   - Configure:
     - Base directory: `client`
     - Build command: `npm run build`
     - Publish directory: `client/build`

3. **Add environment variables:**
   - Go to Site Settings → Environment Variables
   - Add `REACT_APP_API_URL`

## Environment Configuration

### Backend Environment Variables (.env)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soul-winning?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

### Frontend Environment Variables (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Post-Deployment Setup

### 1. Update CORS Configuration
Update your backend's `server.js` CORS configuration:

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL, 'https://your-custom-domain.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
```

### 2. Database Initialization
Your app will automatically create the database collections when first used. You may want to create an admin user:

```javascript
// Add this to a temporary script or run in MongoDB Atlas console
db.users.insertOne({
  username: "admin",
  email: "admin@yourchurch.com",
  password: "$2b$10$hashed_password_here", // Use bcrypt to hash
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 3. SSL/HTTPS
Both Vercel and Railway provide HTTPS by default. If using custom domains, ensure SSL certificates are properly configured.

## DNS and Domain Setup

### Custom Domain (Optional)
1. **Buy a domain** from providers like:
   - Namecheap
   - GoDaddy
   - Google Domains

2. **Configure DNS:**
   - **Frontend (Vercel/Netlify):**
     - Add CNAME record: `www` → `your-project.vercel.app`
     - Add A record: `@` → Vercel's IP (they provide this)

   - **Backend (Railway/Render):**
     - Add CNAME record: `api` → `your-project.railway.app`

3. **Update environment variables** with your custom domains

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to Git
- Use strong, unique JWT secrets
- Rotate secrets periodically

### 2. Database Security
- Use strong MongoDB Atlas passwords
- Restrict IP access in production
- Enable MongoDB Atlas audit logs

### 3. CORS Configuration
- Restrict CORS to your specific domains
- Remove wildcard (`*`) origins in production

### 4. Rate Limiting
Consider adding rate limiting to your API:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

## Monitoring and Maintenance

### 1. Error Tracking
Consider adding error tracking services:
- Sentry
- LogRocket
- Bugsnag

### 2. Analytics
Add analytics to understand usage:
- Google Analytics
- Mixpanel
- Amplitude

### 3. Uptime Monitoring
Monitor your app's availability:
- UptimeRobot
- StatusCake
- Pingdom

### 4. Regular Backups
- MongoDB Atlas provides automatic backups
- Consider additional backup strategies for critical data

## Deployment Checklist

### Pre-deployment
- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas cluster is created and configured
- [ ] Environment variables are documented
- [ ] CORS settings are configured for production
- [ ] Build process works locally

### Backend Deployment
- [ ] Railway/Render project is created
- [ ] Environment variables are set
- [ ] Database connection is working
- [ ] API endpoints are accessible
- [ ] HTTPS is enabled

### Frontend Deployment
- [ ] Vercel/Netlify project is created
- [ ] Environment variables are set
- [ ] Build process completes successfully
- [ ] App loads without errors
- [ ] API calls work from production frontend

### Post-deployment
- [ ] Create admin user account
- [ ] Test all major features
- [ ] Set up domain names (if using custom domains)
- [ ] Configure monitoring and alerts
- [ ] Document production URLs and credentials

## Estimated Costs

### Free Tier (Recommended for starting)
- **MongoDB Atlas M0:** Free (512MB)
- **Railway:** Free (500 hours/month)
- **Vercel:** Free (100GB bandwidth)
- **Total:** $0/month

### Paid Tier (For scaling)
- **MongoDB Atlas M10:** ~$9/month (2GB)
- **Railway Pro:** $5/month (unlimited hours)
- **Vercel Pro:** $20/month (1TB bandwidth)
- **Custom Domain:** $10-15/year
- **Total:** ~$35/month + domain

## Support and Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check CLIENT_URL environment variable
   - Verify CORS configuration includes your frontend domain

2. **Database Connection Issues:**
   - Verify MongoDB Atlas IP whitelist
   - Check connection string format
   - Ensure database user has correct permissions

3. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Review build logs for specific errors

4. **Environment Variable Issues:**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Restart services after changing variables

### Getting Help
- Railway: [Documentation](https://docs.railway.app) & [Discord](https://discord.gg/railway)
- Vercel: [Documentation](https://vercel.com/docs) & [Community](https://github.com/vercel/vercel/discussions)
- MongoDB Atlas: [Documentation](https://docs.atlas.mongodb.com) & [Community Forum](https://www.mongodb.com/community/forums)

## Next Steps

1. Choose your preferred deployment platforms
2. Set up MongoDB Atlas
3. Deploy backend first and test API endpoints
4. Deploy frontend and connect to backend
5. Set up custom domains if desired
6. Implement monitoring and backups
7. Share with your team and start using! 🎉

---

**Need Help?** If you encounter issues during deployment, check the platform-specific documentation or reach out to their support teams. Each platform has excellent documentation and community support.