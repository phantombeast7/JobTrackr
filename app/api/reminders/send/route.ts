import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';
import { sendReminderEmail } from '@/lib/email';
import { updateReminderStatusServer } from '@/lib/firebase/server/reminders';

export async function POST(request: Request) {
  try {
    // Verify the request is from our server using the secret key
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If authorized, proceed with sending email...
    const { reminderId, userEmail, reminderDetails } = await request.json();

    // Send the email
    await sendReminderEmail(
      userEmail,
      `Reminder: Follow-up for ${reminderDetails.companyName}`,
      reminderDetails
    );

    // Update reminder status
    await updateReminderStatusServer(reminderId, true);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
} 