import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json() as { sheetId: string; googleTokens: any; data: any; targetSheetName?: string };
  const { sheetId, googleTokens, data } = body;
  if (!sheetId || !googleTokens || !data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sheetName = "IncidentSerpo";

  // Helper: refresh access token if expired (Cloudflare-compatible)
  async function getValidAccessToken(tokens: any): Promise<string> {
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
    const json = await resp.json() as any;
    if (!resp.ok || !json.access_token) {
      throw new Error(json.error_description || "Failed to refresh access token");
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
    let result: any;
    try {
      result = JSON.parse(raw);
    } catch {
      result = raw;
    }
    if (!res.ok) throw new Error((result.error && result.error.message) ? result.error.message : "Google Sheets API error");
    return NextResponse.json({ success: true, result, raw });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
