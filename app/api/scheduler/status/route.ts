import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    currentTime: new Date().toISOString(),
    message: 'Scheduler is running and checking for reminders every minute'
  })
} 