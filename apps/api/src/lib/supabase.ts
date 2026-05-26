import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    cached = null;
    return cached;
  }

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

/** Scope 1: only reports whether credentials are present; no remote probe. */
export function supabaseConfigured(): boolean {
  return getSupabase() !== null;
}
