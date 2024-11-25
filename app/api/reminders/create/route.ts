import { NextResponse } from 'next/server'
import { addReminderServer, updateReminderStatusServer } from '@/lib/firebase/server/reminders'
import { adminAuth } from '@/lib/firebase/server'
import { sendReminderEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Get reminder data from request body
    const reminderData = await request.json();
    const scheduledDate = new Date(reminderData.scheduledFor);

    // Add user information to reminder data
    const reminderWithUser = {
      ...reminderData,
      userId,
      userEmail,
      sent: false
    };

    // Add reminder to Firebase
    const newReminder = await addReminderServer(reminderWithUser);

    try {
      console.log('Attempting to send email immediately...');
      console.log('User Email:', userEmail);
      console.log('Reminder Details:', {
        companyName: reminderData.companyName,
        jobTitle: reminderData.jobTitle,
        scheduledFor: scheduledDate,
        status: reminderData.status,
        applicationDate: reminderData.applicationDate
      });

      // Send email immediately
      await sendReminderEmail(
        userEmail,
        `Reminder: Follow-up for ${reminderData.companyName}`,
        {
          companyName: reminderData.companyName,
          jobTitle: reminderData.jobTitle,
          note: reminderData.note,
          scheduledFor: scheduledDate,
          status: reminderData.status,
          applicationDate: reminderData.applicationDate
        }
      );

      // Update reminder status to sent
      await updateReminderStatusServer(newReminder.id, true);
      console.log('Email sent and reminder status updated successfully');

    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Log detailed error information
      if (emailError instanceof Error) {
        console.error('Error details:', {
          message: emailError.message,
          stack: emailError.stack,
          name: emailError.name
        });
      }
    }

    return NextResponse.json(newReminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

// Remove this line
// export const runtime = 'edge'; 