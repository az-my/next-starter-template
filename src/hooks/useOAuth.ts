import { useState, useEffect, useCallback } from 'react';
import { oauthService, OAuthState, OAuthTokens } from '@/lib/oauthService';

export function useOAuth() {
  const [state, setState] = useState<OAuthState>(oauthService.getState());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to OAuth state changes
    const unsubscribe = oauthService.subscribe(setState);
    return unsubscribe;
  }, []);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      const authUrl = await oauthService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCallback = useCallback(async (code: string, state?: string) => {
    try {
      setIsLoading(true);
      const tokens = await oauthService.handleAuthCallback(code, state);
      return tokens;
    } catch (error) {
      console.error('Callback handling failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    oauthService.logout();
  }, []);

  const getValidTokens = useCallback(async (): Promise<OAuthTokens> => {
    try {
      setIsLoading(true);
      return await oauthService.getValidTokens();
    } catch (error) {
      console.error('Failed to get valid tokens:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTokens = useCallback(async (): Promise<OAuthTokens> => {
    try {
      setIsLoading(true);
      return await oauthService.refreshTokens();
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isAuthenticated: state.isAuthenticated,
    tokens: state.tokens,
    error: state.error,
    isLoading,
    
    // Actions
    login,
    logout,
    handleCallback,
    getValidTokens,
    refreshTokens,
  };
}