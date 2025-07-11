"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SystemInfo } from "@/components/system-info";
import { SupabaseTableViewer } from "@/features/supabase/SupabaseTableViewer";
import { GoogleSheetsViewer } from "@/features/google-sheets/GoogleSheetsViewer";
import { useState } from "react";

export default function Home() {
  const [showSupabase, setShowSupabase] = useState(false);
  const [showSheets, setShowSheets] = useState(false);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 sm:p-20 gap-8 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-2xl flex flex-col items-center gap-4">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-2xl font-bold mt-2">Welcome to Next.js Starter</h1>
        <p className="text-center text-muted-foreground text-base">
          Get started by editing{" "}
          <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-mono font-semibold">
            src/app/page.tsx
          </code>
          .
          <br />
          Save and see your changes instantly.
        </p>
        <div className="flex gap-4 mt-2">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Button variant="outline" onClick={() => setShowSupabase((v) => !v)}>
            {showSupabase ? "Hide Supabase Table" : "Show Supabase Table"}
          </Button>
          <Button variant="outline" onClick={() => setShowSheets((v) => !v)}>
            {showSheets ? "Hide Google Sheets" : "Show Google Sheets"}
          </Button>
          <Link href="/drive-upload">
            <Button variant="outline">Drive Upload</Button>
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </header>
      {showSupabase && <SupabaseTableViewer />}
      {showSheets && <GoogleSheetsViewer />}
      <SystemInfo />
      <footer className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-6 mt-auto py-6 border-t border-gray-200 dark:border-gray-800">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
