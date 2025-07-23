import { useState, useEffect } from "react";
import { IncidentSerpo } from "@/types/incident-serpo";
import { supabase } from "@/lib/supabase";
import { fetchIncidentSerpoList, updateIncidentSyncStatus } from "../services/incidentSupabase";

export function useIncidentSerpo() {
  const [incidents, setIncidents] = useState<IncidentSerpo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch incidents from Supabase
  async function fetchIncidents() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('incident_serpo')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseError) throw supabaseError;
      setIncidents(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Sync an existing incident to Google Sheets
  async function syncIncidentToSheet(incident: IncidentSerpo, sheetId: string, googleTokens: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/google/sheets-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId,
          googleTokens,
          data: Object.values(incident),
        }),
      });
      const result = await res.json() as any;
      if (!res.ok) throw new Error(result.error || "Sheet sync failed");
      
      // Update the incident's sync status in Supabase
      const { error: updateError } = await supabase
        .from('incident_serpo')
        .update({ is_synced_to_sheet: true })
        .eq('id', incident.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setIncidents((prev) => 
        prev.map(inc => 
          inc.id === incident.id 
            ? { ...inc, is_synced_to_sheet: true }
            : inc
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents();
  }, []);

  return { incidents, fetchIncidents, syncIncidentToSheet, loading, error };
}
