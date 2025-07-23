import { Card, CardTitle, CardDescription, CardContent, CardHeader } from "@/components/ui/card";
import { ConnectGoogleButton } from "@/components/ConnectGoogleButton";
import { Separator } from "@/components/ui/separator";

export function SettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Settings</CardTitle>
        <CardDescription>
          Configure your dashboard preferences and integrations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Google Integration</h3>
            <p className="text-muted-foreground mb-4">Connect your Google account to enable Drive upload and Sheets sync.</p>
            <ConnectGoogleButton />
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-2">Display Preferences</h3>
            <p className="text-muted-foreground">Configure how your dashboard displays information.</p>
            {/* Add display settings controls here */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}