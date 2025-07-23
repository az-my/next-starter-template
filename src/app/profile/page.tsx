"use client";

import { useUser } from "@/app/dashboard/hooks/useUser";
import { UserDetailsCard } from "@/app/dashboard/components/UserDetailsCard";
import { GoogleTestCard } from "@/app/dashboard/components/GoogleTestCard";
import { TopbarLayout } from "@/components/layouts/TopbarLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// --- Reusable Layout Component ---
interface PageLayoutProps {
  user: any;
  children: React.ReactNode;
}
const PageLayout = ({ user, children }: PageLayoutProps) => (
  <main className="flex flex-1 flex-col gap-6 p-4 md:p-8 w-full">
    {children}
  </main>
);

// --- Detailed Skeleton Component ---
const ProfilePageSkeleton = () => (
  <>
    <Skeleton className="h-9 w-1/3" />
    <Card>
      <CardHeader className="items-center text-center">
        <Skeleton className="h-7 w-24 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  </>
);

// --- Google Token Details Component (using ShadCN Alert) ---
interface GoogleTokenDetailsProps {
  tokens: any;
}
const GoogleTokenDetails = ({ tokens }: GoogleTokenDetailsProps) => (
  <>
    <Separator className="my-6" />
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Google Integration Details</AlertTitle>
      <AlertDescription>
        <div className="space-y-4 mt-2">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{tokens.email ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires:</span>
              <span>
                {tokens.expiry_date
                  ? new Date(tokens.expiry_date).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-muted rounded font-mono break-all">
              <strong>Access Token:</strong> {tokens.access_token ?? "N/A"}
            </div>
            <div className="p-2 bg-muted rounded font-mono break-all">
              <strong>Refresh Token:</strong> {tokens.refresh_token ?? "N/A"}
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  </>
);

// --- Main Page Component ---
export default function ProfilePage() {
  const { user, googleTokens, loading, error } = useUser();

  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-4xl mx-auto text-red-600">Error: {error}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <TopbarLayout user={user}>
      <div className="p-6 w-full h-full">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <UserDetailsCard user={user} googleTokens={googleTokens} />
            <GoogleTestCard 
              sheetId="your-google-sheet-id" 
              folderId="your-google-drive-folder-id" 
              googleTokens={googleTokens} 
            />
          </CardContent>
        </Card>
      </div>
    </TopbarLayout>
  );
}