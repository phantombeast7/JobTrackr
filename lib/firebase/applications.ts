import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'

export interface ApplicationHistory {
  date: string;
  change: string;
  previousStatus: string;
  newStatus: string;
}

export interface JobApplication {
  id?: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';
  applicationDate: string;
  salary?: number;
  notes?: string;
  resumeUrl?: string;
  location?: string;
  history?: ApplicationHistory[];
  reported?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const addApplication = async (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = new Date().toISOString()
    const application = {
      ...applicationData,
      createdAt: now,
      updatedAt: now,
      history: [{
        date: now,
        change: 'Application created',
        previousStatus: '',
        newStatus: applicationData.status
      }]
    }

    const docRef = await addDoc(collection(db, 'applications'), application)
    return { id: docRef.id, ...application }
  } catch (error) {
    console.error('Error adding application:', error)
    throw error
  }
}

export const getUserApplications = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JobApplication[]
  } catch (error) {
    console.error('Error getting applications:', error)
    throw error
  }
}

export const updateApplication = async (id: string, data: Partial<JobApplication>) => {
  try {
    const docRef = doc(db, 'applications', id)
    await updateDoc(docRef, data)
  } catch (error) {
    console.error('Error updating application:', error)
    throw error
  }
}

export const deleteApplication = async (id: string) => {
  try {
    const docRef = doc(db, 'applications', id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting application:', error)
    throw error
  }
}

export const toggleReportApplication = async (id: string, reported: boolean) => {
  try {
    const docRef = doc(db, 'applications', id)
    await updateDoc(docRef, { reported })
  } catch (error) {
    console.error('Error toggling report:', error)
    throw error
  }
} 