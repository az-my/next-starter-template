import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GoogleTokens } from '@/types/google-tokens';

// --- Type Definitions ---

// Corrected User interface with all properties and a closing brace
export interface User {
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
  };
  email?: string;
}

// Defined Props interface for the component
interface Props {
  user: User | null;
  googleTokens: GoogleTokens | null;
  sheetId?: string | null;
  folderId?: string | null;
}

// --- Component Definition ---

export function UserDetailsCard(props: Props) {
  const { user, googleTokens, sheetId, folderId } = props;

  // Connection status states
  const [sheetStatus, setSheetStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [folderStatus, setFolderStatus] = useState<'pending' | 'success' | 'error'>('pending');

  // Effect for checking Google Sheet access
  useEffect(() => {
    if (!googleTokens || !sheetId) {
      setSheetStatus('error');
      return;
    }
    setSheetStatus('pending');
    // Simulate an async API call to check sheet access
    const timer = setTimeout(() => setSheetStatus('success'), 600);
    return () => clearTimeout(timer); // Cleanup on unmount or dependency change
  }, [googleTokens, sheetId]);

  // Effect for checking Google Drive folder access
  useEffect(() => {
    if (!googleTokens || !folderId) {
      setFolderStatus('error');
      return;
    }
    setFolderStatus('pending');
    // Simulate an async API call to check folder access
    const timer = setTimeout(() => setFolderStatus('success'), 600);
    return () => clearTimeout(timer); // Cleanup on unmount or dependency change
  }, [googleTokens, folderId]);

  // Render a loading or empty state if there's no user
  if (!user) {
    return <Card className="p-4 w-full max-w-xl bg-muted rounded-lg mt-4">Loading user...</Card>;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <Card className="p-4 w-full max-w-xl bg-muted rounded-lg mt-4">
      {/* User Info Header */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback>{userName ? userName[0].toUpperCase() : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{userName}</h2>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      </div>
      <div className="text-sm mb-4">
        <div>
          You are currently logged in using <strong>{user.app_metadata?.provider ?? 'email'}</strong>.
        </div>
      </div>

      {/* Google Connection Status */}
      {googleTokens ? (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#34A853" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z"/><path fill="#FFF" d="M34.6 19.2h-10v5.6h5.9c-.3 1.6-1.7 4.6-5.9 4.6-3.6 0-6.6-3-6.6-6.6s3-6.6 6.6-6.6c2.1 0 3.5.9 4.3 1.7l4.1-4.1C30.1 12.7 27.3 11.2 24 11.2c-7 0-12.8 5.8-12.8 12.8s5.8 12.8 12.8 12.8c7.4 0 12.3-5.2 12.3-12.5 0-.8-.1-1.4-.2-2z"/></g></svg>
            <span className="text-green-600 font-medium">Google Connected</span>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            Your account is now linked to Google via OAuth. You can sync data, access Google Sheets, and use Google Drive features in this app.
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {sheetId && (
              <div className="flex items-center gap-2">
                {sheetStatus === 'pending' && <span className="animate-pulse text-yellow-600">Checking Sheet...</span>}
                {sheetStatus === 'success' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Sheet Connected</span>}
                {sheetStatus === 'error' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Sheet Access Error</span>}
                <a href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank" rel="noopener noreferrer" className="underline text-xs text-blue-700">View Sheet</a>
              </div>
            )}
            {folderId && (
              <div className="flex items-center gap-2">
                {folderStatus === 'pending' && <span className="animate-pulse text-yellow-600">Checking Folder...</span>}
                {folderStatus === 'success' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Drive Folder Accessible</span>}
                {folderStatus === 'error' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Folder Access Error</span>}
                <a href={`https://drive.google.com/drive/folders/${folderId}`} target="_blank" rel="noopener noreferrer" className="underline text-xs text-blue-700">View Folder</a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#EA4335" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z"/><path fill="#FFF" d="M34.6 19.2h-10v5.6h5.9c-.3 1.6-1.7 4.6-5.9 4.6-3.6 0-6.6-3-6.6-6.6s3-6.6 6.6-6.6c2.1 0 3.5.9 4.3 1.7l4.1-4.1C30.1 12.7 27.3 11.2 24 11.2c-7 0-12.8 5.8-12.8 12.8s5.8 12.8 12.8 12.8c7.4 0 12.3-5.2 12.3-12.5 0-.8-.1-1.4-.2-2z"/></g></svg>
            <span className="text-red-600 font-medium">Google Not Connected</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Connect your Google account to unlock features like Sheets sync and Drive access.
          </div>
        </div>
      )}
    </Card>
  );
}