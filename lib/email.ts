import nodemailer from 'nodemailer';

if (!process.env.AWS_SES_SMTP_HOST) throw new Error('AWS_SES_SMTP_HOST is not defined');
if (!process.env.AWS_SES_SMTP_PORT) throw new Error('AWS_SES_SMTP_PORT is not defined');
if (!process.env.AWS_SES_USER) throw new Error('AWS_SES_USER is not defined');
if (!process.env.AWS_SES_PASSWORD) throw new Error('AWS_SES_PASSWORD is not defined');
if (!process.env.AWS_SES_FROM_EMAIL) throw new Error('AWS_SES_FROM_EMAIL is not defined');

// Create AWS SES transporter
const transporter = nodemailer.createTransport({
  host: process.env.AWS_SES_SMTP_HOST,
  port: Number(process.env.AWS_SES_SMTP_PORT),
  secure: false, // Use TLS
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASSWORD,
  },
  debug: true // Enable debug logs
});

export async function sendReminderEmail(
  userEmail: string,
  subject: string,
  reminderDetails: {
    companyName: string;
    jobTitle: string;
    note: string;
    scheduledFor: Date;
  }
): Promise<boolean> {
  try {
    console.log('Sending reminder email to:', userEmail);

    const info = await transporter.sendMail({
      from: {
        name: 'JobTrackr',
        address: process.env.AWS_SES_FROM_EMAIL!
      },
      to: userEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #ffffff;
              }
              .header { 
                background-color: #2563eb;
                padding: 20px;
                border-radius: 5px 5px 0 0;
                text-align: center;
              }
              .header h2 {
                color: #ffffff;
                margin: 0;
              }
              .content { 
                margin: 20px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 5px;
              }
              .details {
                background-color: #ffffff;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
              }
              .footer { 
                font-size: 12px;
                color: #666;
                margin-top: 30px;
                text-align: center;
                border-top: 1px solid #eee;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Job Application Reminder</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>This is your scheduled reminder for your job application at <strong>${reminderDetails.companyName}</strong>.</p>
                
                <div class="details">
                  <h3>Application Details:</h3>
                  <ul>
                    <li><strong>Company:</strong> ${reminderDetails.companyName}</li>
                    <li><strong>Position:</strong> ${reminderDetails.jobTitle}</li>
                    <li><strong>Scheduled For:</strong> ${reminderDetails.scheduledFor.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</li>
                  </ul>
                  
                  <h3>Your Note:</h3>
                  <p>${reminderDetails.note}</p>
                </div>

                <p>Good luck with your application!</p>
              </div>
              <div class="footer">
                <p>This is an automated reminder from JobTrackr.</p>
                <p>Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Verify email connection on startup
transporter.verify()
  .then(() => {
    console.log('AWS SES connection verified successfully');
  })
  .catch((error) => {
    console.error('AWS SES connection error:', error);
  });
 