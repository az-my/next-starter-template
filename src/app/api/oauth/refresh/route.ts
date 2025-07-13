import { NextRequest } from "next/server";
import { getOAuth2Client } from "@/lib/googleOAuthDrive";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { 
      refresh_token?: string;
    };
    
    const { refresh_token } = body;
    
    if (!refresh_token) {
      return Response.json(
        { 
          error: "Missing refresh token",
          code: 'MISSING_REFRESH_TOKEN'
        }, 
        { status: 400 }
      );
    }
    
    // Create OAuth2 client and set refresh token
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token });
    
    // Refresh the access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('No access token received from refresh');
    }
    
    return Response.json(
      { 
        tokens: credentials,
        success: true
      }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
    
  } catch (error) {
    console.error("Token refresh error:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Token refresh failed";
    
    return Response.json(
      { 
        error: errorMessage,
        code: 'REFRESH_ERROR'
      }, 
      { status: 401 }
    );
  }
}