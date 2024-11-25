import { NextResponse } from 'next/server'
import { addReminderServer } from '@/lib/firebase/server/reminders'
import { adminAuth } from '@/lib/firebase/server'

export async function POST(request: Request) {
  try {
    // Get the authorization token from headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user info
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

    // Schedule the email
    const timeUntilReminder = scheduledDate.getTime() - Date.now();
    if (timeUntilReminder > 0) {
      // Schedule the email sending
      const scheduledTime = new Date(scheduledDate).toISOString();
      
      // Use Edge Runtime for long-running tasks
      const response = await fetch(new URL('/api/reminders/send', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_SECRET_KEY}`
        },
        body: JSON.stringify({
          reminderId: newReminder.id,
          userEmail,
          reminderDetails: {
            companyName: reminderData.companyName,
            jobTitle: reminderData.jobTitle,
            note: reminderData.note,
            scheduledFor: scheduledDate
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to schedule reminder email');
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