import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

/**
 * Single browser-side Supabase client — one instance per app.
 * All client components should import and use this singleton to avoid
 * "Multiple GoTrueClient instances" warnings.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-action Supabase client.
 *
 * In server actions (Node.js, no browser state) it is safe to create a new
 * client per request because there is no shared localStorage. When an
 * accessToken is provided, RLS policies using auth.uid() work correctly.
 *
 * Do NOT call this in client components — use the `supabase` singleton instead.
 */
export function createServerClient(accessToken?: string | null) {
  if (accessToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    });
  }
  // Unauthenticated anon client (RLS will block most operations).
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * @deprecated Use `supabase` singleton in client code or
 * `createServerClient(token)` in server actions.
 * Kept only for backward-compatibility; points at the same singleton.
 */
export const supabaseAdmin = supabase;