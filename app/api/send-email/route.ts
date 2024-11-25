import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create a transporter using AWS SES SMTP
const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_SMTP_USER,
    pass: process.env.AWS_SES_SMTP_PASSWORD
  },
  debug: true
})

export async function POST(request: Request) {
  console.log('Email sending attempt started')
  try {
    const data = await request.json()
    const { userEmail, companyName, position, status, applicationDate, reminderDate, note } = data

    console.log('Received data:', { userEmail, companyName, position, status, applicationDate, reminderDate })

    // Verify that we're using verified email addresses
    const verifiedSenderEmail = 'nabinupadhaya215@gmail.com' // Your verified sender email in AWS SES
    const verifiedRecipientEmail = 'nabinupadhaya215@gmail.com' // Your verified recipient email in AWS SES

    const emailContent = `
Dear User,

This is a reminder for your job application follow-up:

Company Details:
---------------
Company Name: ${companyName}
Position: ${position}
Current Status: ${status}
Application Date: ${applicationDate}

Reminder Details:
----------------
Scheduled for: ${reminderDate}

Your Note:
----------
${note}

Best regards,
JobTrackr Team`

    // Send email using AWS SES with verified addresses
    const mailOptions = {
      from: verifiedSenderEmail,
      to: verifiedRecipientEmail, // Using verified recipient email instead of user's email for now
      subject: `JobTrackr: ${companyName} Follow-up Reminder`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    }

    console.log('Attempting to send email with options:', mailOptions)

    await transporter.sendMail(mailOptions)

    console.log('Email sent successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully'
    })
  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error.message 
      },
      { status: 500 }
    )
  }
} 