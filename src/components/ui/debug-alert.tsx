import * as React from "react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

export interface DebugAlertProps {
  title?: string;
  message: string;
  error?: unknown;
  onClose?: () => void;
}

export function DebugAlert({ title, message, error, onClose }: DebugAlertProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-md w-full p-4 relative">
        <Alert variant={error ? "destructive" : "default"}>
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>
            <div className="whitespace-pre-wrap break-all">{message}</div>

            {/* coerce error to boolean so the expression can only be `boolean | ReactNode` */}
            {!!error && (
              <pre className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-zinc-800 p-2 rounded">
                {typeof error === "string"
                  ? error
                  : error instanceof Error
                  ? error.stack || error.message
                  : JSON.stringify(error, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>

        <button
          className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
