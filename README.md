# Mobile VAS Platform

A production-ready mobile Value Added Services (VAS) platform for the Kenyan market with Africa's Talking integration. This platform enables users to subscribe to daily love quotes and Bible verses via USSD (*xxxx#) and SMS shortcode (22345).

## 🚀 Features

- **USSD Menu System**: Interactive menu via *xxxx# shortcode
- **SMS Shortcode**: Text LOVE or BIBLE to 22345 to subscribe
- **Subscription Billing**: Automatic daily/weekly billing via Africa's Talking Premium SMS
- **Admin Dashboard**: Complete management interface for quotes, users, and analytics
- **Multi-language Support**: English and Swahili content
- **Scheduled Delivery**: Automated daily quote delivery via cron jobs
- **Webhook Integration**: Payment and delivery status callbacks
- **MongoDB Storage**: Persistent data storage for users, subscriptions, quotes, and messages

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile Users  │    │  Africa's Talking │    │  Admin Dashboard │
│                 │    │       API         │    │                 │
│ USSD *xxxx#     │◄──►│                  │◄──►│ Quote Management │
│ SMS 22345       │    │ Premium SMS      │    │ User Analytics  │
│                 │    │ Subscriptions    │    │ Message Reports │
└─────────────────┘    └──────────────────┘    └─────────────────┘
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

## 🚀 Quick Start

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

## ⚙️ Configuration

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

## 📱 How It Works

### USSD Flow
1. User dials *XXXX#
2. System displays main menu with subscription options
3. User selects service (Love quotes, Bible verses, or both)
4. System creates subscription and initiates billing
5. User receives confirmation and daily messages

### SMS Flow
1. User texts "LOVE" or "BIBLE" to 22345
2. System processes keyword and creates subscription
3. User receives welcome message with sample quote
4. Daily messages are sent automatically
5. User can text "STOP" to unsubscribe

### Admin Dashboard
- **Quote Management**: Add, edit, delete love quotes and Bible verses
- **User Management**: View subscribers and their subscription status
- **Message History**: Monitor SMS delivery and USSD interactions
- **Analytics**: Revenue reports, delivery statistics, user insights

## 🛠️ API Endpoints

### USSD Endpoints
- `POST /api/ussd` - Handle USSD menu interactions

### SMS Endpoints
- `POST /api/sms/receive` - Process incoming SMS messages

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

## 🚀 Deployment

### Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Heroku
```bash
# Create Heroku app
heroku create mobile-vas-platform

# Deploy
git push heroku main
```

For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 🔧 Africa's Talking Setup

1. **Create Account**: Sign up at [Africa's Talking](https://africastalking.com)
2. **Get Credentials**: API Key, Username, Sender ID
3. **Register Shortcode**: Contact support for shortcode 22345
4. **Configure Webhooks**: Set up SMS, USSD, and payment webhooks
5. **Premium SMS**: Create billing products for subscriptions

For detailed setup instructions, see [AFRICASTALKING_SETUP.md](docs/AFRICASTALKING_SETUP.md).

## 📊 Database Schema

### Users Collection
```javascript
{
  phoneNumber: String, // 254XXXXXXXXX format
  name: String,
  isActive: Boolean,
  preferences: {
    language: String, // 'en' or 'sw'
    deliveryTime: String // '09:00'
  },
  subscriptionHistory: [{
    type: String, // 'love' or 'bible'
    startDate: Date,
    endDate: Date,
    isActive: Boolean,
    billingCycle: String // 'daily' or 'weekly'
  }],
  totalSpent: Number,
  lastActivity: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Quotes Collection
```javascript
{
  type: String, // 'love' or 'bible'
  title: String,
  content: String,
  author: String,
  language: String, // 'en' or 'sw'
  isActive: Boolean,
  priority: Number, // 1-10
  tags: [String],
  usageCount: Number,
  lastUsed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscriptions Collection
```javascript
{
  userId: ObjectId,
  phoneNumber: String,
  type: String, // 'love' or 'bible'
  billingCycle: String, // 'daily' or 'weekly'
  cost: Number,
  currency: String, // 'KES'
  status: String, // 'active', 'paused', 'cancelled', 'expired'
  startDate: Date,
  endDate: Date,
  nextBillingDate: Date,
  africastalkingSubscriptionId: String,
  paymentHistory: [{
    amount: Number,
    status: String, // 'pending', 'successful', 'failed'
    paymentDate: Date,
    failureReason: String
  }],
  totalPaid: Number,
  totalFailed: Number,
  consecutiveFailures: Number,
  isAutoRenew: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  recipient: String, // 254XXXXXXXXX format
  content: String,
  type: String, // 'love', 'bible', 'welcome', 'cancellation'
  channel: String, // 'sms' or 'ussd'
  status: String, // 'pending', 'sent', 'delivered', 'failed'
  africastalkingId: String,
  cost: Number,
  currency: String, // 'KES'
  deliveryReport: {
    status: String,
    errorCode: String,
    errorMessage: String,
    deliveredAt: Date
  },
  metadata: {
    quoteId: ObjectId,
    subscriptionId: String,
    campaignId: String,
    retryCount: Number
  },
  sentAt: Date,
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Cron Jobs

The platform includes automated cron jobs for:

- **Daily Quote Delivery**: Sends quotes to active subscribers at their preferred time
- **Billing Processing**: Handles subscription renewals and payment collection
- **Data Cleanup**: Removes old messages and expired subscriptions
- **Analytics Generation**: Creates daily performance reports

## 📈 Monitoring

### Health Checks
- Database connectivity
- API endpoint availability
- Cron job status
- Webhook endpoint health

### Metrics
- Message delivery rates
- Subscription conversion rates
- Revenue tracking
- User engagement analytics

## 🔒 Security

- Webhook signature verification
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure environment variable handling
- MongoDB connection security

## 🐛 Troubleshooting

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

## 📞 Support

- **Africa's Talking Support**: support@africastalking.com
- **Safaricom Business**: business@safaricom.co.ke
- **Technical Issues**: Create GitHub issue in repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 Changelog

### Version 1.0.0
- Initial release with USSD and SMS support
- Admin dashboard with quote management
- Subscription billing integration
- Multi-language support (English/Swahili)
- Comprehensive analytics and reporting

---

**Built with ❤️ for the Kenyan mobile market**
