'use client'
import { RemindersSection } from '@/components/RemindersSection'

export default function RemindersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Reminders</h1>
      <RemindersSection />
    </div>
  )
} 