import { adminDb } from './index'
import { Timestamp } from 'firebase-admin/firestore'
import type { Reminder } from '../reminders'

export const addReminderServer = async (
  reminderData: Omit<Reminder, 'id' | 'createdAt' | 'sent'>
) => {
  try {
    const now = Timestamp.now()
    const reminder = {
      ...reminderData,
      createdAt: now,
      sent: false
    }

    const docRef = await adminDb.collection('reminders').add(reminder)
    
    return { 
      id: docRef.id, 
      ...reminder 
    }
  } catch (error) {
    console.error('Error adding reminder:', error)
    throw error
  }
}

export const updateReminderStatusServer = async (reminderId: string, sent: boolean) => {
  try {
    await adminDb.collection('reminders').doc(reminderId).update({
      sent,
      sentAt: sent ? new Date() : null
    });
    return true;
  } catch (error) {
    console.error('Error updating reminder status:', error);
    throw error;
  }
} 