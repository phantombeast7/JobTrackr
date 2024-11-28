import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { auth } from '@/lib/firebase'

export interface Reminder {
  id?: string
  title: string
  description: string
  userId: string
  companyId: string
  companyName: string
  jobTitle: string
  status: string
  note: string
  scheduledFor: string
  createdAt?: Date
  sent?: boolean
  sentAt?: Date
  userEmail?: string | null
  timezone?: string
}

export interface CreateReminderData {
  companyId: string
  companyName: string
  jobTitle: string
  status: string
  note: string
  scheduledFor: string
  title: string
  description: string
}

export const getUserReminders = async () => {
  try {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/api/reminders/get', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 503) {
      // Index is being created
      throw new Error('Database is being set up. Please wait a moment and try again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error(errorData.error || 'Failed to fetch reminders');
    }

    const reminders = await response.json();
    return reminders;
  } catch (error) {
    console.error('Error getting reminders:', error);
    throw error;
  }
}

export const createReminder = async (reminderData: CreateReminderData) => {
  try {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/api/reminders/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reminderData)
    });

    if (!response.ok) {
      throw new Error('Failed to create reminder');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
}

export const deleteReminder = async (reminderId: string): Promise<void> => {
  if (!reminderId) {
    throw new Error('Reminder ID is required');
  }
  
  try {
    const reminderRef = doc(db, 'reminders', reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
}; 