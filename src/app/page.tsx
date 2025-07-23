"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/utils";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);
      if (data.user) {
        router.replace("/dashboard");
      }
    };
    getUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background w-full max-w-full">
        <Card className="w-full max-w-sm">
          <CardTitle className="text-center text-2xl font-bold mt-6">
            <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
          </CardTitle>
          <CardContent className="flex flex-col items-center gap-6 mt-4 mb-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user) return null;

  const handleSignIn = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google" });
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background w-full max-w-full">
      <Card className="w-full max-w-sm">
        <CardTitle className="text-center text-2xl font-bold mt-6">
          Sign in with Google
        </CardTitle>
        <CardContent className="flex flex-col items-center gap-6 mt-4 mb-6">
          <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
