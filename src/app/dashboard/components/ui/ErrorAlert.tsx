import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorAlertProps {
  title: string;
  message: string;
  className?: string;
}

export function ErrorAlert({ title, message, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}