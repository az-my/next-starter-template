import { getAuthUrl } from "@/lib/googleOAuthDrive";

export async function GET() {
  const url = getAuthUrl();
  return new Response(JSON.stringify({ url }), { status: 200 });
}
