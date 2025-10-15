import { NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import User from '../../models/User';
import Subscription from '../../models/Subscription';
import Message from '../../models/Message';
import { createSubscription, cancelSubscription, initiatePayment, config } from '../../lib/africastalking';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      action,
      userId,
      phoneNumber,
      subscriptionType,
      billingCycle = 'daily'
    } = body;

    if (!action || !phoneNumber || !subscriptionType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 });
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: formattedPhone });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    let result = {};

    switch (action) {
      case 'create_subscription':
        result = await createSubscriptionHandler(user, subscriptionType, billingCycle);
        break;
        
      case 'cancel_subscription':
        result = await cancelSubscriptionHandler(user, subscriptionType);
        break;
        
      case 'process_payment':
        result = await processPaymentHandler(user, subscriptionType, billingCycle);
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Billing Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

async function createSubscriptionHandler(user, subscriptionType, billingCycle) {
  try {
    // Calculate cost based on billing cycle
    const cost = billingCycle === 'daily' ? config.dailyCost : config.weeklyCost;
    const productName = `daily-${subscriptionType}-${billingCycle}`;

    // Create subscription in Africa's Talking
    const atResult = await createSubscription(
      user.phoneNumber,
      productName,
      cost,
      config.currency
    );

    if (!atResult.success) {
      throw new Error(atResult.error);
    }

    // Create subscription record in database
    const subscription = new Subscription({
      userId: user._id,
      phoneNumber: user.phoneNumber,
      type: subscriptionType,
      billingCycle,
      cost,
      currency: config.currency,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + (billingCycle === 'daily' ? 24 : 168) * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + (billingCycle === 'daily' ? 24 : 168) * 60 * 60 * 1000),
      africastalkingSubscriptionId: atResult.subscriptionId,
      isAutoRenew: true
    });

    await subscription.save();

    // Add subscription to user's history
    await user.addSubscription(subscriptionType, billingCycle);

    return {
      success: true,
      data: {
        subscriptionId: subscription._id,
        africastalkingId: atResult.subscriptionId,
        cost,
        billingCycle,
        nextBillingDate: subscription.nextBillingDate
      }
    };

  } catch (error) {
    console.error('Create subscription error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function cancelSubscriptionHandler(user, subscriptionType) {
  try {
    // Find active subscription
    const subscription = await Subscription.findOne({
      userId: user._id,
      type: subscriptionType,
      status: 'active'
    });

    if (!subscription) {
      return {
        success: false,
        error: 'No active subscription found'
      };
    }

    // Cancel subscription in Africa's Talking
    if (subscription.africastalkingSubscriptionId) {
      const atResult = await cancelSubscription(subscription.africastalkingSubscriptionId);
      
      if (!atResult.success) {
        console.warn('Failed to cancel AT subscription:', atResult.error);
      }
    }

    // Update subscription status
    await subscription.cancel();

    // Cancel subscription in user's history
    await user.cancelSubscription(subscriptionType);

    return {
      success: true,
      data: {
        subscriptionId: subscription._id,
        cancelledAt: new Date()
      }
    };

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function processPaymentHandler(user, subscriptionType, billingCycle) {
  try {
    const cost = billingCycle === 'daily' ? config.dailyCost : config.weeklyCost;
    const productName = `payment-${subscriptionType}-${billingCycle}`;

    // Initiate payment through Africa's Talking
    const paymentResult = await initiatePayment(
      productName,
      user.phoneNumber,
      cost,
      config.currency,
      {
        userId: user._id.toString(),
        subscriptionType,
        billingCycle
      }
    );

    if (!paymentResult.success) {
      throw new Error(paymentResult.error);
    }

    // Find or create subscription record
    let subscription = await Subscription.findOne({
      userId: user._id,
      type: subscriptionType,
      status: 'active'
    });

    if (!subscription) {
      subscription = new Subscription({
        userId: user._id,
        phoneNumber: user.phoneNumber,
        type: subscriptionType,
        billingCycle,
        cost,
        currency: config.currency,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + (billingCycle === 'daily' ? 24 : 168) * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + (billingCycle === 'daily' ? 24 : 168) * 60 * 60 * 1000),
        isAutoRenew: true
      });
    }

    // Add payment record
    await subscription.addPayment(
      cost,
      'pending',
      paymentResult.transactionId
    );

    await subscription.save();

    return {
      success: true,
      data: {
        transactionId: paymentResult.transactionId,
        subscriptionId: subscription._id,
        cost,
        status: 'pending'
      }
    };

  } catch (error) {
    console.error('Process payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// GET endpoint to check subscription status
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const subscriptionType = searchParams.get('type');

    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 });
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: formattedPhone });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    let subscriptions;
    
    if (subscriptionType) {
      subscriptions = await Subscription.find({
        userId: user._id,
        type: subscriptionType
      }).sort({ createdAt: -1 });
    } else {
      subscriptions = await Subscription.find({
        userId: user._id
      }).sort({ createdAt: -1 });
    }

    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.totalPaid, 0);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          totalSpent: user.totalSpent
        },
        subscriptions: subscriptions.map(sub => ({
          id: sub._id,
          type: sub.type,
          status: sub.status,
          billingCycle: sub.billingCycle,
          cost: sub.cost,
          currency: sub.currency,
          startDate: sub.startDate,
          endDate: sub.endDate,
          nextBillingDate: sub.nextBillingDate,
          totalPaid: sub.totalPaid,
          totalFailed: sub.totalFailed,
          consecutiveFailures: sub.consecutiveFailures
        })),
        activeSubscriptions: activeSubscriptions.length,
        totalRevenue
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7')) {
    return '254' + cleaned;
  }
  
  throw new Error(`Invalid phone number format: ${phoneNumber}`);
}
