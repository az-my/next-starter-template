"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { OAuthDashboard } from "@/components/oauth-dashboard"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


import data from "./data.json"
import { Button } from "@/components/ui/button"
import * as React from "react"
import { useSearchParams } from "next/navigation"

type SyncDriveResponse = {
  message?: string;
  results?: unknown;
  error?: unknown;
};

export default function Page() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam === 'oauth' ? 'oauth' : 'overview';
  
  const [loading, setLoading] = React.useState(false);
  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/incident-serpo-sync-drive", { method: "POST" });
      const json = (await res.json()) as SyncDriveResponse;
      alert(
        typeof json === "object" && json !== null && "message" in json
          ? json.message
          : JSON.stringify(json.results || json.error || json)
      );
    } catch (e: unknown) {
      alert(
        "Sync failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Tabs defaultValue={defaultTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="oauth">OAuth Management</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="flex justify-end">
                      <Button onClick={handleSync} disabled={loading} variant="secondary">
                        {loading ? "Syncing..." : "Sync Images to Drive"}
                      </Button>
                    </div>
                    <SectionCards />
                    <ChartAreaInteractive />
                    <DataTable data={data} />
                  </TabsContent>
                  
                  <TabsContent value="oauth">
                    <OAuthDashboard />
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="space-y-4">
                    <ChartAreaInteractive />
                    <DataTable data={data} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
