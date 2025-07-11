import { NextRequest } from "next/server";
import { uploadToDriveWithOAuth } from "@/lib/googleOAuthDrive";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const tokens = JSON.parse(formData.get("tokens") as string);
  const folderId = formData.get("folderId") as string | undefined;
  if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
  }
  const mimeType = file.type;
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name || "upload";
  try {
    const driveRes = await uploadToDriveWithOAuth(tokens, buffer, mimeType, fileName, folderId);
    return new Response(JSON.stringify({ success: true, file: driveRes }), { status: 200 });
  } catch (err: unknown) {
    let errorMessage = 'Unknown error occurred';
    if (err instanceof Error) {
      errorMessage = err.message;
      // Log stack trace for debugging
      console.error('Drive upload error:', err.stack || err);
    } else {
      console.error('Drive upload error:', err);
    }
    // Log request details for debugging
    console.error('Request details:', {
      mimeType,
      fileName,
      folderId,
      tokens,
    });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
