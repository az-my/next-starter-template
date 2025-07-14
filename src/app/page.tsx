"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SystemInfo } from "@/components/system-info";
import { SupabaseTableViewer } from "@/features/supabase/SupabaseTableViewer";
import { GoogleSheetsViewer } from "@/features/google-sheets/GoogleSheetsViewer";
import { useState } from "react";
import { DebugAlert } from "@/components/ui/debug-alert";
import { OAuthExample } from "@/components/oauth-example";
import { SheetsSyncExample } from "@/components/sheets-sync-example";
import IncidentDashboard from "@/components/incident-dashboard";
import { useOAuth } from "@/hooks/useOAuth";
import * as React from "react";

export default function Home() {
  const [showSupabase, setShowSupabase] = useState(false);
  const [showSheets, setShowSheets] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [syncLoading, setSyncLoading] = React.useState(false);
  const [debugDialog, setDebugDialog] = React.useState<{
    title?: string;
    message: string;
    error?: unknown;
  } | null>(null);

  // Use the reusable OAuth service
  const { isAuthenticated, getValidTokens } = useOAuth();

  const handleSync = async () => {
    setSyncLoading(true);

    try {
      // Check if we have valid tokens
      if (!isAuthenticated) {
        setDebugDialog({
          title: "Authentication Required",
          message: "Please complete OAuth authentication first by visiting the Drive Upload page to get valid tokens.",
        });
        return;
      }

      // Get valid tokens (will refresh automatically if needed)
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
          if (json.error.includes("Missing required environment variable")) {
            errorMessage = "Server configuration error: Missing required environment variables. Please check your .env.local file.";
          } else if (json.error.includes("SUPABASE")) {
            errorMessage = "Database connection error: Please check your Supabase configuration.";
          } else if (json.error.includes("GOOGLE")) {
            errorMessage = "Google API error: Please check your Google OAuth configuration.";
          } else {
            errorMessage = json.error;
          }
        } else if (typeof json?.error === "string") {
          errorMessage = json.error;
        }
        
        setDebugDialog({
          title: `Sync Error (${res.status})`,
          message: errorMessage,
          error: json,
        });
      } else {
        setDebugDialog({
          title: "Sync Result",
          message:
            json?.message ||
            JSON.stringify(json?.results || json, null, 2),
        });
      }
    } catch (e: unknown) {
      setDebugDialog({
        title: "Sync Exception",
        message: e instanceof Error ? e.message : String(e),
        error: e,
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 sm:p-20 gap-8 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-2xl flex flex-col items-center gap-4">
        {debugDialog && (
          <DebugAlert
            title={debugDialog.title}
            message={debugDialog.message}
            error={debugDialog.error}
            onClose={() => setDebugDialog(null)}
          />
        )}
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-2xl font-bold mt-2">Welcome to Next.js Starter</h1>
        <p className="text-center text-muted-foreground text-base">
          Get started by editing{" "}
          <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-mono font-semibold">
            src/app/page.tsx
          </code>
          .<br />
          Save and see your changes instantly.
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowSupabase((v) => !v)}
          >
            {showSupabase ? "Hide Supabase Table" : "Show Supabase Table"}
          </Button>
          <Button variant="outline" onClick={() => setShowSheets((v) => !v)}>
            {showSheets ? "Hide Google Sheets" : "Show Google Sheets"}
          </Button>
          <Button variant="outline" onClick={() => setShowDashboard((v) => !v)}>
            {showDashboard ? "Hide Incident Dashboard" : "Show Incident Dashboard"}
          </Button>
          <Link href="/drive-upload">
            <Button variant="outline">Drive Upload</Button>
          </Link>
          <Button
            onClick={handleSync}
            disabled={syncLoading || !isAuthenticated}
            variant="secondary"
            title={!isAuthenticated ? "Complete OAuth authentication first" : ""}
          >
            {syncLoading ? "Syncing..." : isAuthenticated ? "Sync Images to Drive" : "Auth Required"}
          </Button>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-2">
              <a href="/drive-upload" className="text-blue-600 hover:underline">
                Complete OAuth setup
              </a> to enable sync functionality
            </p>
          )}
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </header>
      
      {/* OAuth Example Component */}
      <div className="w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-4 text-center">Reusable OAuth Service Example</h2>
        <div className="flex justify-center">
          <OAuthExample />
        </div>
      </div>
      
      {/* Google Sheets Sync Example */}
      <div className="w-full max-w-2xl">
        <SheetsSyncExample />
      </div>
      
      {/* Incident Dashboard */}
      {showDashboard && (
        <div className="w-full max-w-6xl">
          <IncidentDashboard />
        </div>
      )}
      
      {showSupabase && <SupabaseTableViewer />}
      {showSheets && <GoogleSheetsViewer />}
      <SystemInfo />
      <footer className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-6 mt-auto py-6 border-t border-gray-200 dark:border-gray-800">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
