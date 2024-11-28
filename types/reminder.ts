import { Timestamp } from 'firebase/firestore'

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
  createdAt?: Timestamp
  sent?: boolean
  sentAt?: Timestamp
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