import { NextResponse } from 'next/server';

const TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY;
const TESTMAIL_NAMESPACE = process.env.TESTMAIL_NAMESPACE;

export async function POST(request: Request) {
  try {
    const { title, date, email, company } = await request.json();

    // Format the email content
    const emailContent = `
      Dear User,
      
      This is a reminder for your job application at ${company}.
      
      Details:
      - Company: ${company}
      - Reminder: ${title}
      - Date: ${new Date(date).toLocaleString()}
      
      Best regards,
      JobTrackr Team
    `;

    // Send email using TestMail.app REST API
    const response = await fetch('https://api.testmail.app/api/json/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TESTMAIL_API_KEY}`
      },
      body: JSON.stringify({
        to: email,
        subject: 'Reminder from JobTrackr',
        text: emailContent,
        from: `jobtrackr.${TESTMAIL_NAMESPACE}@testmail.app`,
        schedule: new Date(date).toISOString()
      })
    });

    const result = await response.json();

    return NextResponse.json({
      id: result.id,
      title,
      date,
      email,
      company
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
} 