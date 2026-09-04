export function supabaseUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return value || undefined;
}

export function supabasePublishableKey(): string | undefined {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return value || undefined;
}

export function supabaseSecretKey(): string | undefined {
  const value =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return value || undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseSecretKey());
}
