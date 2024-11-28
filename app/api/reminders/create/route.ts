import { NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'
import { db } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) throw new Error('No token provided')

    const decodedToken = await auth.verifyIdToken(token)
    const reminderData = await request.json()

    // Validate the scheduled time
    const scheduledDate = new Date(reminderData.scheduledFor)
    if (scheduledDate <= new Date()) {
      throw new Error('Cannot schedule reminders in the past')
    }

    const reminder = {
      ...reminderData,
      userId: decodedToken.uid,
      userEmail: decodedToken.email,
      createdAt: Timestamp.now(),
      sent: false,
      timezone: 'Asia/Kolkata'
    }

    // Store the reminder
    const docRef = await db.collection('reminders').add(reminder)
    console.log(`Created reminder ${docRef.id} for ${new Date(reminder.scheduledFor).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`)

    return NextResponse.json({ 
      id: docRef.id, 
      ...reminder
    })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create reminder' },
      { status: 500 }
    )
  }
}

async function scheduleEmail(reminderId: string, scheduledDate: Date) {
  // Just log the scheduling - actual sending will be handled by the cron job
  console.log(`Reminder ${reminderId} scheduled for ${scheduledDate}`)
  
  // The cron job will handle the actual scheduling
  // No need to make HTTP requests here as it's handled by the scheduler
}

// Remove this line
// export const runtime = 'edge'; 