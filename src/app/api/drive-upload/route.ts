import { NextRequest } from "next/server";
import { uploadToDrive } from "@/lib/googleDrive";

// Set your Google Drive folder ID here
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "<YOUR_FOLDER_ID>";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Content-Type must be multipart/form-data" }), { status: 400 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return new Response(JSON.stringify({ error: "File type not allowed" }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "upload";
    const driveRes = await uploadToDrive(buffer, mimeType, fileName, DRIVE_FOLDER_ID);
    return new Response(JSON.stringify({ success: true, file: driveRes }), { status: 200 });
  } catch (err: unknown) {
    console.error("Drive upload error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
