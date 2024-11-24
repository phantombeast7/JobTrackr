import { setCredentials } from '@/lib/googleDrive';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      throw new Error(`Authorization failed: ${error}`);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const tokens = await setCredentials(code);

    // Return HTML that sends the tokens to the parent window and closes itself
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { 
                  type: 'GOOGLE_DRIVE_AUTH_SUCCESS', 
                  tokens: ${JSON.stringify(tokens)}
                }, 
                '*'
              );
              window.close();
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Authorization failed' },
      { status: 500 }
    );
  }
} 