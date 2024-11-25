'use client'
import { useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/styles/calendar.css'
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
import { Input } from '@/components/ui/input'
import { useToast } from "@/hooks/use-toast"
import { auth } from '@/lib/firebase'
import { getUserApplications } from '@/lib/firebase/applications'
import { createReminder, getUserReminders } from '@/lib/firebase/reminders'
import { useEffect } from 'react'
import { JobApplication } from '@/lib/firebase/applications'
import { Timestamp } from 'firebase/firestore'
import { Reminder } from '@/lib/firebase/reminders'

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('12:00')
  const [selectedCompany, setSelectedCompany] = useState<JobApplication | null>(null)
  const [note, setNote] = useState('')
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0);

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

  useEffect(() => {
    const fetchReminders = async () => {
      if (!auth.currentUser) return;
      try {
        setLoading(true);
        const userReminders = await getUserReminders();
        setReminders(userReminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
        const message = error instanceof Error ? error.message : 'Failed to load reminders';
        
        if (message.includes('Database is being set up')) {
          toast({
            title: 'Setting up database',
            description: 'Please wait while we set up the database. This may take a minute...',
            variant: 'default',
          });
          // Retry after 5 seconds, up to 3 times
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 5000);
          }
        } else {
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [toast, retryCount]);

  const handleSelectSlot = useCallback((slotInfo: any) => {
    setSelectedDate(slotInfo.start)
  }, [])

  const resetForm = () => {
    setNote('')
    setSelectedCompany(null)
    setSelectedTime('12:00')
  }

  const handleCreateReminder = async () => {
    if (!selectedCompany || !selectedDate || !selectedTime || !note || !auth.currentUser) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      setLoading(true)

      // Create a Date object with the selected date and time
      const [hours, minutes] = selectedTime.split(':')
      const scheduledDate = new Date(selectedDate)
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      // Check if the selected time is in the past
      if (scheduledDate < new Date()) {
        toast({
          title: 'Error',
          description: 'Cannot schedule reminders in the past',
          variant: 'destructive',
        })
        return
      }

      // Create the reminder data
      const reminderData = {
        companyId: selectedCompany.id || '',
        companyName: selectedCompany.companyName,
        jobTitle: selectedCompany.jobTitle || '',
        status: selectedCompany.status || 'Applied',
        note,
        scheduledFor: Timestamp.fromDate(scheduledDate)
      }

      // Add the reminder using the API
      await createReminder(reminderData)

      // Refresh reminders list
      const updatedReminders = await getUserReminders()
      setReminders(updatedReminders)

      toast({
        title: 'Success',
        description: `Reminder scheduled for ${scheduledDate.toLocaleString()}`,
        variant: 'default',
      })

      // Reset form
      resetForm()

    } catch (error) {
      console.error('Error creating reminder:', error)
      toast({
        title: 'Error',
        description: 'Failed to schedule reminder',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Set Reminders</CardTitle>
          <CardDescription>Schedule follow-ups for your applications</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-1 space-y-4">
            <div className="border rounded-lg p-4">
              <label className="text-sm font-medium mb-2 block">Select Date</label>
              <Calendar
                localizer={localizer}
                events={[]}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 400 }}
                onSelectSlot={handleSelectSlot}
                selectable
                defaultDate={selectedDate}
                defaultView="month"
                views={['month']}
                toolbar={true}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Selected Date</label>
              <p className="text-sm mt-1">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
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
                <SelectTrigger className="w-full text-white">
                  <SelectValue 
                    placeholder="Select a company" 
                    className="text-white"
                  />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((application) => (
                    <SelectItem 
                      key={application.id} 
                      value={application.id || ''}
                      className="text-white"
                    >
                      {application.companyName} - {application.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompany && (
              <div className="space-y-2">
                <p className="text-sm ">Position: {selectedCompany.jobTitle}</p>
                <p className="text-sm">Status: {selectedCompany.status}</p>
                <p className="text-sm  ">Applied: {selectedCompany.applicationDate}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Select Time</label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Add Note</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your reminder note..."
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleCreateReminder} 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={!selectedCompany || !note || !selectedTime || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Scheduling...
                </div>
              ) : (
                'Schedule Reminder'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Scheduled Reminders</CardTitle>
          <CardDescription>Your upcoming reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading reminders...
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Company</th>
                    <th className="p-2 text-left">Position</th>
                    <th className="p-2 text-left">Scheduled For</th>
                    <th className="p-2 text-left">Note</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((reminder) => {
                    // Convert the Firestore timestamp to a Date object
                    const scheduledDate = reminder.scheduledFor instanceof Timestamp 
                      ? reminder.scheduledFor.toDate() 
                      : new Date(reminder.scheduledFor);

                    return (
                      <tr key={reminder.id} className="border-b">
                        <td className="p-2">{reminder.companyName}</td>
                        <td className="p-2">{reminder.jobTitle}</td>
                        <td className="p-2">
                          {scheduledDate.toLocaleString()}
                        </td>
                        <td className="p-2">{reminder.note}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reminder.sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reminder.sent ? 'Sent' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {reminders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No reminders scheduled
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}