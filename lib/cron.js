import cron from 'node-cron';
import connectDB from './mongodb';
import User from '../models/User';
import Quote from '../models/Quote';
import Message from '../models/Message';
import Subscription from '../models/Subscription';
import { sendSMS, config } from './africastalking';

class CronManager {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    await connectDB();
    
    // Schedule daily quote delivery at 9:00 AM Nairobi time
    this.scheduleDailyQuotes();
    
    // Schedule subscription billing check every hour
    this.scheduleBillingCheck();
    
    // Schedule cleanup job daily at midnight
    this.scheduleCleanup();
    
    // Schedule analytics job daily at 11:00 PM
    this.scheduleAnalytics();
    
    this.isInitialized = true;
    console.log('Cron jobs initialized successfully');
  }

  scheduleDailyQuotes() {
    // Run at 9:00 AM Nairobi time (UTC+3)
    const job = cron.schedule('0 6 * * *', async () => {
      console.log('Starting daily quote delivery job...');
      await this.deliverDailyQuotes();
    }, {
      scheduled: false,
      timezone: 'Africa/Nairobi'
    });

    this.jobs.set('dailyQuotes', job);
    job.start();
    console.log('Daily quotes job scheduled for 9:00 AM Nairobi time');
  }

  scheduleBillingCheck() {
    // Check for billing every hour
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Starting billing check job...');
      await this.processBilling();
    }, {
      scheduled: false,
      timezone: 'Africa/Nairobi'
    });

    this.jobs.set('billingCheck', job);
    job.start();
    console.log('Billing check job scheduled every hour');
  }

  scheduleCleanup() {
    // Run cleanup at midnight Nairobi time
    const job = cron.schedule('0 21 * * *', async () => {
      console.log('Starting cleanup job...');
      await this.cleanupExpiredData();
    }, {
      scheduled: false,
      timezone: 'Africa/Nairobi'
    });

    this.jobs.set('cleanup', job);
    job.start();
    console.log('Cleanup job scheduled for midnight Nairobi time');
  }

  scheduleAnalytics() {
    // Run analytics at 11:00 PM Nairobi time
    const job = cron.schedule('0 20 * * *', async () => {
      console.log('Starting analytics job...');
      await this.generateDailyAnalytics();
    }, {
      scheduled: false,
      timezone: 'Africa/Nairobi'
    });

    this.jobs.set('analytics', job);
    job.start();
    console.log('Analytics job scheduled for 11:00 PM Nairobi time');
  }

  async deliverDailyQuotes() {
    try {
      await connectDB();
      
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
      
      // Get all active users with subscriptions
      const users = await User.find({
        isActive: true,
        'subscriptionHistory.isActive': true,
        'subscriptionHistory.endDate': { $gt: now }
      });

      console.log(`Found ${users.length} users with active subscriptions`);

      let successCount = 0;
      let failureCount = 0;

      for (const user of users) {
        try {
          // Check if user wants messages at current time
          if (user.preferences.deliveryTime !== currentTime) {
            continue;
          }

          // Get user's active subscriptions
          const activeSubscriptions = user.activeSubscriptions;
          
          for (const subscription of activeSubscriptions) {
            // Get random quote for this subscription type
            const quote = await Quote.getRandomQuote(subscription.type, user.preferences.language);
            
            if (quote) {
              const message = this.formatQuoteMessage(quote, subscription.type);
              
              // Send SMS
              const smsResult = await sendSMS(user.phoneNumber, message);
              
              // Log message
              await Message.create({
                recipient: user.phoneNumber,
                content: message,
                type: subscription.type,
                channel: 'sms',
                status: smsResult.success ? 'sent' : 'failed',
                africastalkingId: smsResult.messageId,
                sentAt: new Date(),
                metadata: {
                  quoteId: quote._id,
                  subscriptionId: subscription._id,
                  campaignId: `daily-${subscription.type}-${now.toISOString().split('T')[0]}`
                }
              });

              // Update quote usage
              await quote.incrementUsage();
              
              if (smsResult.success) {
                successCount++;
              } else {
                failureCount++;
                console.error(`Failed to send quote to ${user.phoneNumber}:`, smsResult.error);
              }

              // Add small delay between messages to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            } else {
              console.warn(`No quotes available for type: ${subscription.type}`);
              failureCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing user ${user.phoneNumber}:`, error);
          failureCount++;
        }
      }

      console.log(`Daily quote delivery completed: ${successCount} successful, ${failureCount} failed`);

    } catch (error) {
      console.error('Error in deliverDailyQuotes:', error);
    }
  }

  async processBilling() {
    try {
      await connectDB();
      
      const now = new Date();
      
      // Get subscriptions that need billing
      const subscriptionsForBilling = await Subscription.getSubscriptionsForBilling();
      
      console.log(`Found ${subscriptionsForBilling.length} subscriptions for billing`);

      for (const subscription of subscriptionsForBilling) {
        try {
          // Process billing for this subscription
          await this.processSubscriptionBilling(subscription);
          
          // Add delay to avoid overwhelming the payment system
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error processing billing for subscription ${subscription._id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error in processBilling:', error);
    }
  }

  async processSubscriptionBilling(subscription) {
    try {
      const { createSubscription, initiatePayment } = await import('./africastalking');
      
      // Check if subscription needs renewal
      if (subscription.nextBillingDate <= new Date()) {
        // Initiate payment
        const productName = `daily-${subscription.type}-${subscription.billingCycle}`;
        const paymentResult = await initiatePayment(
          productName,
          subscription.phoneNumber,
          subscription.cost,
          subscription.currency,
          {
            subscriptionId: subscription._id.toString(),
            billingCycle: subscription.billingCycle
          }
        );

        if (paymentResult.success) {
          // Add payment record
          await subscription.addPayment(
            subscription.cost,
            'pending',
            paymentResult.transactionId
          );

          // Update next billing date
          const extensionDays = subscription.billingCycle === 'daily' ? 1 : 7;
          subscription.nextBillingDate = new Date(
            subscription.nextBillingDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000)
          );
          
          await subscription.save();
          
          console.log(`Billing initiated for subscription ${subscription._id}: ${paymentResult.transactionId}`);
        } else {
          // Handle payment initiation failure
          await subscription.addPayment(
            subscription.cost,
            'failed',
            null,
            paymentResult.error
          );
          
          console.error(`Failed to initiate billing for subscription ${subscription._id}:`, paymentResult.error);
        }
      }
    } catch (error) {
      console.error(`Error processing subscription billing ${subscription._id}:`, error);
    }
  }

  async cleanupExpiredData() {
    try {
      await connectDB();
      
      const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
      
      // Clean up old messages (keep last 30 days)
      const deletedMessages = await Message.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        status: { $in: ['delivered', 'failed'] }
      });
      
      console.log(`Cleaned up ${deletedMessages.deletedCount} old messages`);
      
      // Clean up expired subscriptions
      const expiredSubscriptions = await Subscription.updateMany(
        {
          status: 'active',
          endDate: { $lt: new Date() }
        },
        {
          $set: { status: 'expired' }
        }
      );
      
      console.log(`Marked ${expiredSubscriptions.modifiedCount} subscriptions as expired`);
      
      // Clean up inactive users (no activity for 90 days)
      const ninetyDaysAgo = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));
      const inactiveUsers = await User.updateMany(
        {
          isActive: true,
          lastActivity: { $lt: ninetyDaysAgo },
          'subscriptionHistory.isActive': false
        },
        {
          $set: { isActive: false }
        }
      );
      
      console.log(`Marked ${inactiveUsers.modifiedCount} users as inactive`);
      
    } catch (error) {
      console.error('Error in cleanupExpiredData:', error);
    }
  }

  async generateDailyAnalytics() {
    try {
      await connectDB();
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      // Get daily statistics
      const messageStats = await Message.getDeliveryStats(startOfDay, endOfDay);
      const subscriptionStats = await Subscription.getSubscriptionStats(startOfDay, endOfDay);
      
      // Get user counts
      const totalUsers = await User.countDocuments({ isActive: true });
      const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
      
      const analytics = {
        date: startOfDay.toISOString().split('T')[0],
        users: {
          total: totalUsers,
          activeSubscriptions
        },
        messages: messageStats,
        subscriptions: subscriptionStats,
        generatedAt: new Date()
      };
      
      // Log analytics (in production, you might want to store this in a separate collection)
      console.log('Daily Analytics:', JSON.stringify(analytics, null, 2));
      
    } catch (error) {
      console.error('Error in generateDailyAnalytics:', error);
    }
  }

  formatQuoteMessage(quote, type) {
    const emoji = type === 'love' ? '🥰' : '✝️';
    const serviceName = type === 'love' ? 'Love Quote' : 'Bible Verse';
    
    let message = `${emoji} Daily ${serviceName}\n\n`;
    message += `"${quote.content}"\n\n`;
    
    if (quote.author) {
      message += `- ${quote.author}\n\n`;
    }
    
    if (type === 'bible' && quote.title) {
      message += `(${quote.title})\n\n`;
    }
    
    message += `To unsubscribe, text STOP.\nFor help, text HELP.`;
    
    return message;
  }

  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`Stopped job: ${jobName}`);
    }
  }

  startJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      console.log(`Started job: ${jobName}`);
    }
  }

  stopAllJobs() {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped job: ${name}`);
    }
  }

  startAllJobs() {
    for (const [name, job] of this.jobs) {
      job.start();
      console.log(`Started job: ${name}`);
    }
  }

  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }
    return status;
  }
}

// Create singleton instance
const cronManager = new CronManager();

export default cronManager;
