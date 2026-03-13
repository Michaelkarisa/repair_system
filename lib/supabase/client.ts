import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Defer reads to call-time so Next.js static analysis at build time
// never throws "Missing env vars" during prerender passes.
function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Add them to .env.local and restart the dev server.'
    );
  }
  return { url, key };
}

// Singleton — one GoTrueClient instance in the browser, never created at
// module-evaluation time (avoids the build-time env-var throw).
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const { url, key } = getEnv();
    _client = createClient(url, key);
  }
  return _client;
}

/**
 * Convenience re-export for code that currently does `import { supabase }`.
 * Uses a Proxy so the client is only instantiated on first property access,
 * not at module load time.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});

/**
 * Server-action client. Safe to call `createClient` fresh here because
 * server actions run in Node.js — no shared browser auth state.
 * Do NOT use this in client components.
 */
export function createServerClient(accessToken?: string | null): SupabaseClient {
  const { url, key } = getEnv();
  if (accessToken) {
    return createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
  return createClient(url, key);
}

/** @deprecated Use `supabase` singleton or `createServerClient` in server actions. */
export const supabaseAdmin = supabase;