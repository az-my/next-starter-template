// Helper to decode base64 and upload to Drive
import { getDriveFolderId } from "./googleOAuthDrive";
import mime from "mime-types";

/**
 * Decodes a base64 string and uploads it to Google Drive.
 * @param {string} base64 - The base64 string (with or without data URL prefix)
 * @param {string} fileName - The name for the file in Drive
 * @returns {Promise<string>} - The webViewLink of the uploaded file
 */
export async function uploadBase64ImageToDrive(base64: string, fileName: string): Promise<string> {
  // Remove data URL prefix if present
  const matches = base64.match(/^data:(.+);base64,(.*)$/);
  let mimeType = "image/jpeg";
  let data = base64;
  if (matches) {
    mimeType = matches[1];
    data = matches[2];
  }
  const buffer = Buffer.from(data, "base64");
  // Try to get extension from mimeType
  const ext = mime.extension(mimeType) || "jpg";
  const finalFileName = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;
  const folderId = getDriveFolderId();
  const result = await uploadToDrive(buffer, mimeType, finalFileName, folderId);
  return result.webViewLink || result.id || "";
}
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
