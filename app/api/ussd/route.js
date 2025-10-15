import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Message from '../../../models/Message';
import { formatPhoneNumber } from '../../../lib/africastalking';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      phoneNumber, 
      text, 
      sessionId, 
      serviceCode 
    } = body;

    // Validate required fields
    if (!phoneNumber || !sessionId || !serviceCode) {
      return NextResponse.json({
        response: 'END Invalid request parameters',
        status: 400
      });
    }

    // Format phone number
    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(phoneNumber);
    } catch (error) {
      return NextResponse.json({
        response: 'END Invalid phone number format',
        status: 400
      });
    }

    // Parse USSD input
    const input = text || '';
    const inputParts = input.split('*').filter(part => part.length > 0);
    const currentLevel = inputParts.length;
    const lastInput = inputParts[inputParts.length - 1] || '';

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

    // Log the USSD session
    await Message.create({
      recipient: formattedPhone,
      content: `USSD Session: ${text || 'START'}`,
      type: 'ussd',
      channel: 'ussd',
      status: 'delivered',
      sentAt: new Date()
    });

    // USSD Menu Flow
    let response = '';

    switch (currentLevel) {
      case 0:
        // Main menu
        response = `CON Welcome to Daily Inspiration!

Choose your subscription:
1. Love Quotes (Ksh 5/day)
2. Bible Verses (Ksh 5/day)
3. Both Services (Ksh 10/day)
4. Manage Subscription
5. Help

Reply with option number (1-5)`;
        break;

      case 1:
        // Handle main menu selection
        switch (lastInput) {
          case '1':
            // Love quotes subscription
            response = `CON Love Quotes Subscription

You will receive daily love quotes for Ksh 5 per day.

To confirm subscription:
1. Yes, Subscribe
2. No, Go Back

Reply with option (1-2)`;
            break;

          case '2':
            // Bible verses subscription
            response = `CON Bible Verses Subscription

You will receive daily Bible verses for Ksh 5 per day.

To confirm subscription:
1. Yes, Subscribe
2. No, Go Back

Reply with option (1-2)`;
            break;

          case '3':
            // Both services subscription
            response = `CON Both Services Subscription

You will receive both love quotes and Bible verses for Ksh 10 per day.

To confirm subscription:
1. Yes, Subscribe
2. No, Go Back

Reply with option (1-2)`;
            break;

          case '4':
            // Manage subscription
            response = `CON Manage Subscription

Choose action:
1. View Active Subscriptions
2. Cancel Subscription
3. Change Delivery Time
4. Back to Main Menu

Reply with option (1-4)`;
            break;

          case '5':
            // Help
            response = `CON Help & Support

This service provides daily inspirational messages:
- Love Quotes: Ksh 5/day
- Bible Verses: Ksh 5/day
- Both Services: Ksh 10/day

Messages are sent daily at 9:00 AM.

For support, text HELP to ${process.env.AFRICASTALKING_SHORT_CODE || '22345'}

0. Back to Main Menu`;
            break;

          default:
            response = `CON Invalid option. Please choose 1-5.

Choose your subscription:
1. Love Quotes (Ksh 5/day)
2. Bible Verses (Ksh 5/day)
3. Both Services (Ksh 10/day)
4. Manage Subscription
5. Help`;
        }
        break;

      case 2:
        // Handle subscription confirmation
        const parentInput = inputParts[0];
        
        if (['1', '2', '3'].includes(parentInput)) {
          switch (lastInput) {
            case '1':
              // Confirm subscription
              try {
                // Add subscription based on parent input
                if (parentInput === '1') {
                  await user.addSubscription('love', 'daily');
                } else if (parentInput === '2') {
                  await user.addSubscription('bible', 'daily');
                } else if (parentInput === '3') {
                  await user.addSubscription('love', 'daily');
                  await user.addSubscription('bible', 'daily');
                }

                response = `END Thank you for subscribing!

You will now receive daily inspirational messages.

Your subscription is active and you will be charged daily.

To manage your subscription, dial *${serviceCode}# and select option 4.

Welcome to our community!`;
              } catch (error) {
                console.error('Subscription error:', error);
                response = `END Sorry, there was an error processing your subscription. Please try again later or contact support.`;
              }
              break;

            case '2':
              // Go back
              response = `CON Choose your subscription:
1. Love Quotes (Ksh 5/day)
2. Bible Verses (Ksh 5/day)
3. Both Services (Ksh 10/day)
4. Manage Subscription
5. Help`;
              break;

            default:
              response = `CON Invalid option. Please choose 1-2.

To confirm subscription:
1. Yes, Subscribe
2. No, Go Back`;
          }
        } else if (parentInput === '4') {
          // Handle subscription management
          switch (lastInput) {
            case '1':
              // View active subscriptions
              const activeSubs = user.activeSubscriptions;
              if (activeSubs.length === 0) {
                response = `END You have no active subscriptions.

To subscribe, dial *${serviceCode}# and select option 1, 2, or 3.`;
              } else {
                let subText = 'END Your Active Subscriptions:\n\n';
                activeSubs.forEach(sub => {
                  subText += `• ${sub.type.charAt(0).toUpperCase() + sub.type.slice(1)} Messages\n`;
                  subText += `  Billing: ${sub.billingCycle}\n`;
                  subText += `  Expires: ${sub.endDate.toLocaleDateString()}\n\n`;
                });
                subText += `To manage subscriptions, dial *${serviceCode}# and select option 4.`;
                response = subText;
              }
              break;

            case '2':
              // Cancel subscription
              response = `CON Cancel Subscription

Which subscription would you like to cancel?
1. Love Quotes
2. Bible Verses
3. Both Services
4. Back to Management Menu

Reply with option (1-4)`;
              break;

            case '3':
              // Change delivery time
              response = `CON Change Delivery Time

Current delivery time: ${user.preferences.deliveryTime}

Choose new delivery time:
1. 6:00 AM
2. 9:00 AM (Default)
3. 12:00 PM
4. 6:00 PM
5. Back to Management Menu

Reply with option (1-5)`;
              break;

            case '4':
              // Back to main menu
              response = `CON Choose your subscription:
1. Love Quotes (Ksh 5/day)
2. Bible Verses (Ksh 5/day)
3. Both Services (Ksh 10/day)
4. Manage Subscription
5. Help`;
              break;

            default:
              response = `CON Invalid option. Please choose 1-4.

Choose action:
1. View Active Subscriptions
2. Cancel Subscription
3. Change Delivery Time
4. Back to Main Menu`;
          }
        } else if (parentInput === '5' && lastInput === '0') {
          // Help -> Back to main menu
          response = `CON Choose your subscription:
1. Love Quotes (Ksh 5/day)
2. Bible Verses (Ksh 5/day)
3. Both Services (Ksh 10/day)
4. Manage Subscription
5. Help`;
        }
        break;

      case 3:
        // Handle deeper menu selections
        const grandParentInput = inputParts[0];
        const parentInput3 = inputParts[1];

        if (grandParentInput === '4' && parentInput3 === '2') {
          // Cancel subscription flow
          switch (lastInput) {
            case '1':
              await user.cancelSubscription('love');
              response = `END Love Quotes subscription cancelled successfully.

You will no longer receive love quotes.

To resubscribe, dial *${serviceCode}# and select option 1.`;
              break;

            case '2':
              await user.cancelSubscription('bible');
              response = `END Bible Verses subscription cancelled successfully.

You will no longer receive Bible verses.

To resubscribe, dial *${serviceCode}# and select option 2.`;
              break;

            case '3':
              await user.cancelSubscription('love');
              await user.cancelSubscription('bible');
              response = `END All subscriptions cancelled successfully.

You will no longer receive any messages.

To resubscribe, dial *${serviceCode}# and select option 1, 2, or 3.`;
              break;

            case '4':
              response = `CON Choose action:
1. View Active Subscriptions
2. Cancel Subscription
3. Change Delivery Time
4. Back to Main Menu`;
              break;

            default:
              response = `CON Invalid option. Please choose 1-4.

Which subscription would you like to cancel?
1. Love Quotes
2. Bible Verses
3. Both Services
4. Back to Management Menu`;
          }
        } else if (grandParentInput === '4' && parentInput3 === '3') {
          // Change delivery time flow
          const timeOptions = {
            '1': '06:00',
            '2': '09:00',
            '3': '12:00',
            '4': '18:00'
          };

          if (timeOptions[lastInput]) {
            user.preferences.deliveryTime = timeOptions[lastInput];
            await user.save();
            response = `END Delivery time updated to ${timeOptions[lastInput]}.

Your messages will now be sent at ${timeOptions[lastInput]} daily.

Thank you for using our service!`;
          } else if (lastInput === '5') {
            response = `CON Choose action:
1. View Active Subscriptions
2. Cancel Subscription
3. Change Delivery Time
4. Back to Main Menu`;
          } else {
            response = `CON Invalid option. Please choose 1-5.

Choose new delivery time:
1. 6:00 AM
2. 9:00 AM (Default)
3. 12:00 PM
4. 6:00 PM
5. Back to Management Menu`;
          }
        }
        break;

      default:
        response = `END Session expired. Please dial *${serviceCode}# to start over.`;
    }

    return NextResponse.json({
      response,
      status: 200
    });

  } catch (error) {
    console.error('USSD Error:', error);
    return NextResponse.json({
      response: 'END Sorry, there was an error. Please try again later.',
      status: 500
    });
  }
}
