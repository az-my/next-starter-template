import { useEffect, useState } from "react";
import { supabase } from "@/lib/utils";
import type { User, Session } from "@supabase/supabase-js";
import type { GoogleTokens } from '@/types/google-tokens';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleTokens, setGoogleTokens] = useState<GoogleTokens | null>(null);

  useEffect(() => {
    const getUserAndSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setError(userError.message || "Failed to fetch user");
        }
        setUser(userData.user);
        setGoogleTokens(userData.user?.user_metadata?.google_tokens ?? null);

        // Fetch session info
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(sessionError.message || "Failed to fetch session");
        }
        setSession(sessionData.session);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    getUserAndSession();
  }, []);

  return { user, session, loading, error, googleTokens };
}
