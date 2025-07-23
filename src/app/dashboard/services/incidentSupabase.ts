import { createClient } from '@supabase/supabase-js';
import { IncidentSerpo } from '@/types/incident-serpo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchIncidentSerpoList(): Promise<IncidentSerpo[]> {
  const { data, error } = await supabase
    .from('incident_serpo')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as IncidentSerpo[];
}

export async function updateIncidentSyncStatus(id: string, is_synced_to_sheet: boolean): Promise<void> {
  const { error } = await supabase
    .from('incident_serpo')
    .update({ is_synced_to_sheet })
    .eq('id', id);
  
  if (error) throw error;
}
