"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle, XCircle } from "lucide-react";
import { useOAuth } from "@/hooks/useOAuth";

/**
 * Example component showing how to use the reusable OAuth service
 * in any feature that needs Google authentication
 */
export function OAuthExample() {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);
  
  const { 
    isAuthenticated, 
    tokens, 
    error, 
    isLoading, 
    login, 
    logout, 
    getValidTokens 
  } = useOAuth();

  const handleSomeAction = async () => {
    try {
      setActionLoading(true);
      setActionResult(null);
      
      // Get valid tokens (will refresh automatically if needed)
      const validTokens = await getValidTokens();
      
      // Use tokens for any Google API call
      console.log('Using tokens for action:', validTokens);
      
      // Simulate some action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActionResult('✅ Action completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setActionResult(`❌ Action failed: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          OAuth Example
        </CardTitle>
        <CardDescription>
          Demonstrates reusable OAuth service usage
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Authentication Status */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-400">
                Authenticated
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">
                Not authenticated
              </span>
            </>
          )}
        </div>

        {/* Token Info */}
        {tokens && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div>Access Token: {tokens.access_token ? '***SET***' : 'MISSING'}</div>
            <div>Refresh Token: {tokens.refresh_token ? '***SET***' : 'MISSING'}</div>
            {tokens.expiry_date && (
              <div>Expires: {new Date(tokens.expiry_date).toLocaleString()}</div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {!isAuthenticated ? (
            <Button 
              onClick={login} 
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Login with Google'
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSomeAction} 
                disabled={actionLoading}
                className="w-full"
                size="sm"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Perform Action'
                )}
              </Button>
              
              <Button 
                onClick={logout} 
                variant="outline"
                className="w-full"
                size="sm"
              >
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Results */}
        {actionResult && (
          <div className={`p-2 rounded text-xs ${
            actionResult.includes('✅') 
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {actionResult}
          </div>
        )}

        {/* Errors */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}