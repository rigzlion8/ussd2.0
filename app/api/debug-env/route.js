import { NextResponse } from 'next/server';

export async function GET() {
  const mongodbUri = process.env.MONGODB_URI || 'MONGODB_URI not set';
  return NextResponse.json({ mongodbUri });
}
