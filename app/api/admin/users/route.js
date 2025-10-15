import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb.js';
import User from '@models/User.js';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Build query
    const query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'subscribed') {
      query['subscriptionHistory.isActive'] = true;
      query['subscriptionHistory.endDate'] = { $gt: new Date() };
    }
    
    if (search) {
      query.$or = [
        { phoneNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get users with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await User.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}
