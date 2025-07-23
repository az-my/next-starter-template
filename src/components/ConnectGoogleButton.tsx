import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConnectGoogleButtonProps {
  showStatusOnly?: boolean;
}

export function ConnectGoogleButton({ showStatusOnly = false }: ConnectGoogleButtonProps) {
  const [status, setStatus] = useState<'connected' | 'not_connected' | 'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(null);
  const [googleInfo, setGoogleInfo] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setStatus('loading');
    setError(null);
    setErrorDetails(null);
    try {
    setMessage(null);
      const res = await fetch('/api?action=google-status', { credentials: 'include' });
      if (!res.ok) {
        setStatus('error');
        setError('Unable to check Google connection. Please log in first.');
        setErrorDetails(await res.json());
        return;
      }
      // Fix: cast data to expected type
      const data = (await res.json()) as { connected?: boolean; tokens?: Record<string, unknown>; message?: string };
      setStatus(data.connected ? 'connected' : 'not_connected');
      if (data.connected && data.tokens) {
        setGoogleInfo(data.tokens);
      } else {
        setGoogleInfo(null);
      }
      setMessage(data.message ?? null);
    } catch (err) {
      setStatus('error');
      setError('Network error. Please try again.');
      setErrorDetails(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (status === 'connected') {
      toast.success('Google account connected successfully!');
    }
  }, [status]);

  async function handleConnect() {
    setStatus('loading');
    setError(null);
    setErrorDetails(null);
    setMessage(null);
    try {
      const res = await fetch('/api?action=google-auth-url', { credentials: 'include' });
      if (res.status === 401) {
        setStatus('error');
        setError('You must be logged in to connect your Google account.');
        setErrorDetails(await res.json());
        return;
      }
      if (!res.ok) {
        setStatus('error');
        setError('Failed to get Google OAuth URL.');
        setErrorDetails(await res.json());
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setStatus('error');
      setError('Network error. Please try again.');
      setErrorDetails(err);
    }
  }

  // TODO: If you want to handle the OAuth state in the URL after redirect,
  // you can parse window.location.search or window.location.hash here and show feedback.
  // For now, the dashboard just checks connection status on mount.

  if (status === 'loading') {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking Google connection...
      </Button>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <Button variant="outline" className="w-full border-green-500 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" disabled>
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
          Google Connected
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-300">Active</Badge>
        </Button>
        
        {/* Only show token/account details if NOT showStatusOnly */}
        {!showStatusOnly && googleInfo && (
          <Card className="w-full mt-2 bg-muted/50">
            <CardContent className="pt-4 pb-2 px-4 text-sm">
              {message && (
                <Alert variant="default" className="mb-2 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-muted-foreground">Scope:</div>
                <div className="font-medium">{String(googleInfo.scope ?? 'N/A')}</div>
                
                <div className="text-muted-foreground">Token Type:</div>
                <div className="font-medium">{String(googleInfo.token_type ?? 'N/A')}</div>
                
                <div className="text-muted-foreground">Expiry:</div>
                <div className="font-medium">{
                  googleInfo.expiry_date && (typeof googleInfo.expiry_date === 'string' || typeof googleInfo.expiry_date === 'number')
                    ? new Date(googleInfo.expiry_date).toLocaleString()
                    : 'N/A'
                }</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Google Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        {(typeof errorDetails === 'string' || (typeof errorDetails === 'object' && errorDetails !== null)) && (
          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                <AlertCircle className="mr-2 h-3 w-3" />
                View Error Details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2 bg-destructive/5 border-destructive/20">
                <CardContent className="pt-4 text-xs">
                  <pre className="whitespace-pre-wrap break-words text-xs">{typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}</pre>
                  <div className="mt-2 text-destructive">
                    <strong>Potential root causes:</strong>
                    <ul className="list-disc ml-5 mt-1 space-y-1">
                      <li>Session expired or not set (try logging in again)</li>
                      <li>API route misconfiguration or missing cookies</li>
                      <li>Supabase project keys or environment variables incorrect</li>
                      <li>Network issues or CORS errors</li>
                      <li>Google OAuth credentials not set up properly</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        <Button className="mt-2" onClick={fetchStatus}>
          <Loader2 className="mr-2 h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  // Not connected
  return (
    <Button 
      className="w-full" 
      onClick={handleConnect} 
      aria-label="Connect Google Account"
    >
      <svg width="16" height="16" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l6.1-6.1C34.5 5.1 29.6 3 24 3c-7.2 0-13.2 4.1-16.7 10.1z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 18.3 15 24 15c3.1 0 5.9 1.1 8.1 3l6.1-6.1C34.5 5.1 29.6 3 24 3c-7.2 0-13.2 4.1-16.7 10.1z"/><path fill="#FBBC05" d="M24 45c5.8 0 10.7-2.1 14.6-5.7l-7-5.7C29.8 36 24 36 24 36c-6.6 0-12-5.4-12-12 0-1.1.1-2.1.3-3.1l-7-5.1C3.1 17.1 3 20.5 3 24c0 11.6 9.4 21 21 21z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l6.1-6.1C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-8.5 20-21 0-1.4-.1-2.4-.3-3.5z"/></g></svg>
      Connect Google Account
      <ExternalLink className="ml-2 h-3 w-3" />
    </Button>
  );
}
