import { db } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { sendReminderEmail } from './email'
import { Reminder } from '@/types/reminder'

function getISTTime(date: Date): string {
  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
}

function parseScheduledTime(scheduledFor: any): Date {
  try {
    // Handle Firestore Timestamp
    if (scheduledFor && typeof scheduledFor === 'object' && 'seconds' in scheduledFor) {
      return new Timestamp(scheduledFor.seconds, scheduledFor.nanoseconds || 0).toDate()
    }
    // Handle ISO string
    if (typeof scheduledFor === 'string') {
      return new Date(scheduledFor)
    }
    // Handle Date object
    if (scheduledFor instanceof Date) {
      return scheduledFor
    }
    console.error('Unhandled scheduledFor format:', scheduledFor)
    return new Date(0)
  } catch (error) {
    console.error('Error parsing scheduled time:', error, scheduledFor)
    return new Date(0)
  }
}

export function initializeScheduler() {
  // Check for reminders every minute
  setInterval(async () => {
    try {
      // Get current time in IST
      const now = new Date()
      const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))

      console.log(`[Scheduler] Current IST time: ${getISTTime(istNow)}`)
      
      // Get all unsent reminders
      const remindersSnapshot = await db
        .collection('reminders')
        .where('sent', '==', false)
        .get()

      console.log(`[Scheduler] Found ${remindersSnapshot.size} unsent reminders`)

      for (const doc of remindersSnapshot.docs) {
        try {
          const reminder = doc.data() as Reminder

          if (!reminder.scheduledFor) {
            console.error(`Missing scheduledFor for reminder ${doc.id}`)
            continue
          }

          // Parse the scheduled time
          const scheduledTime = parseScheduledTime(reminder.scheduledFor)
          
          if (isNaN(scheduledTime.getTime())) {
            console.error(`Invalid scheduled time for reminder ${doc.id}:`, reminder.scheduledFor)
            continue
          }

          // Convert to IST for comparison
          const scheduledIST = new Date(scheduledTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))

          console.log(`[Scheduler] Checking reminder ${doc.id}:`)
          console.log(`Raw scheduledFor:`, reminder.scheduledFor)
          console.log(`Parsed scheduledTime:`, scheduledTime)
          console.log(`Scheduled for IST: ${getISTTime(scheduledIST)}`)
          console.log(`Current IST: ${getISTTime(istNow)}`)

          // Check if it's time to send the reminder
          if (scheduledIST <= istNow) {
            console.log(`[Scheduler] Time to send reminder ${doc.id}`)
            
            if (!reminder.userEmail) {
              console.error(`No email found for reminder ${doc.id}`)
              continue
            }

            try {
              // Send the email
              await sendReminderEmail(reminder.userEmail, {
                companyName: reminder.companyName,
                jobTitle: reminder.jobTitle,
                note: reminder.note
              })

              // Mark as sent
              await doc.ref.update({ 
                sent: true,
                sentAt: Timestamp.now()
              })
              
              console.log(`[Scheduler] Successfully sent reminder ${doc.id} to ${reminder.userEmail} at ${getISTTime(istNow)}`)
            } catch (emailError) {
              console.error(`[Scheduler] Failed to send email for reminder ${doc.id}:`, emailError)
            }
          } else {
            console.log(`[Scheduler] Not yet time to send reminder ${doc.id}`)
          }
        } catch (error) {
          console.error(`[Scheduler] Error processing reminder ${doc.id}:`, error)
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error in scheduler:', error)
    }
  }, 60000) // Check every minute
} 