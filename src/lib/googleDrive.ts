import { google } from "googleapis";
import path from "path";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "service-account.json");

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: SCOPES,
  });
  return google.drive({ version: "v3", auth });
}

/**
 * Uploads a file buffer to Google Drive in the specified folder.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @param {string} fileName - Name for the file in Drive
 * @param {string} folderId - Target Drive folder ID
 */
export async function uploadToDrive(buffer: Buffer, mimeType: string, fileName: string, folderId: string) {
  const drive = getDriveClient();
  // Convert buffer to a readable stream for Google Drive API
  const stream = Readable.from(buffer);
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name, webViewLink",
  });
  return res.data;
}
