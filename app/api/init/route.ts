import { NextResponse } from 'next/server'
import { initializeScheduler } from '@/lib/scheduler'

let isInitialized = false

export async function GET() {
  if (!isInitialized) {
    initializeScheduler()
    isInitialized = true
    console.log('Reminder scheduler initialized')
  }
  
  return NextResponse.json({ status: 'Scheduler running' })
} 