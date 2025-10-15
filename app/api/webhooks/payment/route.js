import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Subscription from '../../../../models/Subscription';
import Message from '../../../../models/Message';
import { validateWebhookSignature, config, sendSMS } from '../../../../lib/africastalking';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      transactionId,
      status,
      phoneNumber,
      amount,
      currency,
      productName,
      providerRef,
      errorCode,
      errorMessage,
      metadata
    } = body;

    // Validate webhook signature if secret is configured
    const signature = request.headers.get('x-signature');
    if (!validateWebhookSignature(JSON.stringify(body), signature, config.webhookSecret)) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid signature'
      }, { status: 401 });
    }

    // Validate required fields
    if (!transactionId || !status || !phoneNumber || !amount) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Format phone number
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }

    // Find user
    const user = await User.findOne({ phoneNumber: formattedPhone });
    if (!user) {
      console.warn(`Payment webhook received for unknown user: ${formattedPhone}`);
      return NextResponse.json({
        status: 'warning',
        message: 'User not found'
      });
    }

    // Find subscription by transaction ID
    const subscription = await Subscription.findOne({
      'paymentHistory.africastalkingTransactionId': transactionId
    });

    if (!subscription) {
      console.warn(`Payment webhook received for unknown transaction: ${transactionId}`);
      return NextResponse.json({
        status: 'warning',
        message: 'Subscription not found'
      });
    }

    // Update payment status
    const paymentRecord = subscription.paymentHistory.find(
      payment => payment.africastalkingTransactionId === transactionId
    );

    if (paymentRecord) {
      paymentRecord.status = status.toLowerCase();
      paymentRecord.failureReason = errorMessage;

      if (status.toLowerCase() === 'successful') {
        // Update subscription totals
        subscription.totalPaid += amount;
        subscription.consecutiveFailures = 0;
        
        // Extend subscription period
        const extensionDays = subscription.billingCycle === 'daily' ? 1 : 7;
        subscription.endDate = new Date(subscription.endDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
        subscription.nextBillingDate = new Date(subscription.nextBillingDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
        
        // Update user total spent
        user.totalSpent += amount;
        await user.save();

        // Send confirmation SMS
        await sendPaymentConfirmationSMS(user, subscription, amount);

      } else if (status.toLowerCase() === 'failed') {
        // Update subscription failure totals
        subscription.totalFailed += amount;
        subscription.consecutiveFailures += 1;

        // Send failure notification
        await sendPaymentFailureSMS(user, subscription, errorMessage);

        // Check if subscription should be cancelled due to consecutive failures
        if (subscription.consecutiveFailures >= subscription.maxConsecutiveFailures) {
          await handleSubscriptionCancellation(subscription, user);
        }
      }

      await subscription.save();
    }

    // Log payment webhook
    console.log(`Payment webhook processed: ${transactionId}`, {
      status,
      phoneNumber: formattedPhone,
      amount,
      currency,
      subscriptionId: subscription._id
    });

    return NextResponse.json({
      status: 'success',
      message: 'Payment webhook processed'
    });

  } catch (error) {
    console.error('Payment Webhook Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error'
    }, { status: 500 });
  }
}

async function sendPaymentConfirmationSMS(user, subscription, amount) {
  try {
    const message = `Payment successful! ✅\n\nAmount: Ksh ${amount}\nService: ${subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)} Messages\n\nYour subscription is now active until ${subscription.endDate.toLocaleDateString()}.\n\nThank you for using our service!`;
    
    await Message.create({
      recipient: user.phoneNumber,
      content: message,
      type: 'payment',
      channel: 'sms',
      status: 'pending',
      sentAt: new Date(),
      metadata: {
        subscriptionId: subscription._id.toString(),
        transactionType: 'confirmation'
      }
    });

    const smsResult = await sendSMS(user.phoneNumber, message);
    
    if (smsResult.success) {
      await Message.findOneAndUpdate(
        { recipient: user.phoneNumber, content: message },
        { 
          status: 'sent',
          africastalkingId: smsResult.messageId
        }
      );
    }
  } catch (error) {
    console.error('Error sending payment confirmation SMS:', error);
  }
}

async function sendPaymentFailureSMS(user, subscription, errorMessage) {
  try {
    const message = `Payment failed ❌\n\nWe were unable to process your payment for ${subscription.type} messages.\n\nReason: ${errorMessage || 'Unknown error'}\n\nPlease check your account balance and try again.\n\nTo update payment method, dial *${config.shortCode}#`;
    
    await Message.create({
      recipient: user.phoneNumber,
      content: message,
      type: 'payment',
      channel: 'sms',
      status: 'pending',
      sentAt: new Date(),
      metadata: {
        subscriptionId: subscription._id.toString(),
        transactionType: 'failure'
      }
    });

    const smsResult = await sendSMS(user.phoneNumber, message);
    
    if (smsResult.success) {
      await Message.findOneAndUpdate(
        { recipient: user.phoneNumber, content: message },
        { 
          status: 'sent',
          africastalkingId: smsResult.messageId
        }
      );
    }
  } catch (error) {
    console.error('Error sending payment failure SMS:', error);
  }
}

async function handleSubscriptionCancellation(subscription, user) {
  try {
    // Cancel subscription
    subscription.status = 'cancelled';
    subscription.isAutoRenew = false;
    await subscription.save();

    // Cancel subscription in user's history
    await user.cancelSubscription(subscription.type);

    // Send cancellation notification
    const message = `Subscription Cancelled 📱\n\nYour ${subscription.type} subscription has been cancelled due to multiple payment failures.\n\nTo resubscribe, text ${subscription.type.toUpperCase()} to ${config.shortCode}.\n\nFor support, text HELP.`;
    
    await Message.create({
      recipient: user.phoneNumber,
      content: message,
      type: 'cancellation',
      channel: 'sms',
      status: 'pending',
      sentAt: new Date(),
      metadata: {
        subscriptionId: subscription._id.toString(),
        reason: 'payment_failure'
      }
    });

    const smsResult = await sendSMS(user.phoneNumber, message);
    
    if (smsResult.success) {
      await Message.findOneAndUpdate(
        { recipient: user.phoneNumber, content: message },
        { 
          status: 'sent',
          africastalkingId: smsResult.messageId
        }
      );
    }

    console.log(`Subscription ${subscription._id} cancelled due to payment failures`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

// Handle GET requests for webhook verification
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({
    status: 'success',
    message: 'Payment webhook endpoint is active'
  });
}
