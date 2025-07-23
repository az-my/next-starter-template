import { useEffect, useState } from "react";
import { IncidentSerpo } from "@/types/incident-serpo";
import { fetchIncidentSerpoList } from "../services/incidentSupabase";

export function useIncidentSerpoList() {
  const [incidents, setIncidents] = useState<IncidentSerpo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidentSerpoList();
      setIncidents(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return { incidents, loading, error, refetch: fetchIncidents };
}
