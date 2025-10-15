import africastalking from 'africastalking';

// Initialize Africa's Talking
const credentials = {
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
};

const africastalkingClient = africastalking(credentials);

// SMS Service
export const sms = africastalkingClient.SMS;

// USSD Service
export const ussd = africastalkingClient.USSD;

// Payment Service
export const payments = africastalkingClient.PAYMENT;

// Subscription Service
export const subscriptions = africastalkingClient.SUBSCRIPTION;

// Configuration constants
export const config = {
  senderId: process.env.AFRICASTALKING_SENDER_ID || 'VASPlatform',
  shortCode: process.env.AFRICASTALKING_SHORT_CODE || '22345',
  currency: process.env.SUBSCRIPTION_CURRENCY || 'KES',
  dailyCost: parseInt(process.env.DAILY_SUBSCRIPTION_COST) || 5,
  weeklyCost: parseInt(process.env.WEEKLY_SUBSCRIPTION_COST) || 30,
  timezone: process.env.TIMEZONE || 'Africa/Nairobi',
  webhookSecret: process.env.WEBHOOK_SECRET,
};

// Helper function to format phone number
export function formatPhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different Kenyan phone number formats
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7')) {
    return '254' + cleaned;
  }
  
  throw new Error(`Invalid phone number format: ${phoneNumber}`);
}

// Helper function to send SMS
export async function sendSMS(to, message, options = {}) {
  try {
    const formattedNumber = formatPhoneNumber(to);
    
    const smsOptions = {
      to: formattedNumber,
      message: message,
      from: config.senderId,
      ...options
    };

    const response = await sms.send(smsOptions);
    
    return {
      success: true,
      data: response,
      messageId: response.SMSMessageData?.Recipients?.[0]?.messageId
    };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    };
  }
}

// Helper function to create subscription
export async function createSubscription(phoneNumber, productName, amount, currency = 'KES') {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    const subscriptionOptions = {
      username: config.username,
      productName: productName,
      phoneNumber: formattedNumber,
      currencyCode: currency,
      amount: amount,
      metadata: {
        service: 'mobile-vas-platform',
        timestamp: new Date().toISOString()
      }
    };

    const response = await subscriptions.create(subscriptionOptions);
    
    return {
      success: true,
      data: response,
      subscriptionId: response.subscriptionId
    };
  } catch (error) {
    console.error('Subscription creation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to create subscription'
    };
  }
}

// Helper function to cancel subscription
export async function cancelSubscription(subscriptionId) {
  try {
    const response = await subscriptions.delete({
      username: config.username,
      subscriptionId: subscriptionId
    });
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Subscription cancellation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel subscription'
    };
  }
}

// Helper function to initiate payment
export async function initiatePayment(productName, phoneNumber, amount, currency = 'KES', metadata = {}) {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    const paymentOptions = {
      username: config.username,
      productName: productName,
      phoneNumber: formattedNumber,
      currencyCode: currency,
      amount: amount,
      metadata: {
        service: 'mobile-vas-platform',
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };

    const response = await payments.mobileCheckout(paymentOptions);
    
    return {
      success: true,
      data: response,
      transactionId: response.transactionId
    };
  } catch (error) {
    console.error('Payment initiation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to initiate payment'
    };
  }
}

// Helper function to validate webhook signature
export function validateWebhookSignature(payload, signature, secret) {
  if (!secret) {
    console.warn('Webhook secret not configured, skipping signature validation');
    return true;
  }
  
  // In a real implementation, you would validate the signature here
  // This is a placeholder for the actual validation logic
  return true;
}

export default {
  sms,
  ussd,
  payments,
  subscriptions,
  config,
  formatPhoneNumber,
  sendSMS,
  createSubscription,
  cancelSubscription,
  initiatePayment,
  validateWebhookSignature
};
