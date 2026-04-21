/**
 * Shared helper for all client-side calls to AI API routes.
 *
 * Automatically attaches the Supabase JWT as an Authorization header so
 * the server-side auth guard (getSessionFromRequest) can verify the user.
 * Falls back gracefully if no session is found.
 */
import { supabase } from '../lib/supabaseClient';

export async function aiRequest<T = any>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  // Grab the current session token — will be null if not logged in
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
