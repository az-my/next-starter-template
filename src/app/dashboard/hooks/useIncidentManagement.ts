import { useState } from "react";
import { IncidentSerpo } from "@/types/incident-serpo";
import { useIncidentSerpoList } from "./useIncidentSerpoList";

interface UseIncidentManagementProps {
  googleTokens: any;
}

export function useIncidentManagement({ googleTokens }: UseIncidentManagementProps) {
  const { incidents, loading: incidentsLoading, error: incidentsError, refetch } = useIncidentSerpoList();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  async function handleSync(incident: IncidentSerpo, sheetId: string): Promise<void> {
    try {
      setSyncingId(incident.id);
      setSyncLoading(true);
      setSyncError(null);
      
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
      
      // Refetch incidents to get updated sync status
      await refetch();
    } catch (error: any) {
      setSyncError(error.message);
      console.error('Sync error:', error);
    } finally {
      setSyncingId(null);
      setSyncLoading(false);
    }
  }

  return {
    incidents,
    incidentsLoading,
    incidentsError,
    syncLoading,
    syncError,
    syncingId,
    handleSync,
    refetch
  };
}