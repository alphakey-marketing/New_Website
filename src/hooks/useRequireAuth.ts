import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

/**
 * Shared authentication hook for task-related pages.
 * Redirects to /tasks/login when no session is active.
 * Prevents the duplicate data-load that occurs when getUser() and
 * onAuthStateChange both fire on the same mount.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Tracks whether the initial load has already been triggered so that the
  // onAuthStateChange listener does not fire a duplicate load on mount.
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: initialUser } }) => {
      if (initialUser) {
        setUser(initialUser);
        hasLoadedRef.current = true;
      } else {
        router.push('/tasks/login');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        hasLoadedRef.current = true;
      } else {
        hasLoadedRef.current = false;
        setUser(null);
        router.push('/tasks/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return { user, loading };
}
