
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const supabase = createPagesBrowserClient();

export function getSupabaseServerClient() {
  return createServerComponentClient({ cookies });
}
