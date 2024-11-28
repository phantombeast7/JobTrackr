import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { sendReminderEmail } from '@/lib/email'
import { Reminder } from '@/types/reminder'

export async function POST(request: Request) {
  try {
    const { reminderId } = await request.json()
    
    const reminderDoc = await db.collection('reminders').doc(reminderId).get()
    if (!reminderDoc.exists) {
      throw new Error('Reminder not found')
    }

    const reminderData = reminderDoc.data() as Reminder
    if (!reminderData || !reminderData.userEmail) {
      throw new Error('Invalid reminder data')
    }

    // Send the email
    await sendReminderEmail(reminderData.userEmail, {
      companyName: reminderData.companyName,
      jobTitle: reminderData.jobTitle,
      note: reminderData.note,
      emailTemplate: reminderData.emailTemplate
    })

    // Update reminder status
    await reminderDoc.ref.update({ sent: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending scheduled reminder:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
} 