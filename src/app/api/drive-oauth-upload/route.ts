import { NextRequest, NextResponse } from "next/server";
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

// Interface for the successfully validated data
interface ValidatedData {
  file: File;
  tokens: Record<string, unknown>;
  folderId?: string;
}

/**
 * Validates the incoming form data.
 * @returns A successful data object or an error response.
 */
async function validateRequest(
  formData: FormData
): Promise<{ data: ValidatedData; error: null } | { data: null; error: NextResponse }> {
  const file = formData.get("file");
  const tokensString = formData.get("tokens") as string;
  const folderId = formData.get("folderId") as string | undefined;

  // 1. Validate file existence
  if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
    const errorResponse = NextResponse.json(
      { error: "No file uploaded or invalid file", code: "NO_FILE" },
      { status: 400 }
    );
    return { data: null, error: errorResponse };
  }

  // 2. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    const errorResponse = NextResponse.json(
      { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB`, code: "FILE_TOO_LARGE" },
      { status: 400 }
    );
    return { data: null, error: errorResponse };
  }

  // 3. Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    const errorResponse = NextResponse.json(
      {
        error: `File type '${file.type}' is not allowed`,
        code: "INVALID_FILE_TYPE",
        allowedTypes: ALLOWED_MIME_TYPES,
      },
      { status: 400 }
    );
    return { data: null, error: errorResponse };
  }

  // 4. Validate tokens
  if (!tokensString) {
    const errorResponse = NextResponse.json(
      { error: "No authentication tokens provided", code: "NO_TOKENS" },
      { status: 400 }
    );
    return { data: null, error: errorResponse };
  }

  let tokens: Record<string, unknown>;
  try {
    tokens = JSON.parse(tokensString);
  } catch {
    const errorResponse = NextResponse.json(
      { error: "Invalid tokens format", code: "INVALID_TOKENS" },
      { status: 400 }
    );
    return { data: null, error: errorResponse };
  }

  if (!tokens.access_token) {
    const errorResponse = NextResponse.json(
      { error: "Invalid tokens: missing access_token", code: "INVALID_TOKEN_STRUCTURE" },
      { status: 400 }
    );
    return { data: null, error: errorResponse };
  }

  return { data: { file, tokens, folderId }, error: null };
}

/**
 * API route handler for POST requests to upload a file to Google Drive.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const validation = await validateRequest(formData);

    // If validation fails, return the specific error response immediately.
    if (validation.error) {
      return validation.error;
    }

    // On successful validation, proceed with the upload.
    const { file, tokens, folderId } = validation.data;
    const buffer = Buffer.from(await file.arrayBuffer());

    const driveResponse = await uploadToDriveWithOAuth(
      tokens,
      buffer,
      file.type,
      file.name || "upload", // Use original file name
      folderId
    );

    return NextResponse.json(
      {
        success: true,
        file: driveResponse,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error: unknown) {
    console.error("An unexpected error occurred during file upload:", error);
    const message = error instanceof Error
      ? error.message
      : "An unknown error occurred during the upload process.";
    return NextResponse.json(
      {
        error: message,
        code: "UPLOAD_PROCESS_ERROR",
      },
      { status: 500 }
    );
  }
}
