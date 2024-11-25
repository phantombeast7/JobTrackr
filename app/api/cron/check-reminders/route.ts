import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore'
import nodemailer from 'nodemailer'
import { Reminder } from '@/lib/firebase/reminders'

const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_SMTP_USER,
    pass: process.env.AWS_SES_SMTP_PASSWORD
  }
})

export async function GET() {
  try {
    const now = Timestamp.now()
    const remindersRef = collection(db, 'reminders')
    
    const q = query(
      remindersRef,
      where('sent', '==', false),
      where('scheduledFor', '<=', now)
    )

    const querySnapshot = await getDocs(q)
    const dueReminders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Reminder[]

    for (const reminder of dueReminders) {
      if (!reminder.id) continue;

      try {
        if (!reminder.userEmail) {
          console.error(`No user email found for reminder ${reminder.id}`)
          continue
        }

        // Send email using user's email from the reminder
        await transporter.sendMail({
          from: process.env.AWS_SES_FROM_EMAIL,
          to: reminder.userEmail, // Use the stored user email
          subject: `JobTrackr: Follow-up Reminder for ${reminder.companyName}`,
          text: `
Dear User,

This is your scheduled reminder for job application follow-up:

Company Details:
---------------
Company Name: ${reminder.companyName}
Position: ${reminder.jobTitle}
Status: ${reminder.status}

Your Note:
----------
${reminder.note}

Best regards,
JobTrackr Team
          `.trim(),
        })

        const reminderDocRef = doc(remindersRef, reminder.id)
        await updateDoc(reminderDocRef, { sent: true })

      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      processedCount: dueReminders.length 
    })
  } catch (error) {
    console.error('Failed to check reminders:', error)
    return NextResponse.json({ error: 'Failed to check reminders' }, { status: 500 })
  }
} 