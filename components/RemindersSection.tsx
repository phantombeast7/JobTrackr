'use client'
import { useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from "@/hooks/use-toast"
import { auth } from '@/lib/firebase'
import { getUserApplications } from '@/lib/firebase/applications'
import { useEffect } from 'react'
import { JobApplication } from '@/lib/firebase/applications'

const locales = {
  'en-US': require('date-fns/locale/en-US')
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function RemindersSection() {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedCompany, setSelectedCompany] = useState<JobApplication | null>(null)
  const [note, setNote] = useState('')
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch applications like in applications page
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const userApplications = await getUserApplications(user.uid)
        setApplications(userApplications)
      } catch (error) {
        console.error('Error fetching applications:', error)
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [toast])

  const handleSelectEvent = useCallback((event: any) => {
    // Handle event selection
    console.log(event)
  }, [])

  const handleSelectSlot = useCallback((slotInfo: any) => {
    // Handle slot selection
    setDate(slotInfo.start)
  }, [])

  const sendReminderEmail = async () => {
    if (!selectedCompany || !date || !note) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('https://api.testmail.app/api/json/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TESTMAIL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [`${process.env.NEXT_PUBLIC_TESTMAIL_NAMESPACE}@testmail.app`],
          subject: `Reminder: Follow-up for ${selectedCompany.companyName}`,
          text: `
            Company: ${selectedCompany.companyName}
            Position: ${selectedCompany.jobTitle}
            Status: ${selectedCompany.status}
            Date Applied: ${selectedCompany.applicationDate}
            Reminder Date: ${date.toLocaleDateString()}
            
            Note: ${note}
          `,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Reminder email has been scheduled',
        })
        setNote('')
        setSelectedCompany(null)
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule reminder',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Set Reminders</CardTitle>
          <CardDescription>Loading companies...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Set Reminders</CardTitle>
        <CardDescription>Schedule follow-ups for your applications</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <Calendar
            localizer={localizer}
            events={[]} // You can add events here
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            defaultDate={new Date()}
            defaultView="month"
          />
        </div>
        <div className="col-span-1 space-y-4">
          <div>
            <label className="text-sm font-medium">Select Company</label>
            <Select
              onValueChange={(value) => {
                const company = applications.find(app => app.id === value)
                setSelectedCompany(company || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((application) => (
                  <SelectItem key={application.id} value={application.id || ''}>
                    {application.companyName} - {application.jobTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany && (
            <div className="space-y-2">
              <p className="text-sm">Position: {selectedCompany.jobTitle}</p>
              <p className="text-sm">Status: {selectedCompany.status}</p>
              <p className="text-sm">Applied: {selectedCompany.applicationDate}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Add Note</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your reminder note..."
              className="mt-1"
            />
          </div>

          <Button onClick={sendReminderEmail} className="w-full">
            Set Reminder
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}