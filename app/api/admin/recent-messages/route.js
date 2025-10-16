import { NextResponse } from 'next/server';
import connectDB from '@lib/mongodb.js';
import Message from '@models/Message.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    // Get recent messages
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('recipient type status sentAt createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recent messages'
    }, { status: 500 });
  }
}
