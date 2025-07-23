import { useState } from "react";
import { IncidentSerpo } from "@/types/incident-serpo";
import { useIncidentSerpoList } from "./useIncidentSerpoList";
import type { GoogleTokens } from '@/types/google-tokens';

interface UseIncidentManagementProps {
  googleTokens: GoogleTokens | null;
}

interface SheetsPostResponse {
  error?: string;
  success?: boolean;
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
      
      const result = await res.json() as SheetsPostResponse;
      if (!res.ok) throw new Error(result.error || "Sheet sync failed");
      
      // Refetch incidents to get updated sync status
      await refetch();
    } catch (error: unknown) {
      setSyncError(error instanceof Error ? error.message : 'An unknown error occurred');
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