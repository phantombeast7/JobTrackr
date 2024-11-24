import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, title, date, type } = await request.json()

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const response = await resend.emails.send({
      from: 'JobTrackr <notifications@jobtrackr.com>',
      to: email,
      subject: `Reminder: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reminder: ${title}</h2>
          <p>You have a ${type} scheduled for ${formattedDate}</p>
          <p>Don't forget to prepare and be on time!</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              This is an automated reminder from JobTrackr
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending reminder email:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder email' },
      { status: 500 }
    )
  }
} 