import { useEffect, useState } from 'preact/hooks';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase-client';
import { Auth } from './Auth';
import { Popup } from './Popup';
import { Button } from '../components/Button';

export const AuthGate = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
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
    <div class="w-full">
      <div class="flex items-center justify-between mb-3 text-xs text-text-secondary">
        <span>{session.user.email}</span>
        <Button
          variant="secondary"
          flex={0}
          class="!px-2 !py-1 !text-xs"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </Button>
      </div>
      <Popup/>
    </div>
  );
};
