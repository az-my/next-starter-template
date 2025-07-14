"use client";
import { useOAuth } from "@/features/oauth/useOAuth";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function getProfileFromIdToken(idToken?: string) {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(atob(idToken.split(".")[1]));
    return {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

export default function Home() {
  const { isAuthenticated, isLoading, login, logout, tokens } = useOAuth();
  const profile = getProfileFromIdToken(tokens?.id_token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardTitle className="mb-4 text-center text-2xl font-bold">
          {isAuthenticated ? "Welcome!" : "Sign in with Google"}
        </CardTitle>
        <CardContent className="flex flex-col items-center gap-6">
          {!isAuthenticated ? (
            <Button onClick={login} disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
          ) : (
            <>
              {profile ? (
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={profile.picture} alt={profile.name} />
                    <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-lg font-semibold">{profile.name}</div>
                  <div className="text-sm text-muted-foreground">{profile.email}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No profile info available.</div>
              )}
              <CardDescription className="mt-4 mb-2 text-center">OAuth Token Details</CardDescription>
              <div className="w-full text-xs bg-muted p-2 rounded font-mono break-all">
                <div><b>Access Token:</b> {tokens?.access_token || "-"}</div>
                <div><b>ID Token:</b> {tokens?.id_token ? tokens.id_token.slice(0, 16) + "..." : "-"}</div>
                <div><b>Expires In:</b> {tokens?.expires_in ? tokens.expires_in + "s" : "-"}</div>
                <div><b>Scope:</b> {tokens?.scope || "-"}</div>
                <div><b>Token Type:</b> {tokens?.token_type || "-"}</div>
              </div>
              <Button onClick={logout} variant="outline" className="w-full mt-4">Logout</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
