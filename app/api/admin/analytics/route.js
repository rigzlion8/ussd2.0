import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Message from '../../../models/Message';
import Subscription from '../../../models/Subscription';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7days';
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (range) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get basic stats
    const totalUsers = await User.countDocuments({ isActive: true });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    // Get total messages in range
    const totalMessages = await Message.countDocuments({
      createdAt: { $gte: startDate },
      status: { $in: ['sent', 'delivered'] }
    });
    
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
    
    // Get daily message stats
    const dailyStats = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
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
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get delivery status breakdown
    const deliveryStats = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get subscription type breakdown
    const subscriptionStats = await Subscription.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPaid' }
        }
      }
    ]);
    
    // Get user growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
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
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get top performing quotes
    const topQuotes = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'metadata.quoteId': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$metadata.quoteId',
          usageCount: { $sum: 1 }
        }
      },
      {
        $sort: { usageCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    const analytics = {
      totalUsers,
      activeSubscriptions,
      totalMessages,
      totalRevenue,
      dailyStats,
      messageTypeStats,
      deliveryStats,
      subscriptionStats,
      userGrowth,
      topQuotes,
      dateRange: {
        start: startDate,
        end: now,
        range
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics'
    }, { status: 500 });
  }
}
