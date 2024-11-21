import { NextRequest } from 'next/server'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google-drive/callback'
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return new Response(
      `
      <script>
        window.opener.postMessage({ type: 'GOOGLE_DRIVE_AUTH_ERROR' }, '*');
        window.close();
      </script>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    return new Response(
      `
      <script>
        window.opener.postMessage({ 
          type: 'GOOGLE_DRIVE_AUTH_SUCCESS', 
          tokens: ${JSON.stringify(tokens)}
        }, '*');
        window.close();
      </script>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error('Error getting tokens:', error)
    return new Response(
      `
      <script>
        window.opener.postMessage({ type: 'GOOGLE_DRIVE_AUTH_ERROR' }, '*');
        window.close();
      </script>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  }
} 