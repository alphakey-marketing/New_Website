/**
 * Server-side Supabase helper for Next.js API routes.
 *
 * Creates a per-request Supabase client that reads the session from
 * the Authorization header (Bearer token) sent by the browser.
 *
 * Usage in an API route:
 *   import { getSessionFromRequest } from '../../../lib/supabaseServer';
 *   const session = await getSessionFromRequest(req);
 *   if (!session) return res.status(401).json({ error: 'Unauthorized' });
 */
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest } from 'next';

export async function getSessionFromRequest(req: NextApiRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // The browser sends the JWT as "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return null;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
