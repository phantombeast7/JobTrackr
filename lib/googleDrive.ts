import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI
)

export async function uploadToGoogleDrive(file: File, companyName: string, userId: string) {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    
    // First, check if JobTrackr folder exists
    let folderId = await getFolderIdByName('JobTrackr')
    if (!folderId) {
      // Create folder if it doesn't exist
      const folderMetadata = {
        name: 'JobTrackr',
        mimeType: 'application/vnd.google-apps.folder'
      }
      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      })
      folderId = folder.data.id
    }

    // Format file name
    const date = new Date().toISOString().split('T')[0]
    const fileName = `${companyName}_${date}_${userId}`
    const fileExtension = file.name.split('.').pop()

    // Upload file
    const response = await drive.files.create({
      requestBody: {
        name: `${fileName}.${fileExtension}`,
        parents: [folderId!]
      },
      media: {
        mimeType: file.type,
        body: file
      }
    })

    return response.data.id
  } catch (error) {
    console.error('Error uploading to Google Drive:', error)
    throw error
  }
}

async function getFolderIdByName(folderName: string) {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: 'files(id)'
    })
    return response.data.files?.[0]?.id
  } catch (error) {
    console.error('Error getting folder:', error)
    throw error
  }
}

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file']
  })
}

export async function setCredentials(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return tokens
} 