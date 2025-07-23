import { useState, useEffect } from "react";
import { IncidentSerpo } from "@/types/incident-serpo";
import { supabase } from "@/lib/supabase";
import type { GoogleTokens } from '@/types/google-tokens';

interface SheetsPostResponse {
  error?: string;
  success?: boolean;
}

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Sync an existing incident to Google Sheets
  async function syncIncidentToSheet(incident: IncidentSerpo, sheetId: string, googleTokens: GoogleTokens) {
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
      const result = await res.json() as SheetsPostResponse;
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents();
  }, []);

  return { incidents, fetchIncidents, syncIncidentToSheet, loading, error };
}
