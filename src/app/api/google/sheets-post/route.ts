
import { NextRequest, NextResponse } from "next/server";
import type { GoogleTokens } from '@/types/google-tokens';

  export async function POST(request: NextRequest) {
    const body = await request.json() as { sheetId: string; googleTokens: GoogleTokens; data: string[]; targetSheetName?: string };
    const { sheetId, googleTokens, data } = body;
    if (!sheetId || !googleTokens || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  
    const sheetName = "IncidentSerpo";

  // Helper: refresh access token if expired (Cloudflare-compatible)
  async function getValidAccessToken(tokens: GoogleTokens): Promise<string> {
    const now = Date.now();
    if (tokens.expiry_date && tokens.expiry_date > now && tokens.access_token) {
      return tokens.access_token;
    }
    if (!tokens.refresh_token) {
      throw new Error("No refresh_token available to refresh access token");
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error("Missing Google OAuth client env vars");
    // Use REST API for token refresh
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refresh_token,
      grant_type: "refresh_token"
    });
    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const json = await resp.json() as Record<string, unknown>;
    if (!resp.ok || typeof json.access_token !== 'string') {
      throw new Error(typeof json.error_description === 'string' ? json.error_description : "Failed to refresh access token");
    }
    return json.access_token;
  }

  try {
    const accessToken = await getValidAccessToken(googleTokens);
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}!A2:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [data] }),
      }
    );
    const raw = await res.text();
    let result: unknown;
    try {
      result = JSON.parse(raw);
    } catch {
      result = raw;
    }
    if (!res.ok) {
      let errorMessage: string = "Google Sheets API error";
      if (
        typeof result === "object" &&
        result !== null &&
        "error" in result
      ) {
        const errorObj = (result as { error?: unknown }).error;
        if (
          errorObj &&
          typeof errorObj === "object" &&
          "message" in errorObj
        ) {
          const msg = (errorObj as { message?: unknown }).message;
          if (typeof msg === "string") {
            errorMessage = msg;
          } else {
            errorMessage = "Google Sheets API error";
          }
        }
      }
      throw new Error(errorMessage);
    }
    return NextResponse.json({ success: true, result, raw });
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
