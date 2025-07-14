import React from "react";
import { OAuthExample } from "@/components/oauth-example";

export function OAuthSection() {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-lg font-semibold mb-4 text-center">Reusable OAuth Service Example</h2>
      <div className="flex justify-center">
        <OAuthExample />
      </div>
    </div>
  );
}

export default OAuthSection; 