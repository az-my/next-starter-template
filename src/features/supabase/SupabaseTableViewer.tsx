"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export function SupabaseTableViewer() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      // Fetch from the new API route
      const res = await fetch("/api/supabase-table");
      const json = (await res.json()) as { error?: string; data?: Record<string, unknown>[] };
      if (json.error) setError(json.error);
      setData(json.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Card className="mt-4 w-full max-w-2xl">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Supabase: Profiles Table</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {!loading && !error && (
          <pre className="overflow-x-auto text-xs bg-muted p-2 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </Card>
  );
}
