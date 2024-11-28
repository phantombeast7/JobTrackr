import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_SMTP_HOST,
  port: Number(process.env.AWS_SES_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASSWORD
  },
  debug: true
})

export const sendReminderEmail = async (
  to: string,
  reminder: {
    companyName: string
    jobTitle: string
    note: string
    emailTemplate?: string
  }
) => {
  try {
    console.log('[Email Service] Checking email configuration:')
    console.log('SMTP Host:', process.env.AWS_SES_SMTP_HOST)
    console.log('SMTP Port:', process.env.AWS_SES_SMTP_PORT)
    console.log('From Email:', process.env.AWS_SES_FROM_EMAIL)
    console.log('To Email:', to)

    if (!process.env.AWS_SES_FROM_EMAIL) {
      throw new Error('AWS_SES_FROM_EMAIL is not configured')
    }

    const mailOptions = {
      from: process.env.AWS_SES_FROM_EMAIL,
      to: to,
      subject: `JobTrackr: Follow-up for ${reminder.companyName} - ${reminder.jobTitle}`,
      text: `Hello,\n\nThis is a reminder to follow up with ${reminder.companyName} regarding your ${reminder.jobTitle} position.\n\nNote: ${reminder.note}\n\nBest regards,\nJobTrackr`,
      html: reminder.emailTemplate || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Job Application Follow-up Reminder</h2>
          <p>Hello,</p>
          <p>This is a reminder to follow up with <strong>${reminder.companyName}</strong> regarding your <strong>${reminder.jobTitle}</strong> position.</p>
          <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #333;">
            Note: ${reminder.note}
          </p>
          <p>Best regards,<br>JobTrackr</p>
        </div>
      `
    }

    console.log('[Email Service] Sending email with options:', mailOptions)

    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.error('[Email Service] SMTP Verification failed:', error)
          reject(error)
        } else {
          console.log('[Email Service] SMTP Server is ready to take our messages')
          resolve(success)
        }
      })
    })

    const info = await transporter.sendMail(mailOptions)
    console.log('[Email Service] Email sent successfully:', info)
    return info
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error)
    throw error
  }
}
 