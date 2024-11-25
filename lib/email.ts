import nodemailer from 'nodemailer';

// Create the transporter with Amazon's recommended configuration
const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_SMTP_HOST,
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.AWS_SES_USER!,
    pass: process.env.AWS_SES_PASSWORD!
  }
});

// Remove the previous configuration checks and simplify the email sending
export async function sendReminderEmail(
  userEmail: string,
  subject: string,
  reminderDetails: {
    companyName: string;
    jobTitle: string;
    note: string;
    scheduledFor: Date;
    status?: string;
    applicationDate?: string;
  }
): Promise<boolean> {
  try {
    console.log('=== Email Sending Process Started ===');
    console.log('To:', userEmail);
    console.log('From:', process.env.AWS_SES_FROM_EMAIL);

    const info = await transporter.sendMail({
      from: process.env.AWS_SES_FROM_EMAIL!, // Must be verified in SES
      to: userEmail,
      subject: `JobTrackr: ${reminderDetails.companyName} Follow-up Reminder`,
      text: `
Dear User,

This is a reminder for your job application follow-up:

Company: ${reminderDetails.companyName}
Position: ${reminderDetails.jobTitle}
Status: ${reminderDetails.status || 'Applied'}
Scheduled for: ${reminderDetails.scheduledFor.toLocaleString()}

Note: ${reminderDetails.note}

Best regards,
JobTrackr Team`,
      html: `<p>Dear User,</p>
<p>This is a reminder for your job application follow-up:</p>
<p>
<strong>Company:</strong> ${reminderDetails.companyName}<br>
<strong>Position:</strong> ${reminderDetails.jobTitle}<br>
<strong>Status:</strong> ${reminderDetails.status || 'Applied'}<br>
<strong>Scheduled for:</strong> ${reminderDetails.scheduledFor.toLocaleString()}
</p>
<p><strong>Note:</strong> ${reminderDetails.note}</p>
<p>Best regards,<br>JobTrackr Team</p>`
    });

    console.log('=== Email Sending Response ===');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('=== Email Sending Error ===');
    console.error('Error:', error);
    throw error;
  }
}

// Add a simple test function
export async function testEmail(toEmail: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.AWS_SES_FROM_EMAIL!,
      to: toEmail,
      subject: 'Test Email from JobTrackr',
      text: 'This is a test email from JobTrackr.',
      html: '<p>This is a test email from JobTrackr.</p>'
    });
    
    console.log('Test email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Test email failed:', error);
    return false;
  }
}
 