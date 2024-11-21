import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google-drive/callback'
)

export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
    prompt: 'consent'
  })

  return NextResponse.json({ authUrl })
} 