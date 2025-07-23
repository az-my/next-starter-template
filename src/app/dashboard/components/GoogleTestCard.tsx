
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GoogleTokens } from '@/types/google-tokens';

export function GoogleTestCard({ sheetId, folderId, googleTokens }: { sheetId: string; folderId: string; googleTokens: GoogleTokens }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheetResult, setSheetResult] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Real post to Google Sheet via API route
  const handlePostData = async () => {
    setSheetResult(null);
    try {
      const res = await fetch("/api/google/sheets-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId,
          googleTokens,
          data: ["Test Name", "Test Value", new Date().toISOString()],
        }),
      });
      const result: unknown = await res.json();
      if (res.ok) {
        setSheetResult("✅ Data posted to sheet!");
      } else {
        // Try to extract error message if possible
        let errorMsg = "Unknown error";
        if (
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof (result as { error?: unknown }).error === "string"
        ) {
          errorMsg = (result as { error: string }).error;
        }
        setSheetResult(`❌ Error: ${errorMsg}`);
      }
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setSheetResult(`❌ Error: ${message}`);
    }
  };

  // Real upload to Drive folder via API route
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadResult(null);
    setUploading(true);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setUploadResult("❌ No file selected");
      setUploading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("folderId", folderId);
      formData.append("googleTokens", JSON.stringify(googleTokens));
      formData.append("file", file);
      const res = await fetch("/api/google/drive-upload", {
        method: "POST",
        body: formData,
      });
      const result: unknown = await res.json();
      if (res.ok) {
        setUploadResult("✅ File uploaded to Drive folder!");
      } else {
        // Try to extract error message if possible
        let errorMsg = "Unknown error";
        if (
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof (result as { error?: unknown }).error === "string"
        ) {
          errorMsg = (result as { error: string }).error;
        }
        setUploadResult(`❌ Error: ${errorMsg}`);
      }
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setUploadResult(`❌ Error: ${message}`);
    }
    setUploading(false);
  };

  return (
    <Card className="p-4 w-full max-w-xl bg-muted rounded-lg mt-6">
      <h3 className="text-lg font-semibold mb-2">Google Integration Test</h3>
      <div className="mb-4">
        <Button onClick={handlePostData} disabled={!googleTokens || !sheetId}>
          Post Sample Data to Sheet
        </Button>
        {sheetResult && <div className="mt-2 text-green-700 text-sm">{sheetResult}</div>}
      </div>
      <form onSubmit={handleUpload} className="flex flex-col gap-2">
        <input ref={fileInputRef} type="file" name="file" disabled={!googleTokens || !folderId || uploading} />
        <Button type="submit" disabled={!googleTokens || !folderId || uploading}>
          {uploading ? "Uploading..." : "Upload File to Drive Folder"}
        </Button>
        {uploadResult && <div className="mt-2 text-green-700 text-sm">{uploadResult}</div>}
      </form>
    </Card>
  );
}
