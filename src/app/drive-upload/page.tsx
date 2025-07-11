"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DriveUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [tokens, setTokens] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<null | { id: string; webViewLink?: string; webContentLink?: string }>(null);

  async function handleLogin() {
    const res = await fetch("/api/drive-auth");
    const { url } = (await res.json()) as { url: string };
    window.location.href = url;
  }

  async function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setStatus("Authenticating with Google...");
      const res = await fetch("/api/drive-auth-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = (await res.json()) as { tokens?: Record<string, unknown>; error?: string };
      if (json.tokens) {
        setTokens(json.tokens);
        setStatus("Authenticateddd! You can now upload files.");
      } else {
        setStatus(json.error || "OAuth failed");
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !tokens) return;
    setStatus("Uploading...");
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tokens", JSON.stringify(tokens));
    try {
      const res = await fetch("/api/drive-oauth-upload", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as {
        success?: boolean;
        file?: { id: string; webViewLink?: string; webContentLink?: string };
        error?: string;
      };
      if (json.success && json.file) {
        setStatus("Uploaded!");
        setUploadResult(json.file);
      } else {
        setStatus(json.error || "Upload failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setStatus(errorMessage);
    }
  }

  // Persist tokens in localStorage after login
  useEffect(() => {
    if (tokens) {
      localStorage.setItem("drive_oauth_tokens", JSON.stringify(tokens));
    }
  }, [tokens]);

  // On mount, check for tokens in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("drive_oauth_tokens");
    if (stored) {
      setTokens(JSON.parse(stored));
    } else {
      handleOAuthCallback();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Upload to Google Drive (OAuth2)</h1>
      {!tokens ? (
        <Button onClick={handleLogin}>Login with Google</Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
          />
          <Button type="submit" disabled={!file}>Upload</Button>
        </form>
      )}
      {status && <div className="mt-4 text-sm">{status}</div>}
      {uploadResult && (
        <div className="mt-2 text-sm">
          File ID: {uploadResult.id}<br />
          {uploadResult.webViewLink && (
            <a href={uploadResult.webViewLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">View in Drive</a>
          )}<br />
          {uploadResult.webContentLink && (
            <a href={uploadResult.webContentLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Direct Download</a>
          )}
        </div>
      )}
    </div>
  );
}
