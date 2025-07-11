"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface SheetData {
  properties: {
    sheetId: number;
    title: string;
  };
}

export function GoogleSheetsViewer() {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState("");

  async function fetchSheets() {
    setLoading(true);
    setError(null);
    setData([]);
    try {
      const res = await fetch(
        `/api/google-sheets?spreadsheetId=${spreadsheetId}`
      );
      const json = (await res.json()) as { error?: string; sheets?: SheetData[] };
      if (json.error) setError(json.error);
      else setData(json.sheets || []);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
    }
    setLoading(false);
  }

  return (
    <Card className="mt-4 w-full max-w-2xl">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">
          Google Sheets: List Worksheets
        </h2>
        <div className="flex gap-2 mb-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            placeholder="Enter Spreadsheet ID"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
          />
          <button
            className="bg-primary text-white px-4 py-1 rounded"
            onClick={fetchSheets}
            disabled={loading || !spreadsheetId}
          >
            {loading ? "Loading..." : "Fetch Sheets"}
          </button>
        </div>
        {error && <div className="text-red-500">Error: {error}</div>}
        {data.length > 0 && (
          <ul className="text-sm space-y-1 mt-2">
            {data.map((sheet) => (
              <li key={sheet.properties.sheetId}>
                <b>{sheet.properties.title}</b> (ID: {sheet.properties.sheetId})
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
