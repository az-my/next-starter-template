import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DebugAlert } from "@/components/ui/debug-alert";
import React from "react";

export interface AppHeaderProps {
  showSupabase: boolean;
  setShowSupabase: React.Dispatch<React.SetStateAction<boolean>>;
  showSheets: boolean;
  setShowSheets: React.Dispatch<React.SetStateAction<boolean>>;
  showDashboard: boolean;
  setShowDashboard: React.Dispatch<React.SetStateAction<boolean>>;
  sync: () => void;
  syncLoading: boolean;
  isAuthenticated: boolean;
  debugDialog: {
    title?: string;
    message: string;
    error?: unknown;
  } | null;
  setDebugDialog: React.Dispatch<React.SetStateAction<{
    title?: string;
    message: string;
    error?: unknown;
  } | null>>;
}

export function AppHeader({
  showSupabase,
  setShowSupabase,
  showSheets,
  setShowSheets,
  showDashboard,
  setShowDashboard,
  sync,
  syncLoading,
  isAuthenticated,
  debugDialog,
  setDebugDialog,
}: AppHeaderProps) {
  return (
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
          onClick={sync}
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
  );
}

export default AppHeader; 