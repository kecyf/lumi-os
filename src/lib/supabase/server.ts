import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabasePublishableKey, supabaseUrl } from './env';

export async function createServerSupabaseClient() {
  const url = supabaseUrl();
  const publishable = supabasePublishableKey();
  if (!url || !publishable) return null;

  const cookieStore = await cookies();

  return createServerClient(url, publishable, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, _headers) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot persist refreshed cookies; Proxy does.
        }
      },
    },
  });
}
