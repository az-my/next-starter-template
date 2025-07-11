import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  // Fetch from the default 'profiles' table (created by Supabase auth)
  const { data, error } = await supabase.from("incident_serpo").select("*")
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify({ data }), { status: 200 })
}
