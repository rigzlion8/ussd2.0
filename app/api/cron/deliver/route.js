import { NextResponse } from 'next/server';
import cronManager from '../../../lib/cron';

export async function POST(request) {
  try {
    // Manually trigger daily quote delivery
    await cronManager.deliverDailyQuotes();
    
    return NextResponse.json({
      success: true,
      message: 'Daily quote delivery triggered successfully'
    });

  } catch (error) {
    console.error('Error triggering quote delivery:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger quote delivery'
    }, { status: 500 });
  }
}
