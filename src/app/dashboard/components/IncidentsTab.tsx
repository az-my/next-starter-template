import { IncidentSerpoList } from "./IncidentSerpoList";
import { useIncidentManagement } from "../hooks/useIncidentManagement";
import { GoogleAuthAlert } from "./ui/GoogleAuthAlert";
import { SyncingBadge } from "./ui/SyncingBadge";
import { LoadingSkeleton } from "./ui/LoadingSkeleton";
import { ErrorAlert } from "./ui/ErrorAlert";
import { RefreshCw } from "lucide-react";

interface IncidentsTabProps {
  googleTokens: any;
}

export function IncidentsTab({ googleTokens }: IncidentsTabProps) {
  const { 
    incidents, 
    incidentsLoading, 
    incidentsError, 
    syncLoading, 
    syncError, 
    syncingId, 
    handleSync,
    refetch 
  } = useIncidentManagement({
    googleTokens
  });

  // Configuration - these should ideally come from environment variables or user settings
  const SHEET_ID = "your-google-sheet-id"; // Replace with actual sheet ID
  
  const handleSyncWithSheetId = (incident: any) => {
    handleSync(incident, SHEET_ID);
  };

  return (
    <div className="w-full space-y-6">
      {!googleTokens?.access_token && <GoogleAuthAlert />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Incident Management</h2>
          <p className="text-muted-foreground">View and manage incident data</p>
        </div>
        <div className="flex items-center gap-2">
          {syncLoading && <SyncingBadge />}
        </div>
      </div>
      
      {/* Main content */}
      {incidentsLoading ? (
        <LoadingSkeleton />
      ) : incidentsError ? (
        <ErrorAlert 
          title="Error loading incidents" 
          message={incidentsError.toString()} 
        />
      ) : (
        <IncidentSerpoList
          incidents={incidents}
          onSync={handleSyncWithSheetId}
          syncingId={syncingId}
          onRefresh={refetch}
        />
      )}
      
      {/* Error message */}
      {syncError && (
        <ErrorAlert 
          title="Sync Error" 
          message={syncError.toString()} 
          className="mt-4"
        />
      )}
    </div>
  );
}