"use client";

import { SystemInfo } from "@/components/system-info";
import { SupabaseTableViewer } from "@/features/supabase/SupabaseTableViewer";
import { GoogleSheetsViewer } from "@/features/google-sheets/GoogleSheetsViewer";
import { useState } from "react";
import OAuthSection from "@/components/oauth-section";
import SheetsSyncSection from "@/components/sheets-sync-section";
import IncidentDashboard from "@/components/incident-dashboard";
import { useOAuth } from "@/hooks/useOAuth";
import * as React from "react";
import useDriveSync from "@/hooks/useDriveSync";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";

export default function Home() {
  const [showSupabase, setShowSupabase] = useState(false);
  const [showSheets, setShowSheets] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [debugDialog, setDebugDialog] = React.useState<{
    title?: string;
    message: string;
    error?: unknown;
  } | null>(null);

  // Use the reusable OAuth service
  const { isAuthenticated, getValidTokens } = useOAuth();

  // Use the new Drive Sync hook
  const { sync, loading: syncLoading, error: syncError, result: syncResult } = useDriveSync(isAuthenticated, getValidTokens);

  // Show debug dialog on error or result
  React.useEffect(() => {
    if (syncError) {
      if (typeof syncError === "object" && syncError !== null && "message" in syncError) {
        setDebugDialog({
          title: (syncError as { title?: string }).title ?? "Sync Error",
          message: String((syncError as { message?: string }).message ?? "Unknown error"),
          error: syncError,
        });
      } else {
        setDebugDialog({
          title: "Sync Error",
          message: String(syncError),
          error: syncError,
        });
      }
    } else if (syncResult) {
      setDebugDialog({
        title: "Sync Result",
        message: syncResult,
      });
    }
  }, [syncError, syncResult]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 sm:p-20 gap-8 font-[family-name:var(--font-geist-sans)]">
      <AppHeader
        showSupabase={showSupabase}
        setShowSupabase={setShowSupabase}
        showSheets={showSheets}
        setShowSheets={setShowSheets}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        sync={sync}
        syncLoading={syncLoading}
        isAuthenticated={isAuthenticated}
        debugDialog={debugDialog}
        setDebugDialog={setDebugDialog}
      />
      
      {/* OAuth Example Component */}
      <OAuthSection />
      
      {/* Google Sheets Sync Example */}
      <SheetsSyncSection />
      
      {/* Incident Dashboard */}
      {showDashboard && (
        <div className="w-full max-w-6xl">
          <IncidentDashboard />
        </div>
      )}
      
      {showSupabase && <SupabaseTableViewer />}
      {showSheets && <GoogleSheetsViewer />}
      <SystemInfo />
      <AppFooter />
    </div>
  );
}
