import { useState } from 'preact/hooks';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { supabase } from '../utils/supabase-client';

type Mode = 'signIn' | 'signUp';

export const Auth = ({
  onAuthenticated
}: {
  onAuthenticated: (session: Session) => void;
}) => {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      console.log('[auth] submitting', { mode, email: email.trim() });
      if (mode === 'signIn') {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        console.log('[auth] signIn result', { data, err });
        if (err) {
          setError(err.message);
          return;
        }
        if (data.session) onAuthenticated(data.session);
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });
        console.log('[auth] signUp result', { data, err });
        if (err) {
          setError(err.message);
          return;
        }
        if (data.session) {
          onAuthenticated(data.session);
        } else {
          setInfo('Check your email to confirm your account, then sign in.');
          setMode('signIn');
        }
      }
    } catch (e) {
      console.error('[auth] unexpected error', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="w-full">
      <h1 class="text-lg font-semibold m-0 mb-4 text-black">
        {mode === 'signIn' ? 'Sign in' : 'Create account'}
      </h1>

      <form onSubmit={handleSubmit} class="flex flex-col gap-3 mb-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          autocomplete="email"
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
          autocomplete={mode === 'signIn' ? 'current-password' : 'new-password'}
          disabled={loading}
        />

        {error && (
          <div class="text-state-danger text-xs">{error}</div>
        )}
        {info && (
          <div class="text-state-success text-xs">{info}</div>
        )}

        <Button type="submit" variant="primary" disabled={loading}>
          {loading
            ? '...'
            : mode === 'signIn'
              ? 'Sign in'
              : 'Sign up'}
        </Button>
      </form>

      <div class="text-center text-xs text-text-secondary">
        {mode === 'signIn' ? (
          <>
            No account?{' '}
            <button
              type="button"
              class="text-primary underline"
              onClick={() => {
                setMode('signUp');
                setError(null);
                setInfo(null);
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              class="text-primary underline"
              onClick={() => {
                setMode('signIn');
                setError(null);
                setInfo(null);
              }}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
};
