import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quote from '../../../models/Quote';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Build query
    const query = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get quotes with pagination
    const skip = (page - 1) * limit;
    const quotes = await Quote.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Quote.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quotes'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      type,
      title,
      content,
      author,
      language,
      priority,
      tags,
      isActive
    } = body;
    
    // Validate required fields
    if (!type || !title || !content) {
      return NextResponse.json({
        success: false,
        error: 'Type, title, and content are required'
      }, { status: 400 });
    }
    
    // Create new quote
    const quote = new Quote({
      type,
      title,
      content,
      author: author || '',
      language: language || 'en',
      priority: priority || 5,
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true
    });
    
    await quote.save();
    
    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Quote created successfully'
    });

  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create quote'
    }, { status: 500 });
  }
}
