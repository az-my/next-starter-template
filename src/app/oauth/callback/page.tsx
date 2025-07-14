"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOAuth } from "@/features/oauth/useOAuth";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = useOAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleCallback(code)
        .then(() => {
          router.replace("/dashboard");
        })
        .catch(() => {
          router.replace("/dashboard?error=oauth");
        });
    } else {
      router.replace("/dashboard?error=missing_code");
    }
    // eslint-disable-next-line
  }, []);

  return null;
} 