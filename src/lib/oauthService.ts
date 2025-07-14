const TOKEN_STORAGE_KEY = "google_oauth_tokens";

interface OAuthTokens {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

interface OAuthState {
  isAuthenticated: boolean;
  tokens: OAuthTokens | null;
  error: string | null;
}

class OAuthService {
  private static instance: OAuthService;
  private oauth2Client: unknown;
  private listeners: ((state: OAuthState) => void)[] = [];
  private currentState: OAuthState = {
    isAuthenticated: false,
    tokens: null,
    error: null
  };

  private constructor() {
    this.initializeOAuthClient();
    this.loadStoredTokens();
  }

  public static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  private initializeOAuthClient() {
    // This will be initialized on the server side when needed
    this.oauth2Client = null;
  }

  private loadStoredTokens() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        const tokens = JSON.parse(stored) as OAuthTokens;
        this.setTokens(tokens);
      }
    } catch (error) {
      console.error('Error loading stored tokens:', error);
      this.clearTokens();
    }
  }

  private saveTokens(tokens: OAuthTokens) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  private setTokens(tokens: OAuthTokens) {
    this.currentState.tokens = tokens;
    this.currentState.isAuthenticated = this.isTokenValid(tokens);
    this.currentState.error = null;
    this.saveTokens(tokens);
    this.notifyListeners();
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    this.currentState.tokens = null;
    this.currentState.isAuthenticated = false;
    this.notifyListeners();
  }

  private isTokenValid(tokens: OAuthTokens): boolean {
    if (!tokens.access_token) return false;
    
    // Check if token is expired
    if (tokens.expiry_date) {
      const now = Date.now();
      const expiryTime = tokens.expiry_date;
      // Add 5 minute buffer before expiry
      return now < (expiryTime - 5 * 60 * 1000);
    }
    
    // If no expiry date, assume valid for now
    return true;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentState));
  }

  // Public methods
  public subscribe(listener: (state: OAuthState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getState(): OAuthState {
    return { ...this.currentState };
  }

  public async getAuthUrl(): Promise<string> {
    try {
      const response = await fetch('/api/oauth/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }

      const data = await response.json() as { url: string };
      return data.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get auth URL';
      this.currentState.error = errorMessage;
      this.notifyListeners();
      throw error;
    }
  }

  public async handleAuthCallback(code: string): Promise<OAuthTokens> {
    try {
      const response = await fetch('/api/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json() as { tokens: OAuthTokens };
      const tokens = data.tokens;
      
      this.setTokens(tokens);
      return tokens;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      this.currentState.error = errorMessage;
      this.notifyListeners();
      throw error;
    }
  }

  public async refreshTokens(): Promise<OAuthTokens> {
    if (!this.currentState.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.currentState.tokens.refresh_token }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Token refresh failed');
      }

      const data = await response.json() as { tokens: OAuthTokens };
      const tokens = data.tokens;
      
      this.setTokens(tokens);
      return tokens;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      this.currentState.error = errorMessage;
      this.clearTokens(); // Clear invalid tokens
      this.notifyListeners();
      throw error;
    }
  }

  public async getValidTokens(): Promise<OAuthTokens> {
    if (!this.currentState.tokens) {
      throw new Error('No tokens available. Please authenticate first.');
    }

    if (this.isTokenValid(this.currentState.tokens)) {
      return this.currentState.tokens;
    }

    // Try to refresh tokens
    if (this.currentState.tokens.refresh_token) {
      return await this.refreshTokens();
    }

    throw new Error('Tokens expired and no refresh token available. Please re-authenticate.');
  }

  public logout() {
    this.clearTokens();
  }

  public isAuthenticated(): boolean {
    return this.currentState.isAuthenticated;
  }

  public getTokens(): OAuthTokens | null {
    return this.currentState.tokens;
  }
}

// Export singleton instance
export const oauthService = OAuthService.getInstance();
export type { OAuthTokens, OAuthState };