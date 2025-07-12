import { getAuthUrl } from "@/lib/googleOAuthDrive";

export async function GET() {
  try {
    // Generate a unique state parameter for security, always including 'drive-upload-'
    const state = `drive-upload-${crypto.randomUUID()}`;
    
    const url = getAuthUrl(state);
    
    return Response.json({ 
      url,
      state 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error("Drive auth error:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Internal Server Error";
    
    return Response.json(
      { 
        error: errorMessage,
        code: 'AUTH_ERROR'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
