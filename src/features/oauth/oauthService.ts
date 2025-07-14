export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
  [key: string]: any;
}

export interface OAuthState {
  isAuthenticated: boolean;
  tokens: OAuthTokens | null;
  error: string | null;
}

type Listener = (state: OAuthState) => void;

class OAuthService {
  private listeners: Listener[] = [];
  private state: OAuthState = {
    isAuthenticated: false,
    tokens: null,
    error: null,
  };

  constructor() {
    // Rehydrate tokens from localStorage if present
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oauth_tokens');
      if (saved) {
        try {
          const tokens = JSON.parse(saved);
          this.setTokens(tokens);
        } catch {}
      }
    }
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  getState(): OAuthState {
    return this.state;
  }

  setTokens(tokens: OAuthTokens) {
    this.state = {
      ...this.state,
      tokens,
      isAuthenticated: true,
      error: null,
    };
    // Persist tokens to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('oauth_tokens', JSON.stringify(tokens));
    }
    this.notifyListeners();
  }

  logout() {
    this.state = {
      ...this.state,
      tokens: null,
      isAuthenticated: false,
      error: null,
    };
    // Remove tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oauth_tokens');
    }
    this.notifyListeners();
  }

  async getAuthUrl(): Promise<string> {
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
      this.state = { ...this.state, error: errorMessage };
      this.notifyListeners();
      throw error;
    }
  }

  async handleAuthCallback(code: string): Promise<OAuthTokens> {
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
      this.state = { ...this.state, error: errorMessage };
      this.notifyListeners();
      throw error;
    }
  }

  async getValidTokens(): Promise<OAuthTokens> {
    if (this.state.tokens) {
      return this.state.tokens;
    }
    throw new Error('No tokens available');
  }

  async refreshTokens(): Promise<OAuthTokens> {
    // Implement refresh logic if needed
    throw new Error('Not implemented');
  }
}

export const oauthService = new OAuthService(); 