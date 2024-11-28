import * as React from 'react'

interface EmailTemplateProps {
  companyName: string
  jobTitle: string
  note: string
  customBody?: string
}

export const EmailTemplate = ({
  companyName,
  jobTitle,
  note,
  customBody,
}: EmailTemplateProps) => {
  return (
    <div style={{
      backgroundColor: '#f6f9fc',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
      padding: '20px 0',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #f0f0f0',
        borderRadius: '5px',
        margin: '0 auto',
        padding: '20px',
        width: '100%',
        maxWidth: '600px',
      }}>
        <h1 style={{
          fontSize: '24px',
          lineHeight: '1.3',
          fontWeight: '700',
          color: '#484848',
          textAlign: 'center',
          margin: '30px 0',
        }}>
          Job Application Follow-up Reminder
        </h1>
        
        <div style={{
          padding: '20px',
          borderRadius: '5px',
          backgroundColor: '#f8f9fa',
          margin: '20px 0',
        }}>
          {customBody ? (
            <p style={{
              fontSize: '16px',
              lineHeight: '24px',
              color: '#333',
              margin: '10px 0',
            }}>{customBody}</p>
          ) : (
            <>
              <p style={{
                fontSize: '16px',
                lineHeight: '24px',
                color: '#333',
                margin: '10px 0',
              }}>
                Time to follow up on your application at {companyName} for the {jobTitle} position.
              </p>
              <p style={{
                fontSize: '14px',
                color: '#666',
                fontStyle: 'italic',
                margin: '16px 0',
                padding: '10px',
                borderLeft: '3px solid #ddd',
              }}>
                Reminder Note: {note}
              </p>
            </>
          )}
        </div>

        <p style={{
          fontSize: '12px',
          lineHeight: '16px',
          color: '#898989',
          textAlign: 'center',
          margin: '20px 0',
        }}>
          Sent by JobTrackr - Your Job Application Assistant
        </p>
      </div>
    </div>
  )
} 