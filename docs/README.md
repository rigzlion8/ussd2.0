# Mobile VAS Platform - Documentation

A production-ready mobile Value Added Services (VAS) platform for the Kenyan market with Africa's Talking integration. This platform enables users to subscribe to daily love quotes and Bible verses via USSD (*xxxx#) and SMS shortcode (22345).

## Features

- **USSD Menu System**: Interactive menu via *xxxx# shortcode
- **SMS Shortcode**: Text LOVE or BIBLE to 22345 to subscribe
- **Subscription Billing**: Automatic daily/weekly billing via Africa's Talking Premium SMS
- **Admin Dashboard**: Complete management interface for quotes, users, and analytics
- **Multi-language Support**: English and Swahili content
- **Scheduled Delivery**: Automated daily quote delivery via cron jobs
- **Webhook Integration**: Payment and delivery status callbacks
- **MongoDB Storage**: Persistent data storage for users, subscriptions, quotes, and messages

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile Users  │    │  Africa's Talking │    │  Admin Dashboard │
│                 │    │       API         │    │                 │
│ USSD *xxxx#     │◄──►│                  │◄──►│ Quote Management │
│ SMS 22345       │    │ Premium SMS      │    │ User Analytics  │
│                 │    │ Subscriptions    │    │ Message Reports │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Mobile VAS Platform                          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ USSD Handler│  │SMS Handler  │  │   Admin API Endpoints   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │Billing System│  │Webhook Hdlrs│  │     Cron Jobs           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Database                         │  │
│  │  Users | Subscriptions | Quotes | Messages | Analytics     │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Africa's Talking account with API credentials
- Domain with SSL certificate for webhooks

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ussd2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed the database with sample quotes
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access Admin Dashboard**
   ```
   http://localhost:3000
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Africa's Talking Configuration
AFRICASTALKING_API_KEY=your_api_key_here
AFRICASTALKING_USERNAME=your_username_here
AFRICASTALKING_SENDER_ID=your_sender_id
AFRICASTALKING_SHORT_CODE=22345

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mobile-vas-platform
# For production: mongodb+srv://username:password@cluster.mongodb.net/mobile-vas-platform

# Application Configuration
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Subscription Configuration
DAILY_SUBSCRIPTION_COST=5
WEEKLY_SUBSCRIPTION_COST=30
SUBSCRIPTION_CURRENCY=KES

# Timezone Configuration
TIMEZONE=Africa/Nairobi

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret_here
```

### Africa's Talking Setup

1. **Create Account**: Sign up at [Africa's Talking](https://africastalking.com)

2. **Get Credentials**: 
   - API Key: Found in your dashboard
   - Username: Your account username
   - Sender ID: Request a sender ID (e.g., "VASPlatform")

3. **Register Shortcode**:
   - Contact Africa's Talking support to register shortcode 22345
   - Provide your webhook URLs for SMS and USSD
   - Set up Premium SMS products for billing

4. **Configure Webhooks**:
   - SMS Receive: `https://yourdomain.com/api/sms/receive`
   - USSD: `https://yourdomain.com/api/ussd`
   - Delivery Reports: `https://yourdomain.com/api/webhooks/delivery-report`
   - Payment Callbacks: `https://yourdomain.com/api/webhooks/payment`

## API Endpoints

### USSD Endpoints
- `POST /api/ussd` - Handle USSD menu interactions

### SMS Endpoints
- `POST /api/sms/receive` - Process incoming SMS messages
- `GET /api/sms/receive` - Webhook verification

### Billing Endpoints
- `POST /api/billing` - Create/manage subscriptions
- `GET /api/billing` - Get subscription status

### Webhook Endpoints
- `POST /api/webhooks/delivery-report` - SMS delivery status
- `POST /api/webhooks/payment` - Payment status updates

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/quotes` - Quote management
- `GET /api/admin/messages` - Message history
- `GET /api/admin/analytics` - Analytics data

### Cron Endpoints
- `POST /api/cron/start` - Start scheduled jobs
- `POST /api/cron/deliver` - Manual quote delivery

## Deployment

### Option 1: Railway (Recommended)

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Set Environment Variables**
   - Go to Railway dashboard
   - Add all environment variables from your `.env` file

3. **Configure Domain**
   - Railway provides a domain automatically
   - Update Africa's Talking webhook URLs

### Option 2: Vercel

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Set Environment Variables**
   - Add variables in Vercel dashboard
   - Note: Cron jobs require Vercel Pro plan

### Option 3: Heroku

1. **Create Heroku App**
   ```bash
   heroku create mobile-vas-platform
   ```

2. **Configure Buildpacks**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set AFRICASTALKING_API_KEY=your_key
   heroku config:set MONGODB_URI=your_mongodb_uri
   # ... set all other variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 4: VPS/Dedicated Server

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   
   # Install MongoDB
   sudo apt install mongodb
   ```

2. **Deploy Application**
   ```bash
   # Clone and setup
   git clone <repository-url>
   cd ussd2.0
   npm install
   npm run build
   
   # Start with PM2
   pm2 start npm --name "mobile-vas" -- start
   pm2 startup
   pm2 save
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Certificate**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Safaricom Integration

### Shortcode Registration

1. **Contact Africa's Talking Support**
   - Request shortcode 22345 (or your preferred number)
   - Provide business registration documents
   - Submit content approval for love quotes and Bible verses

2. **Content Approval Process**
   - Prepare sample messages for review
   - Ensure content is appropriate and non-offensive
   - Submit for Safaricom content approval

3. **Premium SMS Setup**
   - Create Premium SMS products in Africa's Talking dashboard
   - Set pricing (Ksh 5 for daily, Ksh 30 for weekly)
   - Configure billing cycles and renewal policies

### USSD Code Registration

1. **Apply for USSD Code**
   - Contact Africa's Talking for USSD code registration
   - Provide detailed menu flow documentation
   - Submit technical specifications

2. **Menu Configuration**
   - Test USSD flow thoroughly
   - Ensure all menu options work correctly
   - Set up proper error handling

## Monitoring and Maintenance

### Health Checks

1. **Database Health**
   ```bash
   # Check MongoDB connection
   mongosh --eval "db.adminCommand('ping')"
   ```

2. **API Health**
   ```bash
   curl https://yourdomain.com/api/admin/stats
   ```

3. **Cron Jobs**
   ```bash
   # Check cron job status
   curl https://yourdomain.com/api/cron/start
   ```

### Logging

- Application logs are stored in MongoDB
- Use PM2 logs for server monitoring: `pm2 logs mobile-vas`
- Set up log rotation for production

### Backup Strategy

1. **Database Backups**
   ```bash
   # Daily MongoDB backup
   mongodump --uri="mongodb://localhost:27017/mobile-vas-platform" --out=/backup/$(date +%Y%m%d)
   ```

2. **Application Backups**
   - Keep git repository updated
   - Document all configuration changes
   - Test disaster recovery procedures

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different credentials for development/staging/production
   - Rotate API keys regularly

2. **Webhook Security**
   - Implement webhook signature verification
   - Use HTTPS for all webhook endpoints
   - Rate limit webhook endpoints

3. **Database Security**
   - Enable MongoDB authentication
   - Use connection string with credentials
   - Restrict database access by IP

4. **API Security**
   - Implement rate limiting
   - Validate all input data
   - Use proper error handling

## Troubleshooting

### Common Issues

1. **USSD Not Working**
   - Check Africa's Talking webhook configuration
   - Verify USSD code is properly registered
   - Test webhook endpoint manually

2. **SMS Not Sending**
   - Verify Africa's Talking API credentials
   - Check account balance and sender ID
   - Review SMS content for compliance

3. **Billing Issues**
   - Confirm Premium SMS product setup
   - Check webhook endpoints for payment callbacks
   - Verify phone number formats (254XXXXXXXXX)

4. **Database Connection**
   - Check MongoDB URI configuration
   - Verify network connectivity
   - Review database authentication

### Support Contacts

- **Africa's Talking Support**: support@africastalking.com
- **Safaricom Business**: business@safaricom.co.ke
- **Technical Issues**: Create GitHub issue in repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Changelog

### Version 1.0.0
- Initial release with USSD and SMS support
- Admin dashboard with quote management
- Subscription billing integration
- Multi-language support (English/Swahili)
- Comprehensive analytics and reporting
