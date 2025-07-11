import { NextRequest } from "next/server";
import { getTokensFromCode } from "@/lib/googleOAuthDrive";

export async function POST(req: NextRequest) {
  const body = await req.json() as { code?: string };
  const { code } = body;
  if (!code) return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
  try {
    const tokens = await getTokensFromCode(code);
    return new Response(JSON.stringify({ tokens }), { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
