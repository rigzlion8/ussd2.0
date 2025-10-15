# Deployment Guide

This guide provides detailed instructions for deploying the Mobile VAS Platform to various hosting providers.

## Prerequisites

Before deploying, ensure you have:

- Africa's Talking account with API credentials
- MongoDB database (local, Atlas, or other cloud provider)
- Domain name with SSL certificate
- Africa's Talking shortcode and USSD code registered

## Environment Variables

Create a production `.env` file with these variables:

```env
# Production Environment
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com

# Africa's Talking Configuration
AFRICASTALKING_API_KEY=your_production_api_key
AFRICASTALKING_USERNAME=your_production_username
AFRICASTALKING_SENDER_ID=VASPlatform
AFRICASTALKING_SHORT_CODE=22345

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mobile-vas-platform

# Subscription Configuration
DAILY_SUBSCRIPTION_COST=5
WEEKLY_SUBSCRIPTION_COST=30
SUBSCRIPTION_CURRENCY=KES

# Timezone Configuration
TIMEZONE=Africa/Nairobi

# Security
WEBHOOK_SECRET=your_secure_random_string_here
NEXTAUTH_SECRET=your_nextauth_secret_here

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_admin_password_here
```

## Deployment Options

### 1. Railway (Recommended)

Railway is the easiest option with built-in MongoDB and automatic deployments.

#### Setup Steps:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Add MongoDB Service**
   ```bash
   railway add mongodb
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set AFRICASTALKING_API_KEY=your_key
   railway variables set AFRICASTALKING_USERNAME=your_username
   railway variables set AFRICASTALKING_SENDER_ID=VASPlatform
   railway variables set AFRICASTALKING_SHORT_CODE=22345
   railway variables set DAILY_SUBSCRIPTION_COST=5
   railway variables set WEEKLY_SUBSCRIPTION_COST=30
   railway variables set SUBSCRIPTION_CURRENCY=KES
   railway variables set TIMEZONE=Africa/Nairobi
   railway variables set WEBHOOK_SECRET=your_webhook_secret
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get Domain**
   ```bash
   railway domain
   ```

7. **Seed Database**
   ```bash
   railway run npm run seed
   ```

#### Railway Configuration:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x
- **Health Check**: `/api/admin/stats`

### 2. Vercel

Vercel provides excellent Next.js support but requires external MongoDB.

#### Setup Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables

4. **Configure MongoDB Atlas**
   - Create cluster at [MongoDB Atlas](https://cloud.mongodb.com)
   - Whitelist Vercel IP addresses
   - Get connection string

5. **Seed Database**
   ```bash
   vercel env pull .env.local
   npm run seed
   ```

#### Vercel Configuration:

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**Note**: Cron jobs require Vercel Pro plan or external cron service.

### 3. Heroku

Heroku provides easy deployment with add-on ecosystem.

#### Setup Steps:

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Ubuntu
   snap install --classic heroku
   ```

2. **Create App**
   ```bash
   heroku create mobile-vas-platform
   ```

3. **Add MongoDB Add-on**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set AFRICASTALKING_API_KEY=your_key
   heroku config:set AFRICASTALKING_USERNAME=your_username
   heroku config:set AFRICASTALKING_SENDER_ID=VASPlatform
   heroku config:set AFRICASTALKING_SHORT_CODE=22345
   heroku config:set DAILY_SUBSCRIPTION_COST=5
   heroku config:set WEEKLY_SUBSCRIPTION_COST=30
   heroku config:set SUBSCRIPTION_CURRENCY=KES
   heroku config:set TIMEZONE=Africa/Nairobi
   heroku config:set WEBHOOK_SECRET=your_webhook_secret
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Seed Database**
   ```bash
   heroku run npm run seed
   ```

#### Heroku Configuration:

- **Buildpack**: `heroku/nodejs`
- **Dyno Type**: Standard-1X (minimum for cron jobs)
- **Add-ons**: Mongolab, Scheduler (for cron jobs)

### 4. DigitalOcean App Platform

DigitalOcean provides managed hosting with built-in databases.

#### Setup Steps:

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure App**
   ```yaml
   name: mobile-vas-platform
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/mobile-vas-platform
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: AFRICASTALKING_API_KEY
       value: your_key
       type: SECRET
   ```

3. **Add Database**
   - Add MongoDB database service
   - Configure connection string

4. **Deploy**
   - DigitalOcean automatically deploys from GitHub
   - Monitor deployment in dashboard

### 5. AWS EC2/VPS

For full control and custom configurations.

#### Server Setup:

1. **Launch EC2 Instance**
   ```bash
   # Ubuntu 22.04 LTS
   # t3.medium or larger
   # Security group: HTTP (80), HTTPS (443), SSH (22)
   ```

2. **Connect and Update**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   sudo apt update && sudo apt upgrade -y
   ```

3. **Install Dependencies**
   ```bash
   # Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # PM2
   npm install -g pm2
   
   # Nginx
   sudo apt install nginx
   ```

4. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/mobile-vas-platform.git
   cd mobile-vas-platform
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Create PM2 ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'mobile-vas-platform',
       script: 'npm',
       args: 'start',
       cwd: '/home/ubuntu/mobile-vas-platform',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   EOF
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/mobile-vas-platform
   ```
   
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/mobile-vas-platform /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL Certificate**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

7. **Seed Database**
   ```bash
   cd /home/ubuntu/mobile-vas-platform
   npm run seed
   ```

## Post-Deployment Configuration

### 1. Africa's Talking Webhook Setup

Update your Africa's Talking dashboard with these webhook URLs:

```
SMS Receive: https://yourdomain.com/api/sms/receive
USSD: https://yourdomain.com/api/ussd
Delivery Reports: https://yourdomain.com/api/webhooks/delivery-report
Payment Callbacks: https://yourdomain.com/api/webhooks/payment
```

### 2. Database Seeding

After deployment, seed the database with sample quotes:

```bash
# For Railway
railway run npm run seed

# For Heroku
heroku run npm run seed

# For Vercel
vercel env pull .env.local
npm run seed

# For VPS
cd /path/to/app
npm run seed
```

### 3. Start Cron Jobs

Initialize the scheduled jobs:

```bash
curl -X POST https://yourdomain.com/api/cron/start
```

### 4. Health Checks

Verify everything is working:

```bash
# Check API health
curl https://yourdomain.com/api/admin/stats

# Check cron jobs
curl https://yourdomain.com/api/cron/start

# Check admin dashboard
open https://yourdomain.com
```

## Monitoring and Maintenance

### 1. Log Monitoring

```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# PM2 (VPS)
pm2 logs mobile-vas-platform
pm2 monit
```

### 2. Database Backups

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/db" --out=backup-$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/db" backup-20231201/
```

### 3. Application Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Build and restart
npm run build
pm2 restart mobile-vas-platform  # For VPS
```

### 4. Performance Monitoring

- Monitor response times in admin dashboard
- Set up alerts for failed SMS deliveries
- Track subscription conversion rates
- Monitor server resource usage

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Review build logs for specific errors

2. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no extra spaces or quotes

3. **Database Connection Issues**
   - Check MongoDB URI format
   - Verify network connectivity
   - Confirm database user permissions

4. **Webhook Issues**
   - Test webhook endpoints manually
   - Check SSL certificate validity
   - Verify Africa's Talking webhook configuration

### Support

For deployment issues:

1. Check application logs
2. Verify environment variables
3. Test individual API endpoints
4. Contact hosting provider support
5. Create GitHub issue with deployment logs

## Security Checklist

- [ ] Use HTTPS for all endpoints
- [ ] Set strong webhook secrets
- [ ] Enable database authentication
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup data regularly
- [ ] Use environment variables for secrets
