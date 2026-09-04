import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseSecretKey, supabaseUrl } from './env';

export function createAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const url = supabaseUrl();
  const secret = supabaseSecretKey();
  if (!url || !secret) return null;

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
