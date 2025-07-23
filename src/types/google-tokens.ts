export interface GoogleTokens {
  access_token?: string;
  refresh_token?: string;
  email?: string;
  expiry_date?: number;
  [key: string]: unknown;
} 