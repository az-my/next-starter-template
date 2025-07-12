"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, FileText, ExternalLink, Download } from "lucide-react";

interface UploadResult {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

export default function DriveUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [tokens, setTokens] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch("/api/drive-auth");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get auth URL');
      }
      
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setStatus("Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    
    if (code) {
      try {
        setIsLoading(true);
        setError(null);
        setStatus("Authenticating with Google...");
        
        const res = await fetch("/api/drive-auth-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Authentication failed');
        }
        
        const json = await res.json();
        
        if (json.tokens) {
          setTokens(json.tokens);
          setStatus("✅ Authenticated! You can now upload files.");
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          throw new Error(json.error || "OAuth failed");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setStatus("❌ Authentication failed");
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !tokens) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setStatus("Uploading...");
      setUploadResult(null);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tokens", JSON.stringify(tokens));
      
      const res = await fetch("/api/drive-oauth-upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const json = await res.json();
      
      if (json.success && json.file) {
        setStatus("✅ Upload successful!");
        setUploadResult(json.file);
        setFile(null); // Clear file input
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setStatus("❌ Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  // Persist tokens in localStorage after login
  useEffect(() => {
    if (tokens) {
      localStorage.setItem("drive_oauth_tokens", JSON.stringify(tokens));
    }
  }, [tokens]);

  // On mount, check for tokens in localStorage and handle OAuth callback
  useEffect(() => {
    const stored = localStorage.getItem("drive_oauth_tokens");
    if (stored) {
      try {
        const parsedTokens = JSON.parse(stored);
        setTokens(parsedTokens);
        setStatus("✅ Using saved authentication");
      } catch (err) {
        localStorage.removeItem("drive_oauth_tokens");
        handleOAuthCallback();
      }
    } else {
      handleOAuthCallback();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload to Google Drive
          </CardTitle>
          <CardDescription>
            Securely upload files to your Google Drive using OAuth2 authentication
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!tokens ? (
            <div className="text-center">
              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Login with Google
                  </>
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="file" className="text-sm font-medium">
                  Select File
                </label>
                <input
                  id="file"
                  type="file"
                  accept="application/pdf,image/*,text/plain,application/json,application/xml"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
                  required
                />
                <p className="text-xs text-gray-500">
                  Supported: PDF, Images, Text, JSON, XML (max 10MB)
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={!file || isLoading}
                className="w-full"
              >
                {isLoading ? (
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
            </form>
          )}
          
          {status && (
            <div className={`p-3 rounded-md text-sm ${
              status.includes('✅') 
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : status.includes('❌') 
                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              {status}
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {uploadResult && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 dark:text-green-200 text-lg">
                  ✅ Upload Successful!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>File:</strong> {uploadResult.name}
                </div>
                <div className="text-sm">
                  <strong>ID:</strong> {uploadResult.id}
                </div>
                <div className="flex gap-2">
                  {uploadResult.webViewLink && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(uploadResult.webViewLink, '_blank')}
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View in Drive
                    </Button>
                  )}
                  {uploadResult.webContentLink && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(uploadResult.webContentLink, '_blank')}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
