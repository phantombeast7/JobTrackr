'use client'
import { useState, useCallback, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format } from 'date-fns'
import { parse } from 'date-fns/parse'
import { startOfWeek } from 'date-fns/startOfWeek'
import { getDay } from 'date-fns/getDay'
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
import { Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from "@/lib/utils"

interface FirebaseTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

interface ReminderType extends Omit<Reminder, 'scheduledFor'> {
  scheduledFor: string;
}

interface CreateReminderData {
  companyId: string;
  companyName: string;
  jobTitle: string;
  status: string;
  note: string;
  scheduledFor: string;
  title: string;
  description: string;
}

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
const formatDate = (date: string | Date): string => {
  try {
    if (typeof date === 'string') {
      return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }
    if (date instanceof Date) {
      return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }
    return 'Invalid Date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
  return (
    <div className="relative flex items-center gap-2 rounded-lg border p-3 shadow-sm">
      <div className="flex flex-1 items-center gap-2">
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium">{reminder.companyName}</span>
          <span className="text-xs text-gray-500">{reminder.note}</span>
        </div>
      </div>
      <button
        className="rounded-lg border p-1 hover:bg-gray-100"
        onClick={() => {/* ... */}}
      >
        <Trash2 className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  )
}

export function RemindersSection() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('12:00')
  const [selectedCompany, setSelectedCompany] = useState<JobApplication | null>(null)
  const [note, setNote] = useState<string>('')
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [reminders, setReminders] = useState<ReminderType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0);
  const [deletingReminders, setDeletingReminders] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());

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
            })) as ReminderType[];
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
    if (!selectedCompany || !selectedDate || !selectedTime || !note.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields including the note',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      // Ensure we're working with IST
      const istDate = new Date(scheduledDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

      if (istDate < new Date()) {
        toast({
          title: 'Error',
          description: 'Cannot schedule reminders in the past',
          variant: 'destructive',
        });
        return;
      }

      const reminderData: CreateReminderData = {
        companyId: selectedCompany.id || '',
        companyName: selectedCompany.companyName,
        jobTitle: selectedCompany.jobTitle || '',
        status: selectedCompany.status || 'Applied',
        note: note.trim(),
        scheduledFor: istDate.toISOString(),
        title: `Follow-up with ${selectedCompany.companyName}`,
        description: note.trim()
      };

      console.log('Creating reminder with data:', reminderData);

      const response = await createReminder(reminderData);
      console.log('Reminder created:', response);

      toast({
        title: 'Success',
        description: `Reminder scheduled for ${istDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
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
    }
  }, [selectedCompany, selectedDate, selectedTime, note, toast, resetForm]);

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

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <Card className="col-span-1 bg-black border border-[#1a1a1a] transition-colors overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transition-opacity" />
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-white">Calendar</CardTitle>
            <CardDescription>Schedule and track your follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-[#1a1a1a] border-[#333333]">
              <Calendar
                localizer={localizer}
                events={reminders.map(reminder => {
                  const date = new Date(reminder.scheduledFor);
                  return {
                    title: `${reminder.companyName} - ${reminder.note}`,
                    start: date,
                    end: date,
                    reminder: reminder
                  };
                })}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectSlot={handleSelectSlot}
                selectable
                date={selectedDate}
                onNavigate={(date) => setSelectedDate(date)}
                defaultView="month"
                views={['month']}
                className="reminder-calendar"
                components={{
                  toolbar: (props) => (
                    <div className="rbc-toolbar">
                      <span className="rbc-btn-group flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => props.onNavigate('PREV')}
                          className="hover:bg-[#262626] text-white p-2 rounded-lg transition-colors relative z-10"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => props.onNavigate('TODAY')}
                          className="hover:bg-[#262626] text-white px-4 py-2 rounded-lg transition-colors relative z-10"
                        >
                          Today
                        </button>
                        <button 
                          type="button" 
                          onClick={() => props.onNavigate('NEXT')}
                          className="hover:bg-[#262626] text-white p-2 rounded-lg transition-colors relative z-10"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </span>
                      <span className="rbc-toolbar-label relative z-10">{props.label}</span>
                    </div>
                  )
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Form Section */}
        <Card className="col-span-1 bg-black border border-[#1a1a1a] transition-colors overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" 
               style={{ pointerEvents: 'none' }} />
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-white">Set Reminder</CardTitle>
            <CardDescription>Schedule a new follow-up reminder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Company</Label>
              <Select
                onValueChange={(value) => {
                  const company = applications.find(app => app.id === value)
                  setSelectedCompany(company || null)
                }}
                value={selectedCompany?.id}
              >
                <SelectTrigger className="w-full bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#262626] cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <SelectValue placeholder="Select a company" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                  {applications.map((application) => (
                    <SelectItem 
                      key={application.id} 
                      value={application.id || ''}
                      className="text-white cursor-pointer hover:bg-[#262626]"
                    >
                      {application.companyName} - {application.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCompany && (
              <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#333333] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Position</span>
                  <span className="text-sm text-white">{selectedCompany.jobTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Status</span>
                  <StatusBadge status={selectedCompany.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Applied</span>
                  <span className="text-sm text-white">{selectedCompany.applicationDate}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Reminder Date & Time</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="w-full bg-[#1a1a1a] border-[#333333] text-white cursor-pointer hover:border-[#404040] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="relative">
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-[#1a1a1a] border-[#333333] text-white cursor-pointer hover:border-[#404040] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your reminder note..."
                className="min-h-[100px] w-full resize-y rounded-md border border-[#333333] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pointer-events-auto"
                style={{ 
                  zIndex: 10,
                  position: 'relative',
                  pointerEvents: 'auto'
                }}
              />
              <p className="text-xs text-gray-400 mt-1">
                {note.length} characters
              </p>
            </div>

            <Button 
              onClick={handleCreateReminder}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
              disabled={!selectedCompany || !note || !selectedTime || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Scheduling...</span>
                </div>
              ) : (
                'Schedule Reminder'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card className="bg-black border border-[#1a1a1a] transition-colors overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 transition-opacity" />
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg sm:text-xl text-white">Scheduled Reminders</CardTitle>
              <CardDescription>Your upcoming follow-ups</CardDescription>
            </div>
            <Select
              defaultValue="all"
              onValueChange={(value) => {
                // Add filter functionality here
              }}
            >
              <SelectTrigger className="w-[150px] bg-[#1a1a1a] border-[#333333] text-white">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333333]">
                <SelectItem value="all">All Reminders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#333333]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-400">Loading reminders...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#1a1a1a]">
                  <TableRow>
                    <TableHead className="text-left text-white">Company</TableHead>
                    <TableHead className="text-left text-white">Position</TableHead>
                    <TableHead className="text-left text-white">Scheduled For</TableHead>
                    <TableHead className="text-left text-white">Note</TableHead>
                    <TableHead className="text-left text-white">Status</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <CalendarIcon className="h-12 w-12 mb-2 opacity-50" />
                          <p>No reminders scheduled</p>
                          <p className="text-sm">Set up your first reminder above</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reminders.map((reminder) => (
                      <TableRow 
                        key={reminder.id}
                        className="group hover:bg-[#1a1a1a] transition-colors"
                      >
                        <TableCell className="font-medium text-white">
                          {reminder.companyName}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {reminder.jobTitle}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatDate(reminder.scheduledFor)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {reminder.note}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reminder.sent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {reminder.sent ? 'Sent' : 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteReminder(reminder.id!)}
                            className="hover:bg-red-500/10 hover:text-red-500"
                            disabled={deletingReminders.has(reminder.id!)}
                          >
                            {deletingReminders.has(reminder.id!) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}