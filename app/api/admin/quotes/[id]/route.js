import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Quote from '../../../../models/Quote';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return NextResponse.json({
        success: false,
        error: 'Quote not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quote'
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    const quote = await Quote.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!quote) {
      return NextResponse.json({
        success: false,
        error: 'Quote not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Quote updated successfully'
    });

  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update quote'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const quote = await Quote.findByIdAndDelete(id);
    
    if (!quote) {
      return NextResponse.json({
        success: false,
        error: 'Quote not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete quote'
    }, { status: 500 });
  }
}
