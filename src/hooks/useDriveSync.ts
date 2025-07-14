import { useState } from "react";

/**
 * Custom hook to handle syncing images to Google Drive via API.
 * @param isAuthenticated - Whether the user is authenticated (OAuth)
 * @param getValidTokens - Function to get valid OAuth tokens
 * @returns { sync: () => Promise<void>, loading: boolean, error: unknown | null, result: string | null }
 */
export default function useDriveSync(
  isAuthenticated: boolean,
  getValidTokens: () => Promise<unknown>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const sync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (!isAuthenticated) {
        setError({
          title: "Authentication Required",
          message:
            "Please complete OAuth authentication first by visiting the Drive Upload page to get valid tokens.",
        });
        return;
      }
      const tokens = await getValidTokens();
      const res = await fetch("/api/incident-serpo-sync-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });
      const json: Record<string, unknown> = await res.json();
      if (!res.ok) {
        let errorMessage = "Unknown error occurred";
        if (res.status === 500 && json?.error) {
          if (
            typeof json.error === "string" &&
            json.error.includes("Missing required environment variable")
          ) {
            errorMessage =
              "Server configuration error: Missing required environment variables. Please check your .env.local file.";
          } else if (
            typeof json.error === "string" &&
            json.error.includes("SUPABASE")
          ) {
            errorMessage =
              "Database connection error: Please check your Supabase configuration.";
          } else if (
            typeof json.error === "string" &&
            json.error.includes("GOOGLE")
          ) {
            errorMessage =
              "Google API error: Please check your Google OAuth configuration.";
          } else if (typeof json.error === "string") {
            errorMessage = json.error;
          }
        } else if (typeof json?.error === "string") {
          errorMessage = json.error;
        }
        setError({
          title: `Sync Error (${res.status})`,
          message: errorMessage,
          error: json,
        });
      } else {
        setResult(
          typeof json?.message === "string"
            ? json.message
            : json?.message !== undefined
            ? JSON.stringify(json.message, null, 2)
            : JSON.stringify(json?.results ?? json, null, 2)
        );
      }
    } catch (e: unknown) {
      setError({
        title: "Sync Exception",
        message: e instanceof Error ? e.message : String(e),
        error: e,
      });
    } finally {
      setLoading(false);
    }
  };

  return { sync, loading, error, result };
} 