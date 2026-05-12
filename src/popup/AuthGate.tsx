import { useEffect, useState } from 'preact/hooks';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase-client';
import { Auth } from './Auth';
import { Popup } from './Popup';

export const AuthGate = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setLoading(true), 300);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(loadingTimer);
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      clearTimeout(loadingTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div class="w-full text-center text-sm text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthenticated={setSession}/>;
  }

  return (
    <Popup
      userEmail={session.user.email}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
};
