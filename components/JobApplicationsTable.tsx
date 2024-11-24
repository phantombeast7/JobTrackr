'use client'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, FileText, Flag } from 'lucide-react'
import { JobApplication, toggleReportApplication } from '@/lib/firebase/applications'
import { EditApplicationModal } from './EditApplicationModal'
import { ResumeViewerModal } from './ResumeViewerModal'

interface JobApplicationsTableProps {
  applications: JobApplication[]
  onUpdate?: () => void
}

export const JobApplicationsTable = ({ applications, onUpdate }: JobApplicationsTableProps) => {
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [viewingResume, setViewingResume] = useState<string | null>(null)

  const handleUpdate = () => {
    onUpdate?.()
  }

  const handleReport = async (applicationId: string, currentlyReported: boolean) => {
    try {
      await toggleReportApplication(applicationId, !currentlyReported)
      handleUpdate()
    } catch (error) {
      console.error('Error reporting application:', error)
    }
  }

  const handleViewResume = (resumeUrl: string | undefined) => {
    if (resumeUrl) {
      setViewingResume(resumeUrl)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Applied</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow 
              key={application.id}
              className={application.reported ? 'bg-red-500/10' : ''}
            >
              <TableCell className="font-medium text-white">{application.companyName}</TableCell>
              <TableCell className="text-gray-200">{application.jobTitle}</TableCell>
              <TableCell>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  application.status === 'Applied' ? 'bg-emerald-500/20 text-emerald-400' :
                  application.status === 'Interviewing' ? 'bg-blue-500/20 text-blue-400' :
                  application.status === 'Offered' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {application.status}
                </span>
              </TableCell>
              <TableCell className="text-gray-200">
                {new Date(application.applicationDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-gray-200">
                {application.salary ? 
                  new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    maximumFractionDigits: 0 
                  }).format(application.salary) 
                  : '-'
                }
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingApplication(application)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {application.resumeUrl && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewResume(application.resumeUrl)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => application.id && handleReport(application.id, !!application.reported)}
                    className={application.reported ? 'text-red-500' : ''}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          isOpen={true}
          onClose={() => setEditingApplication(null)}
          onUpdate={handleUpdate}
        />
      )}

      {viewingResume && (
        <ResumeViewerModal
          resumeUrl={viewingResume}
          isOpen={true}
          onClose={() => setViewingResume(null)}
        />
      )}
    </>
  )
} 