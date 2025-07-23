import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createPagesBrowserClient();
// Utility function for conditionally joining classNames (shadcn/ui standard)
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
} 