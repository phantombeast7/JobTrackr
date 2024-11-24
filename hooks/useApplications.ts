'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'

interface Application {
  id: string
  companyName: string
  position: string
  status: string
  dateApplied: Timestamp
  userId: string
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const fetchApplications = async () => {
      // Wait for auth to initialize
      if (authLoading) return

      // Check if user is authenticated
      if (!user) {
        setLoading(false)
        setError('No authenticated user')
        return
      }

      try {
        const applicationsRef = collection(db, 'applications')
        const q = query(
          applicationsRef,
          where('userId', '==', user.uid),
          orderBy('dateApplied', 'desc')
        )
        const querySnapshot = await getDocs(q)
        const fetchedApplications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          companyName: doc.data().companyName || '',
          position: doc.data().position || '',
          status: doc.data().status || '',
          dateApplied: doc.data().dateApplied,
          userId: doc.data().userId,
        }))
        setApplications(fetchedApplications)
        setError(null)
      } catch (error) {
        console.error('Error fetching applications:', error)
        setError('Failed to fetch applications')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [user, authLoading]) // Add dependencies

  return { applications, loading: loading || authLoading, error }
} 