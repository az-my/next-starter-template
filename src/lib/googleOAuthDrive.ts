import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Environment variable validation with proper error handling
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] || fallback;
}

// Dynamic redirect URI based on environment
function getRedirectUri(): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment 
    ? 'http://localhost:3000' 
    : getRequiredEnv('NEXT_PUBLIC_APP_URL');
  
  return `${baseUrl}/drive-upload`;
}

export function getOAuth2Client() {
  const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
  const clientSecret = getRequiredEnv('GOOGLE_CLIENT_SECRET');
  const redirectUri = getRedirectUri();

  console.log('OAuth Configuration:', {
    clientId: clientId ? '***SET***' : 'MISSING',
    clientSecret: clientSecret ? '***SET***' : 'MISSING',
    redirectUri,
    environment: process.env.NODE_ENV
  });

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getDriveFolderId(): string {
  return getRequiredEnv('GOOGLE_DRIVE_FOLDER_ID');
}

export function getAuthUrl(state?: string) {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: state || 'drive-upload', // Add state for security
  });
}

export async function getTokensFromCode(code: string) {
  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }
    
    return tokens;
  } catch (error) {
    console.error('Error getting tokens from code:', error);
    throw new Error(`Failed to exchange code for tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadToDriveWithOAuth(
  tokens: Record<string, unknown>, 
  buffer: Buffer, 
  mimeType: string, 
  fileName: string, 
  folderId?: string
) {
  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    
    const fileMetadata: { name: string; parents?: string[] } = { 
      name: fileName 
    };
    
    if (folderId) {
      fileMetadata.parents = [folderId];
    } else {
      // Use default folder if no specific folder provided
      const defaultFolderId = getOptionalEnv('GOOGLE_DRIVE_FOLDER_ID');
      if (defaultFolderId) {
        fileMetadata.parents = [defaultFolderId];
      }
    }
    
    const stream = Readable.from(buffer);
    
    // Create the file
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: { mimeType, body: stream },
      fields: "id, name, webViewLink, webContentLink",
    });
    
    if (!res.data.id) {
      throw new Error('Failed to create file in Google Drive');
    }
    
    // Make file shareable (anyone with the link can view)
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      fields: "id"
    });
    
    // Get updated file info (with webViewLink)
    const fileInfo = await drive.files.get({
      fileId: res.data.id,
      fields: "id, name, webViewLink, webContentLink",
    });
    
    return fileInfo.data;
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validate environment variables on module load
export function validateEnvironment() {
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ OAuth environment validation passed');
}

// Run validation on module load
validateEnvironment();
