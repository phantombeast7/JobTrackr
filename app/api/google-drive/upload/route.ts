import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const companyName = formData.get('companyName') as string
    const userId = formData.get('userId') as string
    const accessToken = formData.get('accessToken') as string

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    
    // Check if JobTrackr folder exists
    const folderQuery = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='JobTrackr'`,
      fields: 'files(id)'
    })

    let folderId = folderQuery.data.files?.[0]?.id

    if (!folderId) {
      // Create folder if it doesn't exist
      const folderResponse = await drive.files.create({
        requestBody: {
          name: 'JobTrackr',
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      })
      folderId = folderResponse.data.id
    }

    // Format file name
    const date = new Date().toISOString().split('T')[0]
    const fileName = `${companyName}_${date}_${userId}`
    const fileExtension = file.name.split('.').pop()

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create readable stream from buffer
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)

    // Upload file
    const response = await drive.files.create({
      requestBody: {
        name: `${fileName}.${fileExtension}`,
        parents: [folderId!]
      },
      media: {
        mimeType: file.type,
        body: stream
      }
    })

    // Set file permissions to be viewable by anyone with the link
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })

    return NextResponse.json({ fileId: response.data.id })
  } catch (error) {
    console.error('Error uploading to Google Drive:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
} 