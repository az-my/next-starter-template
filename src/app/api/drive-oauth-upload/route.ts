import { NextRequest } from "next/server";
import { uploadToDriveWithOAuth } from "@/lib/googleOAuthDrive";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "text/plain",
  "application/json",
  "application/xml",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const tokensString = formData.get("tokens") as string;
    const folderId = formData.get("folderId") as string | undefined;
    
    // Validate file
    if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
      return Response.json(
        { 
          error: "No file uploaded or invalid file",
          code: 'NO_FILE'
        }, 
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { 
          error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          code: 'FILE_TOO_LARGE'
        }, 
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json(
        { 
          error: `File type ${file.type} is not allowed`,
          code: 'INVALID_FILE_TYPE',
          allowedTypes: ALLOWED_MIME_TYPES
        }, 
        { status: 400 }
      );
    }
    
    // Validate tokens
    if (!tokensString) {
      return Response.json(
        { 
          error: "No authentication tokens provided",
          code: 'NO_TOKENS'
        }, 
        { status: 400 }
      );
    }
    
    let tokens: Record<string, unknown>;
    try {
      tokens = JSON.parse(tokensString);
    } catch (error) {
      return Response.json(
        { 
          error: "Invalid tokens format",
          code: 'INVALID_TOKENS'
        }, 
        { status: 400 }
      );
    }
    
    // Validate tokens structure
    if (!tokens.access_token) {
      return Response.json(
        { 
          error: "Invalid tokens: missing access_token",
          code: 'INVALID_TOKEN_STRUCTURE'
        }, 
        { status: 400 }
      );
    }
    
    const mimeType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "upload";
    
    const driveRes = await uploadToDriveWithOAuth(
      tokens, 
      buffer, 
      mimeType, 
      fileName, 
      folderId
    );
    
    return Response.json({ 
      success: true, 
      file: driveRes 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
  } catch {
    console.error('Drive upload error');
    const errorMessage = 'Unknown error occurred';
    const errorCode = 'UPLOAD_ERROR';
    return Response.json(
      { 
        error: errorMessage,
        code: errorCode
      }, 
      { status: 500 }
    );
  }
}
