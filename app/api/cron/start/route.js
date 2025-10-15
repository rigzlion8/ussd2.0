import { NextResponse } from 'next/server';
import cronManager from '@lib/cron.js';

export async function POST(request) {
  try {
    // Initialize and start all cron jobs
    await cronManager.initialize();
    
    return NextResponse.json({
      success: true,
      message: 'Cron jobs started successfully',
      status: cronManager.getJobStatus()
    });

  } catch (error) {
    console.error('Error starting cron jobs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to start cron jobs'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    return NextResponse.json({
      success: true,
      status: cronManager.getJobStatus()
    });

  } catch (error) {
    console.error('Error getting cron status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cron status'
    }, { status: 500 });
  }
}
