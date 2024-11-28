'use server'

import { EmailTemplate } from './EmailTemplate'
import { ReactElement } from 'react'

interface EmailProps {
  companyName: string
  jobTitle: string
  note: string
  customBody?: string
}

interface EmailRendererProps {
  data?: any;
}

export async function generateEmailHtml(props: EmailProps): Promise<string> {
  const template = EmailTemplate(props)
  return convertReactElementToHTML(props)
}

function convertReactElementToHTML(props: EmailProps): string {
  // Convert React element to HTML string
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <div style="
      background-color: #f6f9fc;
      font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;
      padding: 20px 0;
    ">
      <div style="
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 5px;
        margin: 0 auto;
        padding: 20px;
        width: 100%;
        max-width: 600px;
      ">
        <h1 style="
          font-size: 24px;
          line-height: 1.3;
          font-weight: 700;
          color: #484848;
          text-align: center;
          margin: 30px 0;
        ">
          Job Application Follow-up Reminder
        </h1>
        
        <div style="
          padding: 20px;
          border-radius: 5px;
          background-color: #f8f9fa;
          margin: 20px 0;
        ">
          ${props.customBody ? `
            <p style="
              font-size: 16px;
              line-height: 24px;
              color: #333;
              margin: 10px 0;
            ">${props.customBody}</p>
          ` : `
            <p style="
              font-size: 16px;
              line-height: 24px;
              color: #333;
              margin: 10px 0;
            ">
              Time to follow up on your application at ${props.companyName} for the ${props.jobTitle} position.
            </p>
            <p style="
              font-size: 14px;
              color: #666;
              font-style: italic;
              margin: 16px 0;
              padding: 10px;
              border-left: 3px solid #ddd;
            ">
              Reminder Note: ${props.note}
            </p>
          `}
        </div>

        <p style="
          font-size: 12px;
          line-height: 16px;
          color: #898989;
          text-align: center;
          margin: 20px 0;
        ">
          Sent by JobTrackr - Your Job Application Assistant
        </p>
      </div>
    </div>
  </body>
</html>`
} 