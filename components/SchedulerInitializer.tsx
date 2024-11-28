'use client'

import { useEffect } from 'react'

export function SchedulerInitializer() {
  useEffect(() => {
    // Initialize the scheduler
    fetch('/api/init').then(res => {
      if (!res.ok) {
        console.error('Failed to initialize scheduler')
      }
    })
  }, [])

  return null
} 