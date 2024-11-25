'use client'
import { useState, useCallback, useEffect } from 'react'
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
import { JobApplication } from '@/lib/firebase/applications'
import { Timestamp } from 'firebase/firestore'
import { Reminder } from '@/lib/firebase/reminders'
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2 } from 'lucide-react';
import { deleteReminder } from '@/lib/firebase/reminders';

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

// Helper function to format date
const formatDate = (date: Date | Timestamp | any): string => {
  try {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleString();
    }
    if (date?.seconds) { // Handle Firestore timestamp object
      return new Timestamp(date.seconds, date.nanoseconds).toDate().toLocaleString();
    }
    if (date instanceof Date) {
      return date.toLocaleString();
    }
    return 'Invalid Date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

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
  const [deletingReminders, setDeletingReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch applications
        const userApplications = await getUserApplications(user.uid);
        setApplications(userApplications);

        // Set up reminders listener
        const remindersRef = collection(db, 'reminders');
        const remindersQuery = query(
          remindersRef,
          where('userId', '==', user.uid),
          orderBy('scheduledFor', 'desc')
        );

        const remindersUnsubscribe = onSnapshot(remindersQuery, 
          (snapshot) => {
            const updatedReminders = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Reminder[];
            setReminders(updatedReminders);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching reminders:', error);
            toast({
              title: 'Error',
              description: 'Failed to load reminders',
              variant: 'destructive',
            });
            setLoading(false);
          }
        );

        return () => remindersUnsubscribe();
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive',
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const handleSelectSlot = useCallback((slotInfo: any) => {
    setSelectedDate(slotInfo.start);
  }, []);

  const resetForm = useCallback(() => {
    setNote('');
    setSelectedCompany(null);
    setSelectedTime('12:00');
  }, []);

  const handleCreateReminder = useCallback(async () => {
    if (!selectedCompany || !selectedDate || !selectedTime || !note || !auth.currentUser) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      const [hours, minutes] = selectedTime.split(':');
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (scheduledDate < new Date()) {
        toast({
          title: 'Error',
          description: 'Cannot schedule reminders in the past',
          variant: 'destructive',
        });
        return;
      }

      const reminderData = {
        companyId: selectedCompany.id || '',
        companyName: selectedCompany.companyName,
        jobTitle: selectedCompany.jobTitle || '',
        status: selectedCompany.status || 'Applied',
        note,
        scheduledFor: Timestamp.fromDate(scheduledDate)
      };

      await createReminder(reminderData);

      toast({
        title: 'Success',
        description: `Reminder scheduled for ${scheduledDate.toLocaleString()}`,
        variant: 'default',
      });

      resetForm();
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule reminder',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  }, [
    selectedCompany,
    selectedDate,
    selectedTime,
    note,
    toast,
    resetForm
  ]);

  const handleDeleteReminder = async (reminderId: string) => {
    if (!reminderId) return;
    
    try {
      setDeletingReminders(prev => new Set(prev).add(reminderId));
      
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      // Delete directly using the Firebase function
      await deleteReminder(reminderId);

      toast({
        title: 'Success',
        description: 'Reminder deleted successfully',
        variant: 'default',
      });

    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete reminder',
        variant: 'destructive',
      });
    } finally {
      setDeletingReminders(prev => {
        const next = new Set(prev);
        next.delete(reminderId);
        return next;
      });
    }
  };

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
                    return (
                      <tr key={reminder.id} className="border-b">
                        <td className="p-2">{reminder.companyName}</td>
                        <td className="p-2">{reminder.jobTitle}</td>
                        <td className="p-2">
                          {formatDate(reminder.scheduledFor)}
                        </td>
                        <td className="p-2">{reminder.note}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              reminder.sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reminder.sent ? 'Sent' : 'Pending'}
                            </span>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id!)}
                              className="p-1 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                              title="Delete reminder"
                              disabled={deletingReminders.has(reminder.id!)}
                            >
                              {deletingReminders.has(reminder.id!) ? (
                                <div className="animate-spin h-4 w-4">
                                  <svg 
                                    className="h-4 w-4 text-red-500" 
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
                                </div>
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                          </div>
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