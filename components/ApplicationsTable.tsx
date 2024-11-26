'use client'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, FileText, Flag } from 'lucide-react'
import { JobApplication, toggleReportApplication } from '@/lib/firebase/applications'
import { EditApplicationModal } from './EditApplicationModal'
import { ResumeViewerModal } from './ResumeViewerModal'
import { StatusBadge } from './StatusBadge'
import { ActionButton } from './ActionButton'
import { cn } from '@/lib/utils'

interface ApplicationsTableProps {
  applications: JobApplication[]
  onUpdate: () => void
  loading: boolean
}

// Add utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatSalary = (salary?: number) => {
  if (!salary) return '-'
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(salary)
}

export function ApplicationsTable({ applications, onUpdate, loading }: ApplicationsTableProps) {
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [viewingResume, setViewingResume] = useState<string | null>(null)

  const handleReport = async (applicationId: string, currentlyReported: boolean) => {
    try {
      await toggleReportApplication(applicationId, !currentlyReported)
      onUpdate()
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
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-[#1a1a1a]">
            <TableRow>
              <TableHead className="text-white font-medium">Company</TableHead>
              <TableHead className="text-white font-medium">Position</TableHead>
              <TableHead className="text-white font-medium">Status</TableHead>
              <TableHead className="text-white font-medium">Date Applied</TableHead>
              <TableHead className="text-white font-medium">Salary</TableHead>
              <TableHead className="text-right text-white font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow 
                key={application.id}
                className="group hover:bg-[#1a1a1a] transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {application.companyName.charAt(0)}
                    </div>
                    <span className="text-white">{application.companyName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-300">{application.jobTitle}</TableCell>
                <TableCell>
                  <StatusBadge status={application.status} />
                </TableCell>
                <TableCell className="text-gray-300">
                  {formatDate(application.applicationDate)}
                </TableCell>
                <TableCell className="text-gray-300">
                  {formatSalary(application.salary)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionButton
                      icon={<Edit2 />}
                      onClick={() => setEditingApplication(application)}
                      tooltip="Edit"
                    />
                    {application.resumeUrl && (
                      <ActionButton
                        icon={<FileText />}
                        onClick={() => handleViewResume(application.resumeUrl)}
                        tooltip="View Resume"
                      />
                    )}
                    <ActionButton
                      icon={<Flag />}
                      onClick={() => handleReport(application.id!, !!application.reported)}
                      className={application.reported ? 'text-red-500' : ''}
                      tooltip={application.reported ? 'Unreport' : 'Report'}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          isOpen={true}
          onClose={() => setEditingApplication(null)}
          onUpdate={onUpdate}
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