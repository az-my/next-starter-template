"use client";
// ...existing code...
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleOAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            let errorMsg = "Unknown error";
            if (error && typeof error === "object" && "error" in error && typeof (error as { error?: unknown }).error === "string") {
              errorMsg = (error as { error: string }).error;
            }
            alert("Google OAuth failed: " + errorMsg);
            return;
          }
          // Success: tokens stored, redirect to dashboard
          router.replace("/dashboard");
        })
        .catch((err) => {
          alert("Network error: " + String(err));
        });
    } else {
      alert("No OAuth code found in URL.");
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background w-full max-w-full">
      <div className="w-full max-w-sm p-6 rounded-xl shadow-lg bg-card flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 animate-spin">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
        </div>
        <h2 className="text-lg font-semibold text-center text-foreground">Connecting your Google account...</h2>
        <p className="text-muted-foreground text-center text-sm">Please wait while we complete the connection. You will be redirected to your dashboard automatically.</p>
        <div className="w-full flex justify-center mt-2">
          <div className="loader border-2 border-t-2 border-gray-200 border-t-blue-500 rounded-full w-6 h-6 animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
