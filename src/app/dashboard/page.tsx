"use client";
import { useOAuth } from "@/features/oauth/useOAuth";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { tokens, isAuthenticated } = useOAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by rendering nothing until client-side
    return null;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your dashboard.</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>OAuth Token Information</h2>
      <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4 }}>
        {JSON.stringify(tokens, null, 2)}
      </pre>
    </div>
  );
}
