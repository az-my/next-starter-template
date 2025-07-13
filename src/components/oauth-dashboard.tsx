"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Key, 
  Upload, 
  RefreshCw,
  Clock,
  User,
  FileText,
  Activity,
  AlertTriangle
} from "lucide-react";
import { useOAuth } from "@/hooks/useOAuth";
import { OAuthExample } from "@/components/oauth-example";

/**
 * Comprehensive OAuth Management Dashboard Component
 * Provides a centralized interface for managing Google OAuth authentication
 */
export function OAuthDashboard() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [sheetsSyncLoading, setSheetsSyncLoading] = useState(false);
  const [sheetsSyncResult, setSheetsSyncResult] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Incident Data");
  const [syncResult, setSyncResult] = useState<string | null>(null);
  
  const { 
    isAuthenticated, 
    tokens, 
    error, 
    isLoading, 
    login, 
    logout, 
    getValidTokens 
  } = useOAuth();

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    
    try {
      setUploadLoading(true);
      setUploadResult(null);
      
      const validTokens = await getValidTokens();
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('tokens', JSON.stringify(validTokens));
      
      const response = await fetch('/api/drive-upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setUploadResult(`✅ File uploaded successfully: ${result.file?.name}`);
      } else {
        setUploadResult(`❌ Upload failed: ${result.error}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setUploadResult(`❌ Upload failed: ${errorMessage}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncLoading(true);
      setSyncResult(null);
      
      const validTokens = await getValidTokens();
      
      const response = await fetch('/api/incident-serpo-sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: validTokens }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSyncResult(`✅ Sync completed: ${result.message || 'Success'}`);
      } else {
        setSyncResult(`❌ Sync failed: ${result.error}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setSyncResult(`❌ Sync failed: ${errorMessage}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSheetsSync = async () => {
    if (!isAuthenticated) {
      alert("Please authenticate first");
      return;
    }

    if (!spreadsheetId.trim()) {
      alert("Please enter a Google Spreadsheet ID");
      return;
    }

    setSheetsSyncLoading(true);
    setSheetsSyncResult(null);

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
        setSheetsSyncResult(`✅ Sheets sync completed: ${result.message}\nRecords synced: ${result.recordCount}\nSpreadsheet: ${result.spreadsheetId}\nSheet: ${result.sheetName}`);
      } else {
        setSheetsSyncResult(`❌ Sheets sync failed: ${result.error}`);
      }
    } catch (error) {
      setSheetsSyncResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSheetsSyncLoading(false);
    }
  };

  const formatTokenExpiry = (expiryDate?: number) => {
    if (!expiryDate) return 'Unknown';
    const date = new Date(expiryDate);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 0) return 'Expired';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OAuth Management</h2>
          <p className="text-muted-foreground">
            Manage Google authentication and integrate with Drive services
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Authenticated
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Not Authenticated
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="example">Integration Example</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Authentication Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Authentication</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {isAuthenticated ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-700 dark:text-green-400">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700 dark:text-red-400">
                        Inactive
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-2">
                  {!isAuthenticated ? (
                    <Button 
                      onClick={login} 
                      disabled={isLoading}
                      size="sm"
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-3 w-3" />
                          Login with Google
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={logout} 
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Logout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Token Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Token Status</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {tokens ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Access Token:</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Refresh Token:</span>
                      <Badge variant={tokens.refresh_token ? "outline" : "destructive"}>
                        {tokens.refresh_token ? 'Available' : 'Missing'}
                      </Badge>
                    </div>
                    {tokens.expiry_date && (
                      <div className="flex items-center justify-between text-xs">
                        <span>Expires in:</span>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-2 w-2" />
                          {formatTokenExpiry(tokens.expiry_date)}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No tokens available</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => window.location.href = '/drive-upload'}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Upload className="mr-2 h-3 w-3" />
                  Upload Files
                </Button>
                <Button 
                  onClick={handleSync}
                  disabled={!isAuthenticated || syncLoading}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {syncLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Sync Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sync Result */}
          {syncResult && (
            <Alert variant={syncResult.includes('✅') ? 'default' : 'destructive'}>
              <AlertDescription>{syncResult}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* File Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files to Google Drive</CardTitle>
              <CardDescription>
                Upload files directly to your Google Drive using OAuth authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Please authenticate with Google first to upload files.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select File</label>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleFileUpload}
                    disabled={!uploadFile || uploadLoading}
                    className="w-full"
                  >
                    {uploadLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload to Drive
                      </>
                    )}
                  </Button>
                  
                  {uploadResult && (
                    <Alert variant={uploadResult.includes('✅') ? 'default' : 'destructive'}>
                      <AlertDescription>{uploadResult}</AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sync Tab */}
        <TabsContent value="sync" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Drive Sync */}
            <Card>
              <CardHeader>
                <CardTitle>Google Drive Sync</CardTitle>
                <CardDescription>
                  Sync incident images to Google Drive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Please authenticate with Google first to sync data.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Available Operations:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Sync incident images to Google Drive</li>
                        <li>• Update file permissions and sharing</li>
                        <li>• Backup application data</li>
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={handleSync}
                      disabled={syncLoading}
                      className="w-full"
                    >
                      {syncLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Syncing to Drive...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync to Drive
                        </>
                      )}
                    </Button>
                    
                    {syncResult && (
                      <Alert variant={syncResult.includes('✅') ? 'default' : 'destructive'}>
                        <AlertDescription>{syncResult}</AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Sheets Sync */}
            <Card>
              <CardHeader>
                <CardTitle>Google Sheets Sync</CardTitle>
                <CardDescription>
                  Export incident data to Google Sheets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Please authenticate with Google first to sync data.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Spreadsheet ID</label>
                        <input
                          type="text"
                          value={spreadsheetId}
                          onChange={(e) => setSpreadsheetId(e.target.value)}
                          placeholder="Enter Google Spreadsheet ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Sheet Name</label>
                        <input
                          type="text"
                          value={sheetName}
                          onChange={(e) => setSheetName(e.target.value)}
                          placeholder="Sheet name (default: Incident Data)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSheetsSync}
                      disabled={sheetsSyncLoading || !spreadsheetId.trim()}
                      className="w-full"
                    >
                      {sheetsSyncLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Syncing to Sheets...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Sync to Sheets
                        </>
                      )}
                    </Button>
                    
                    {sheetsSyncResult && (
                      <Alert variant={sheetsSyncResult.includes('✅') ? 'default' : 'destructive'}>
                        <AlertDescription className="whitespace-pre-line">{sheetsSyncResult}</AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Example Tab */}
        <TabsContent value="example" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Example</CardTitle>
              <CardDescription>
                See how the OAuth service can be integrated into other components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OAuthExample />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}