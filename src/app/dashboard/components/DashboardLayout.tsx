import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DashboardLayoutProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export function DashboardLayout({ loading, error, children }: DashboardLayoutProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-8 w-48 mt-4" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-2/3 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <div className="mt-6 flex flex-col gap-4 items-center">
              <Skeleton className="h-12 w-48 mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Alert variant="destructive">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground">Please try refreshing the page or logging in again.</p>
              <Link href="/" className="underline text-primary">Return to Login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}