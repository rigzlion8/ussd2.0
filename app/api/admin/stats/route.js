import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb.js';
import User from '@models/User.js';
import Message from '@models/Message.js';
import Subscription from '@models/Subscription.js';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get total users
    const totalUsers = await User.countDocuments({ isActive: true });
    
    // Get active subscriptions count
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    // Get total messages sent
    const totalMessages = await Message.countDocuments({ status: { $in: ['sent', 'delivered'] } });
    
    // Get total revenue
    const revenueResult = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPaid' }
        }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get subscription breakdown
    const loveSubscribers = await Subscription.countDocuments({ 
      type: 'love', 
      status: 'active' 
    });
    
    const bibleSubscribers = await Subscription.countDocuments({ 
      type: 'bible', 
      status: 'active' 
    });
    
    // Get daily stats for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $in: ['sent', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get message type breakdown
    const messageTypeStats = await Message.aggregate([
      {
        $match: {
          status: { $in: ['sent', 'delivered'] }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get delivery status breakdown
    const deliveryStats = await Message.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalUsers,
      activeSubscriptions,
      totalMessages,
      totalRevenue,
      loveSubscribers,
      bibleSubscribers,
      dailyStats,
      messageTypeStats,
      deliveryStats
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics'
    }, { status: 500 });
  }
}
