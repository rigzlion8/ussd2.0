import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb.js';
import Message from '@models/Message.js';
import { validateWebhookSignature, config } from '@lib/africastalking.js';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      requestId,
      status,
      phoneNumber,
      errorCode,
      errorMessage,
      deliveryDate,
      receivedDate
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
    if (!requestId || !status || !phoneNumber) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Find message by Africa's Talking ID
    const message = await Message.findOne({ 
      africastalkingId: requestId 
    });

    if (!message) {
      console.warn(`Delivery report received for unknown message: ${requestId}`);
      return NextResponse.json({
        status: 'warning',
        message: 'Message not found'
      });
    }

    // Update message delivery status
    await message.updateDeliveryStatus(
      status.toLowerCase(),
      errorCode,
      errorMessage
    );

    // Log delivery report
    console.log(`Delivery report for message ${requestId}: ${status}`, {
      phoneNumber,
      errorCode,
      errorMessage,
      deliveryDate,
      receivedDate
    });

    // If delivery failed, you might want to implement retry logic here
    if (status.toLowerCase() === 'failed') {
      await handleFailedDelivery(message, errorCode, errorMessage);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Delivery report processed'
    });

  } catch (error) {
    console.error('Delivery Report Webhook Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error'
    }, { status: 500 });
  }
}

async function handleFailedDelivery(message, errorCode, errorMessage) {
  try {
    // Increment retry count
    const retryCount = (message.metadata?.retryCount || 0) + 1;
    const maxRetries = 3;

    if (retryCount <= maxRetries) {
      // Update retry count
      message.metadata = {
        ...message.metadata,
        retryCount
      };
      await message.save();

      // Schedule retry (you might want to implement a queue system here)
      console.log(`Scheduling retry ${retryCount}/${maxRetries} for message ${message._id}`);
      
      // For now, we'll just log it. In production, you'd want to:
      // 1. Add to a retry queue
      // 2. Implement exponential backoff
      // 3. Handle different error types differently
      
      // Example retry logic (simplified):
      // setTimeout(async () => {
      //   await retryMessage(message._id);
      // }, Math.pow(2, retryCount) * 60000); // Exponential backoff in minutes
    } else {
      console.error(`Message ${message._id} failed permanently after ${maxRetries} retries`);
      
      // Mark message as permanently failed
      message.status = 'failed';
      message.deliveryReport.errorMessage = `Failed after ${maxRetries} retries: ${errorMessage}`;
      await message.save();

      // You might want to notify administrators here
      await notifyAdminOfFailedMessage(message, errorCode, errorMessage);
    }
  } catch (error) {
    console.error('Error handling failed delivery:', error);
  }
}

async function notifyAdminOfFailedMessage(message, errorCode, errorMessage) {
  // Implement admin notification logic here
  // This could be:
  // 1. Send email to admin
  // 2. Log to monitoring system
  // 3. Create support ticket
  
  console.log(`ADMIN NOTIFICATION: Message ${message._id} failed permanently`, {
    recipient: message.recipient,
    errorCode,
    errorMessage,
    retryCount: message.metadata?.retryCount || 0
  });
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
    message: 'Delivery report webhook endpoint is active'
  });
}
