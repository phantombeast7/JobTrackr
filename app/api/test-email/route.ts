import { NextResponse } from 'next/server';
import { sendReminderEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    // Get the email from query parameter or use a default
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email') || 'your-email@example.com';

    console.log(`Sending test email to: ${testEmail}`);

    await sendReminderEmail(testEmail, {
      companyName: 'Test Company',
      jobTitle: 'Test Position',
      note: 'This is a test reminder sent at ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    return NextResponse.json({ 
      status: 'success',
      message: `Test email sent to ${testEmail}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    console.error('Test email failed:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to send test email'
    }, { 
      status: 500 
    });
  }
} 