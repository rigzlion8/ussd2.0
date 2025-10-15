import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb.js';
import User from '@models/User.js';
import Message from '@models/Message.js';
import Quote from '@models/Quote.js';
import { sendSMS, formatPhoneNumber, config } from '@lib/africastalking.js';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      phoneNumber, 
      text, 
      linkId, 
      date, 
      id 
    } = body;

    // Validate required fields
    if (!phoneNumber || !text) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Format phone number
    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(phoneNumber);
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid phone number format'
      }, { status: 400 });
    }

    // Normalize the incoming text
    const normalizedText = text.trim().toUpperCase();
    
    // Log incoming SMS
    await Message.create({
      recipient: formattedPhone,
      content: `INCOMING: ${text}`,
      type: 'sms_receive',
      channel: 'sms',
      status: 'delivered',
      sentAt: new Date(),
      metadata: {
        linkId,
        originalId: id
      }
    });

    // Create or find user
    let user = await User.findOne({ phoneNumber: formattedPhone });
    if (!user) {
      user = new User({
        phoneNumber: formattedPhone,
        name: '',
        preferences: {
          language: 'en',
          deliveryTime: '09:00'
        }
      });
      await user.save();
    }

    let responseMessage = '';
    let responseType = '';

    // Handle different SMS commands
    switch (normalizedText) {
      case 'LOVE':
        // Subscribe to love quotes
        try {
          await user.addSubscription('love', 'daily');
          
          // Get a sample love quote
          const loveQuote = await Quote.getRandomQuote('love', user.preferences.language);
          
          if (loveQuote) {
            responseMessage = `Welcome to Daily Love Quotes! 🥰\n\n"${loveQuote.content}"\n\n- ${loveQuote.author || 'Anonymous'}\n\nYou will receive daily love quotes at ${user.preferences.deliveryTime}. Cost: Ksh ${config.dailyCost}/day.\n\nTo unsubscribe, text STOP.\nTo get help, text HELP.`;
            await loveQuote.incrementUsage();
          } else {
            responseMessage = `Welcome to Daily Love Quotes! 🥰\n\nYou will receive daily love quotes at ${user.preferences.deliveryTime}. Cost: Ksh ${config.dailyCost}/day.\n\nTo unsubscribe, text STOP.\nTo get help, text HELP.`;
          }
          
          responseType = 'love';
        } catch (error) {
          console.error('Love subscription error:', error);
          responseMessage = 'Sorry, there was an error subscribing you to love quotes. Please try again later.';
        }
        break;

      case 'BIBLE':
        // Subscribe to Bible verses
        try {
          await user.addSubscription('bible', 'daily');
          
          // Get a sample Bible verse
          const bibleQuote = await Quote.getRandomQuote('bible', user.preferences.language);
          
          if (bibleQuote) {
            responseMessage = `Welcome to Daily Bible Verses! ✝️\n\n"${bibleQuote.content}"\n\n- ${bibleQuote.title}\n\nYou will receive daily Bible verses at ${user.preferences.deliveryTime}. Cost: Ksh ${config.dailyCost}/day.\n\nTo unsubscribe, text STOP.\nTo get help, text HELP.`;
            await bibleQuote.incrementUsage();
          } else {
            responseMessage = `Welcome to Daily Bible Verses! ✝️\n\nYou will receive daily Bible verses at ${user.preferences.deliveryTime}. Cost: Ksh ${config.dailyCost}/day.\n\nTo unsubscribe, text STOP.\nTo get help, text HELP.`;
          }
          
          responseType = 'bible';
        } catch (error) {
          console.error('Bible subscription error:', error);
          responseMessage = 'Sorry, there was an error subscribing you to Bible verses. Please try again later.';
        }
        break;

      case 'STOP':
      case 'UNSUBSCRIBE':
      case 'CANCEL':
        // Unsubscribe from all services
        try {
          await user.cancelSubscription('love');
          await user.cancelSubscription('bible');
          
          responseMessage = 'You have been unsubscribed from all services. You will no longer receive any messages.\n\nTo resubscribe, text LOVE for love quotes or BIBLE for Bible verses.';
          responseType = 'cancellation';
        } catch (error) {
          console.error('Unsubscribe error:', error);
          responseMessage = 'Sorry, there was an error unsubscribing you. Please try again later.';
        }
        break;

      case 'HELP':
      case 'INFO':
        // Send help information
        responseMessage = `Daily Inspiration Service 📱\n\nSubscribe to receive daily messages:\n• Text LOVE for daily love quotes (Ksh ${config.dailyCost}/day)\n• Text BIBLE for daily Bible verses (Ksh ${config.dailyCost}/day)\n\nManage your subscription:\n• Text STOP to unsubscribe\n• Text HELP for this info\n• Dial *${config.shortCode}# for USSD menu\n\nMessages sent daily at 9:00 AM.\n\nFor support, contact us at support@vasplatform.com`;
        responseType = 'help';
        break;

      case 'STATUS':
      case 'INFO':
        // Check subscription status
        const activeSubs = user.activeSubscriptions;
        if (activeSubs.length === 0) {
          responseMessage = 'You have no active subscriptions.\n\nTo subscribe:\n• Text LOVE for love quotes\n• Text BIBLE for Bible verses\n• Dial *${config.shortCode}# for USSD menu';
        } else {
          responseMessage = 'Your Active Subscriptions:\n\n';
          activeSubs.forEach(sub => {
            responseMessage += `• ${sub.type.charAt(0).toUpperCase() + sub.type.slice(1)} Messages (${sub.billingCycle})\n`;
            responseMessage += `  Expires: ${sub.endDate.toLocaleDateString()}\n\n`;
          });
          responseMessage += `To unsubscribe, text STOP.\nTo manage, dial *${config.shortCode}#`;
        }
        responseType = 'status';
        break;

      case 'BOTH':
        // Subscribe to both services
        try {
          await user.addSubscription('love', 'daily');
          await user.addSubscription('bible', 'daily');
          
          // Get sample quotes
          const loveQuote = await Quote.getRandomQuote('love', user.preferences.language);
          const bibleQuote = await Quote.getRandomQuote('bible', user.preferences.language);
          
          responseMessage = `Welcome to Daily Inspiration! 🥰✝️\n\nYou are now subscribed to both love quotes and Bible verses.\n\nDaily cost: Ksh ${config.dailyCost * 2}\nDelivery time: ${user.preferences.deliveryTime}\n\nTo unsubscribe, text STOP.\nTo get help, text HELP.`;
          
          if (loveQuote) await loveQuote.incrementUsage();
          if (bibleQuote) await bibleQuote.incrementUsage();
          
          responseType = 'both';
        } catch (error) {
          console.error('Both subscription error:', error);
          responseMessage = 'Sorry, there was an error subscribing you to both services. Please try again later.';
        }
        break;

      default:
        // Unknown command
        responseMessage = `Unknown command: "${text}"\n\nAvailable commands:\n• LOVE - Subscribe to love quotes\n• BIBLE - Subscribe to Bible verses\n• BOTH - Subscribe to both services\n• STOP - Unsubscribe\n• HELP - Get help\n• STATUS - Check subscription\n\nFor USSD menu, dial *${config.shortCode}#`;
        responseType = 'unknown';
    }

    // Send response SMS
    if (responseMessage) {
      try {
        const smsResult = await sendSMS(formattedPhone, responseMessage);
        
        // Log outgoing SMS
        await Message.create({
          recipient: formattedPhone,
          content: responseMessage,
          type: responseType || 'response',
          channel: 'sms',
          status: smsResult.success ? 'sent' : 'failed',
          africastalkingId: smsResult.messageId,
          sentAt: new Date(),
          metadata: {
            originalSmsId: id,
            linkId,
            responseType
          }
        });

        if (!smsResult.success) {
          console.error('Failed to send response SMS:', smsResult.error);
        }
      } catch (error) {
        console.error('Error sending response SMS:', error);
      }
    }

    // Update user last activity
    user.lastActivity = new Date();
    await user.save();

    return NextResponse.json({
      status: 'success',
      message: 'SMS processed successfully'
    });

  } catch (error) {
    console.error('SMS Receive Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error'
    }, { status: 500 });
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
    message: 'SMS webhook endpoint is active'
  });
}
