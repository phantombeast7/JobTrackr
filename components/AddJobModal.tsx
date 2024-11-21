'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addApplication } from '@/lib/firebase/applications'
import { auth } from '@/lib/firebase'
import { Plus } from 'lucide-react'

export function AddJobModal({ onApplicationAdded }: { onApplicationAdded: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await addApplication({
        userId: auth.currentUser.uid,
        companyName: formData.get('companyName') as string,
        jobTitle: formData.get('jobTitle') as string,
        status: 'Applied',
        applicationDate: new Date().toISOString(),
        salary: Number(formData.get('salary')) || undefined,
        location: formData.get('location') as string,
        notes: formData.get('notes') as string,
      })
      
      onApplicationAdded()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error adding application:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              required
              className="bg-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              required
              className="bg-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary (Optional)</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              className="bg-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              className="bg-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              className="bg-gray-700"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding...' : 'Add Application'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 