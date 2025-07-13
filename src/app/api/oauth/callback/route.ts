import { NextRequest } from "next/server";
import { getTokensFromCode } from "@/lib/googleOAuthDrive";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { 
      code?: string; 
      state?: string;
    };
    
    const { code, state } = body;
    
    if (!code) {
      return Response.json(
        { 
          error: "Missing authorization code",
          code: 'MISSING_CODE'
        }, 
        { status: 400 }
      );
    }
    
    // Validate state parameter if provided
    if (state && !state.startsWith('oauth-')) {
      return Response.json(
        { 
          error: "Invalid state parameter",
          code: 'INVALID_STATE'
        }, 
        { status: 400 }
      );
    }
    
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    return Response.json(
      { 
        tokens,
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
    console.error("OAuth callback error:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Authentication failed";
    
    return Response.json(
      { 
        error: errorMessage,
        code: 'CALLBACK_ERROR'
      }, 
      { status: 500 }
    );
  }
}