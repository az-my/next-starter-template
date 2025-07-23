"use client";

import { useUser } from "@/app/dashboard/hooks/useUser";
import { UserDetailsCard } from "@/app/dashboard/components/UserDetailsCard";
import { GoogleTestCard } from "@/app/dashboard/components/GoogleTestCard";
import { TopbarLayout } from "@/components/layouts/TopbarLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";


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
              googleTokens={googleTokens ?? {}} 
            />
          </CardContent>
        </Card>
      </div>
    </TopbarLayout>
  );
}