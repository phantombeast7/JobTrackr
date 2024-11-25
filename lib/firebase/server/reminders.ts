import { adminDb } from './index'
import { Timestamp } from 'firebase-admin/firestore'
import type { Reminder } from '../reminders'

// Type for updating reminder status
export type UpdateReminderData = Pick<Reminder, 'id' | 'sent'>;

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
      sentAt: sent ? Timestamp.now() : null
    });
    return true;
  } catch (error) {
    console.error('Error updating reminder status:', error);
    throw error;
  }
}

export const deleteReminderServer = async (reminderId: string) => {
  try {
    await adminDb.collection('reminders').doc(reminderId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
}; 