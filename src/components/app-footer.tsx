import Image from "next/image";
import React from "react";

export function AppFooter() {
  return (
    <footer className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-6 mt-auto py-6 border-t border-gray-200 dark:border-gray-800">
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://nextjs.org/learn"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
        Learn
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://vercel.com/templates"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
        Examples
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://nextjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
        Go to nextjs.org →
      </a>
    </footer>
  );
}

export default AppFooter; 