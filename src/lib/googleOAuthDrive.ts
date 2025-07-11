import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getEnv(key: string, fallback?: string): string {
  if (process.env[key]) return process.env[key]!;
  if (fallback !== undefined) {
    console.warn(`Warning: Using fallback for env var ${key}`);
    return fallback;
  }
  throw new Error(`Missing requiredddd environment variable: ${key}`);
}

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    getEnv('GOOGLE_CLIENT_ID'),
    getEnv('GOOGLE_CLIENT_SECRET'),
    getEnv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/drive-upload')
  );
}

export function getDriveFolderId(): string {
  return getEnv('GOOGLE_DRIVE_FOLDER_ID');
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function uploadToDriveWithOAuth(tokens: Record<string, unknown>, buffer: Buffer, mimeType: string, fileName: string, folderId?: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const fileMetadata: { name: string; parents?: string[] } = { name: fileName };
  if (folderId) fileMetadata.parents = [folderId];
  const stream = Readable.from(buffer);
  const res = await drive.files.create({
    requestBody: fileMetadata,
    media: { mimeType, body: stream },
    fields: "id, name, webViewLink, webContentLink",
  });
  // Make file shareable (anyone with the link can view)
  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    fields: "id"
  });
  // Get updated file info (with webViewLink)
  const fileInfo = await drive.files.get({
    fileId: res.data.id!,
    fields: "id, name, webViewLink, webContentLink",
  });
  return fileInfo.data;
}

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
