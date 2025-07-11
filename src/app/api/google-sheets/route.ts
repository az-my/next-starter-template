import { NextRequest } from "next/server"
import { getSheetsClient } from "@/lib/googleSheets"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spreadsheetId = searchParams.get("spreadsheetId")
  if (!spreadsheetId) {
    return new Response(JSON.stringify({ error: "Missing spreadsheetId" }), { status: 400 })
  }
  try {
    const sheets = getSheetsClient()
    const meta = await sheets.spreadsheets.get({ spreadsheetId })
    return new Response(JSON.stringify({ sheets: meta.data.sheets }), { status: 200 })
  } catch (e: unknown) {
    console.error("Google Sheets API error:", e)
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    const errorStack = e instanceof Error ? e.stack : undefined;
    return new Response(JSON.stringify({ error: errorMessage, stack: errorStack }), { status: 500 })
  }
}
