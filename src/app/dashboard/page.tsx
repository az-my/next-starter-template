"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "./hooks/useUser";
import { DashboardLayout } from "./components/DashboardLayout";
import { OverviewTab } from "./components/OverviewTab";
import { IncidentsTab } from "./components/IncidentsTab";
import { SettingsTab } from "./components/SettingsTab";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, error, googleTokens } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Redirect if not logged in
  if (!loading && !user) {
    router.replace("/");
    return null;
  }

  return (
    <DashboardLayout loading={loading} error={error}>
      <main className="flex flex-col gap-8 p-6 w-full h-full">
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        
          <TabsContent value="overview" className="mt-6">
            <OverviewTab user={user} googleTokens={googleTokens} />
          </TabsContent>
        
          <TabsContent value="incidents" className="mt-6">
            <IncidentsTab googleTokens={googleTokens} />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}