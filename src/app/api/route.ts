import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI!;
const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'openid',
  'email',
  'profile',
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

// Health check endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'google-auth-url') {
    // Generate Google OAuth URL for the current session
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const state = user.id;
    const oauth2Client = getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: DEFAULT_SCOPES,
      state,
    });
    return NextResponse.json({ url });
  }

  if (action === 'google-status') {
    // Check Google connection status for current user
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    // Debug logging
    console.log('Google Status Check:', {
      error,
      user,
      user_metadata: user?.user_metadata,
      google_tokens: user?.user_metadata?.google_tokens,
    });
    if (error || !user) {
      return NextResponse.json({ connected: false, message: 'User not authenticated', debug: { error, user } });
    }
    const hasGoogleTokens = !!user.user_metadata?.google_tokens?.access_token;
    return NextResponse.json({
      connected: hasGoogleTokens,
      message: hasGoogleTokens ? 'Google connected' : 'Google not connected',
      tokens: user.user_metadata?.google_tokens || null,
      debug: {
        user_metadata: user.user_metadata,
        google_tokens: user.user_metadata?.google_tokens,
      }
    });
  }

  // Default health check
  return NextResponse.json({ status: 'ok', message: 'API is working.' });
}

// Token exchange endpoint
export async function POST(request: Request) {
  const body = await request.json() as { code?: string; [key: string]: unknown };
  if (body.code) {
    // Exchange Google OAuth code for tokens and store in Supabase user metadata
    try {
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(body.code);
      // Store tokens in Supabase user metadata
      const supabase = await getSupabaseServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          google_tokens: tokens,
        },
      });
      if (updateError) {
        return NextResponse.json({ error: 'Failed to store tokens', details: String(updateError) }, { status: 500 });
      }
      return NextResponse.json({ tokens });
    } catch (error) {
      return NextResponse.json({ error: 'Token exchange failed', details: String(error) }, { status: 400 });
    }
  }
  // Default: echo received data
  return NextResponse.json({ received: body });
}
