'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateApplication, type JobApplication } from '@/lib/firebase/applications'

interface EditApplicationModalProps {
  application: JobApplication
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function EditApplicationModal({ 
  application, 
  isOpen, 
  onClose, 
  onUpdate 
}: EditApplicationModalProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      
      const updates: Partial<JobApplication> = {
        status: formData.get('status') as JobApplication['status'],
        salary: Number(formData.get('salary')) || undefined,
        notes: formData.get('notes') as string,
        location: formData.get('location') as string,
        // Add history entry
        history: [
          ...(application.history || []),
          {
            date: new Date().toISOString(),
            change: `Status changed from ${application.status} to ${formData.get('status')}`,
            previousStatus: application.status,
            newStatus: formData.get('status') as JobApplication['status']
          }
        ]
      }

      await updateApplication(application.id!, updates)
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating application:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name (read-only) */}
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={application.companyName}
              disabled
              className="bg-gray-700 opacity-50"
            />
          </div>

          {/* Job Title (read-only) */}
          <div className="space-y-2">
            <Label>Position</Label>
            <Input
              value={application.jobTitle}
              disabled
              className="bg-gray-700 opacity-50"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={application.status}>
              <SelectTrigger className="bg-gray-700">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interviewing">Interviewing</SelectItem>
                <SelectItem value="Offered">Offered</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={application.location}
              className="bg-gray-700"
            />
          </div>

          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              defaultValue={application.salary}
              className="bg-gray-700"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={application.notes}
              className="bg-gray-700 min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900"
          >
            {loading ? 'Updating...' : 'Update Application'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 