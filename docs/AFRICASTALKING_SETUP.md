# Africa's Talking Integration Setup

This guide provides detailed instructions for setting up Africa's Talking services for the Mobile VAS Platform.

## Prerequisites

- Africa's Talking account ([Sign up here](https://africastalking.com))
- Valid business registration documents
- Kenyan phone number for testing
- Domain with SSL certificate for webhooks

## Account Setup

### 1. Create Africa's Talking Account

1. **Sign Up**
   - Visit [Africa's Talking](https://africastalking.com)
   - Click "Get Started" or "Sign Up"
   - Provide business details and contact information
   - Verify email address

2. **Complete Profile**
   - Upload business registration documents
   - Provide company details and tax information
   - Set up billing information
   - Complete KYC verification process

3. **Get API Credentials**
   - Navigate to "API Keys" in dashboard
   - Note your API Key and Username
   - These will be used in your `.env` file

### 2. Sender ID Registration

1. **Request Sender ID**
   - Go to "SMS" → "Sender IDs" in dashboard
   - Click "Add Sender ID"
   - Enter desired sender ID (e.g., "VASPlatform")
   - Provide business justification
   - Submit for approval

2. **Approval Process**
   - Sender ID approval takes 1-2 business days
   - You'll receive email notification when approved
   - Test with approved sender ID

## SMS Shortcode Setup

### 1. Apply for Shortcode

1. **Contact Support**
   - Email: support@africastalking.com
   - Subject: "Shortcode Application - Mobile VAS Platform"
   - Include business registration documents

2. **Provide Information**
   ```
   Business Name: [Your Company Name]
   Shortcode Requested: 22345
   Service Description: Daily inspirational messages (love quotes and Bible verses)
   Target Market: Kenya
   Expected Volume: [Your estimate]
   Webhook URL: https://yourdomain.com/api/sms/receive
   ```

3. **Content Approval**
   - Submit sample messages for review
   - Ensure content is appropriate and non-offensive
   - Include opt-in/opt-out instructions

### 2. Premium SMS Product Setup

1. **Create Premium SMS Product**
   - Go to "SMS" → "Premium SMS" in dashboard
   - Click "Create Product"

2. **Configure Daily Love Quotes Product**
   ```
   Product Name: Daily Love Quotes
   Short Code: 22345
   Keyword: LOVE
   Price: KES 5.00
   Billing Cycle: Daily
   Auto-renewal: Yes
   Free Trial: No
   ```

3. **Configure Daily Bible Verses Product**
   ```
   Product Name: Daily Bible Verses
   Short Code: 22345
   Keyword: BIBLE
   Price: KES 5.00
   Billing Cycle: Daily
   Auto-renewal: Yes
   Free Trial: No
   ```

4. **Configure Combined Product**
   ```
   Product Name: Daily Inspiration Bundle
   Short Code: 22345
   Keyword: BOTH
   Price: KES 10.00
   Billing Cycle: Daily
   Auto-renewal: Yes
   Free Trial: No
   ```

### 3. Webhook Configuration

1. **Set Webhook URLs**
   - Go to "SMS" → "Settings" in dashboard
   - Set "Incoming SMS URL": `https://yourdomain.com/api/sms/receive`
   - Set "Delivery Report URL": `https://yourdomain.com/api/webhooks/delivery-report`
   - Enable "Accept Incoming SMS"
   - Enable "Accept Delivery Reports"

2. **Test Webhook**
   ```bash
   # Test incoming SMS webhook
   curl -X POST https://yourdomain.com/api/sms/receive \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "254700000000",
       "text": "LOVE",
       "linkId": "test-link-id",
       "date": "2023-12-01T10:00:00Z",
       "id": "test-message-id"
     }'
   ```

## USSD Setup

### 1. Apply for USSD Code

1. **Contact Support**
   - Email: support@africastalking.com
   - Subject: "USSD Code Application - Mobile VAS Platform"

2. **Provide USSD Specifications**
   ```
   Business Name: [Your Company Name]
   USSD Service: Mobile VAS Platform
   Menu Flow: Attached document
   Expected Users: [Your estimate]
   Webhook URL: https://yourdomain.com/api/ussd
   ```

3. **Submit Menu Flow Document**
   - Create detailed USSD menu flow
   - Include all menu options and responses
   - Specify error handling and timeouts
   - Provide user journey documentation

### 2. USSD Menu Flow

```
*XXXX# → Welcome Menu
├── 1 → Love Quotes Subscription
│   ├── 1 → Confirm Subscription
│   └── 2 → Back to Main Menu
├── 2 → Bible Verses Subscription
│   ├── 1 → Confirm Subscription
│   └── 2 → Back to Main Menu
├── 3 → Both Services Subscription
│   ├── 1 → Confirm Subscription
│   └── 2 → Back to Main Menu
├── 4 → Manage Subscription
│   ├── 1 → View Active Subscriptions
│   ├── 2 → Cancel Subscription
│   ├── 3 → Change Delivery Time
│   └── 4 → Back to Main Menu
└── 5 → Help & Support
    └── 0 → Back to Main Menu
```

### 3. USSD Webhook Configuration

1. **Set USSD Webhook**
   - Go to "USSD" → "Settings" in dashboard
   - Set "USSD URL": `https://yourdomain.com/api/ussd`
   - Enable "Accept USSD Requests"

2. **Test USSD Webhook**
   ```bash
   # Test USSD webhook
   curl -X POST https://yourdomain.com/api/ussd \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "254700000000",
       "text": "",
       "sessionId": "test-session-id",
       "serviceCode": "*XXXX#"
     }'
   ```

## Payment Integration

### 1. Mobile Money Setup

1. **Enable Mobile Money**
   - Go to "Payments" in dashboard
   - Enable "Mobile Money" service
   - Configure payment products

2. **Create Payment Products**
   ```
   Product Name: Love Quotes Subscription
   Product Type: Subscription
   Price: KES 5.00
   Currency: KES
   Billing Cycle: Daily
   ```

### 2. Payment Webhook Setup

1. **Configure Payment Webhook**
   - Set "Payment Callback URL": `https://yourdomain.com/api/webhooks/payment`
   - Enable "Accept Payment Callbacks"

2. **Test Payment Webhook**
   ```bash
   # Test payment webhook
   curl -X POST https://yourdomain.com/api/webhooks/payment \
     -H "Content-Type: application/json" \
     -d '{
       "transactionId": "test-transaction-id",
       "status": "successful",
       "phoneNumber": "254700000000",
       "amount": 5,
       "currency": "KES",
       "productName": "daily-love-daily"
     }'
   ```

## Testing

### 1. SMS Testing

1. **Test Keywords**
   ```
   Send "LOVE" to 22345
   Send "BIBLE" to 22345
   Send "BOTH" to 22345
   Send "STOP" to 22345
   Send "HELP" to 22345
   ```

2. **Verify Responses**
   - Check that appropriate responses are sent
   - Verify subscription creation
   - Confirm billing initiation

### 2. USSD Testing

1. **Test Menu Flow**
   ```
   Dial *XXXX#
   Navigate through all menu options
   Test subscription flows
   Verify cancellation process
   ```

2. **Test Error Handling**
   - Invalid menu selections
   - Session timeouts
   - Network interruptions

### 3. Payment Testing

1. **Test Billing**
   - Subscribe to services
   - Verify payment initiation
   - Check webhook callbacks
   - Confirm subscription activation

2. **Test Failures**
   - Insufficient funds
   - Payment declines
   - Network issues

## Production Checklist

### Before Going Live

- [ ] All webhook URLs are correctly configured
- [ ] SSL certificates are valid
- [ ] Sender ID is approved and working
- [ ] Shortcode is registered and active
- [ ] USSD code is assigned and working
- [ ] Premium SMS products are created
- [ ] Payment products are configured
- [ ] All webhooks are tested
- [ ] Content is approved by Safaricom
- [ ] Database is seeded with quotes
- [ ] Cron jobs are started
- [ ] Monitoring is set up

### Post-Launch Monitoring

- [ ] Monitor SMS delivery rates
- [ ] Track USSD usage statistics
- [ ] Monitor payment success rates
- [ ] Check webhook response times
- [ ] Monitor server performance
- [ ] Track user subscription patterns
- [ ] Monitor revenue generation

## Support and Contacts

### Africa's Talking Support

- **Email**: support@africastalking.com
- **Phone**: +254 20 524 2066
- **Documentation**: [API Docs](https://developers.africastalking.com)
- **Status Page**: [Status](https://status.africastalking.com)

### Safaricom Business Support

- **Email**: business@safaricom.co.ke
- **Phone**: +254 722 000 000
- **Business Portal**: [Business Portal](https://business.safaricom.co.ke)

### Common Issues and Solutions

1. **SMS Not Delivering**
   - Check account balance
   - Verify sender ID approval
   - Check content compliance
   - Review webhook logs

2. **USSD Not Working**
   - Verify USSD code registration
   - Check webhook configuration
   - Test webhook endpoint
   - Review menu flow logic

3. **Payment Issues**
   - Check payment product setup
   - Verify webhook configuration
   - Review payment logs
   - Check user account status

4. **Webhook Failures**
   - Verify SSL certificates
   - Check endpoint accessibility
   - Review webhook logs
   - Test manual webhook calls

## Best Practices

1. **Content Management**
   - Keep messages under 160 characters
   - Use appropriate emojis sparingly
   - Include opt-out instructions
   - Regular content updates

2. **User Experience**
   - Clear menu instructions
   - Helpful error messages
   - Easy subscription management
   - Responsive customer support

3. **Technical**
   - Implement proper error handling
   - Use webhook signature verification
   - Monitor webhook response times
   - Regular security updates

4. **Business**
   - Monitor subscription churn rates
   - Analyze user engagement patterns
   - Optimize pricing strategies
   - Regular content performance reviews
