"use client";

import { useState } from "react";
import { useOAuth } from "@/hooks/useOAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export function SheetsSyncExample() {
  const { isAuthenticated, login, logout, getValidTokens } = useOAuth();
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Incident Data");

  const handleSheetsSync = async () => {
    if (!isAuthenticated) {
      alert("Please authenticate first");
      return;
    }

    if (!spreadsheetId.trim()) {
      alert("Please enter a Google Spreadsheet ID");
      return;
    }

    setSyncLoading(true);
    setSyncResult(null);

    try {
      const tokens = await getValidTokens();
      if (!tokens) {
        throw new Error("Failed to get valid tokens");
      }

      const response = await fetch("/api/incident-serpo-sync-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          tokens, 
          spreadsheetId: spreadsheetId.trim(),
          sheetName: sheetName.trim() || "Incident Data"
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSyncResult(`✅ Success: ${result.message}\n📊 Records synced: ${result.recordCount}\n📋 Spreadsheet: ${result.spreadsheetId}\n📄 Sheet: ${result.sheetName}`);
      } else {
        setSyncResult(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      setSyncResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Google Sheets Integration
        </CardTitle>
        <CardDescription>
          Sync incident data from Supabase to Google Sheets using OAuth authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Authentication Status:</span>
            <Badge variant={isAuthenticated ? "default" : "secondary"} className="flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Authenticated
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Not Authenticated
                </>
              )}
            </Badge>
          </div>
          
          <Button
            onClick={isAuthenticated ? logout : login}
            variant={isAuthenticated ? "outline" : "default"}
            size="sm"
          >
            {isAuthenticated ? "Logout" : "Login with Google"}
          </Button>
        </div>

        <Separator />

        {/* Sheets Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Google Sheets Configuration</h3>
          
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Spreadsheet ID</label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="Enter Google Spreadsheet ID (e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isAuthenticated}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can find this in your Google Sheets URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sheet Name</label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Sheet name (default: Incident Data)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isAuthenticated}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Sync Action */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Data Synchronization</h3>
          
          {!isAuthenticated ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please authenticate with Google first to sync data to Google Sheets.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Exports incident data from Supabase to Google Sheets</p>
                <p>• Creates the sheet if it doesn't exist</p>
                <p>• Adds headers automatically</p>
                <p>• Marks synced records to avoid duplicates</p>
              </div>
              
              <Button 
                onClick={handleSheetsSync}
                disabled={syncLoading || !spreadsheetId.trim()}
                className="w-full"
              >
                {syncLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing to Google Sheets...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync to Google Sheets
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Results */}
        {syncResult && (
          <Alert variant={syncResult.includes('✅') ? 'default' : 'destructive'}>
            <AlertDescription className="whitespace-pre-line font-mono text-xs">
              {syncResult}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}