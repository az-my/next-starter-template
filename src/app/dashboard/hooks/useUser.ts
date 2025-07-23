import { useEffect, useState } from "react";
import { supabase } from "@/lib/utils";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleTokens, setGoogleTokens] = useState<any>(null);

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
      } catch (err: any) {
        setError(err?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    getUserAndSession();
  }, []);

  return { user, session, loading, error, googleTokens };
}
