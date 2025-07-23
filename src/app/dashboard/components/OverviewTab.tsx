import Link from "next/link";
import { Card, CardTitle, CardDescription, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { ConnectGoogleButton } from "@/components/ConnectGoogleButton";

interface OverviewTabProps {
  user: any;
  googleTokens: any;
}

export function OverviewTab({ user, googleTokens }: OverviewTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Your Dashboard!</CardTitle>
        <CardDescription>
          This is your dashboard page. Here you can view and manage your application data and settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Google Integration Status</h3>
            <ConnectGoogleButton showStatusOnly />
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Raw User Data</h3>
            <div className="p-4 bg-muted rounded-md overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Raw Google OAuth Data</h3>
            <div className="p-4 bg-muted rounded-md overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(googleTokens, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary">
          Manage account settings →
        </Link>
      </CardFooter>
    </Card>
  );
}