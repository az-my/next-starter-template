import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function GoogleAuthAlert() {
  return (
    <Alert variant="default" className="mb-6 border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
      <AlertTitle>Google OAuth Required</AlertTitle>
      <AlertDescription>
        Please connect your Google account to enable Drive upload and Sheets sync functionality.
      </AlertDescription>
    </Alert>
  );
}