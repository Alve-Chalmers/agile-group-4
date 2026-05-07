import { useCallback, useEffect, useState } from 'react';

import { getApiBaseUrl } from './api-base';
import { trpcServer } from './trpc';
import { router } from 'expo-router';
import { QueryClient } from '@tanstack/react-query';

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

type AuthSession = {
  user?: AuthUser;
  session?: {
    id: string;
    userId: string;
  };
};

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
const REQUEST_TIMEOUT_MS = 8000;

function authUrl(path: string) {
  return `${getApiBaseUrl()}/api/auth/${path}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}

async function parseError(res: Response) {
  let message = `Request failed (${res.status})`;

  try {
    const json = (await res.json()) as { message?: string; error?: string };
    if (typeof json.message === 'string') {
      message = json.message;
    } else if (typeof json.error === 'string') {
      message = json.error;
    }
  } catch {
    // Ignore malformed/non-JSON body and keep default message.
  }

  throw new Error(message);
}

async function authRequest(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(authUrl(path), {
      ...init,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'Session check timed out. Verify EXPO_PUBLIC_API_URL points to your running API.',
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    await parseError(res);
  }

  if (res.status === 204) {
    return null;
  }

  try {
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string) {
  await authRequest('sign-in/email', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signUpWithEmail(params: { email: string; password: string; name?: string }) {
  await authRequest('sign-up/email', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function signOut(queryClient?: QueryClient) {
  await authRequest('sign-out', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  queryClient?.clear();

  router.replace('/login');
}

export async function getSession() {
  const payload = await authRequest('get-session', {
    method: 'GET',
    headers: {},
  });

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload as AuthSession;
}

export async function getCurrentUser() {
  console.log('getCurrentUser');
  try {
    return await trpcServer.me.query();
  } catch {
    return null;
  }
}

export function useAuthSession() {
  const [state, setState] = useState<AuthState>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);

  const refresh = useCallback(async () => {
    setState('loading');

    try {
      const next = await getSession();
      setSession(next);

      if (next?.session) {
        setState('authenticated');
      } else {
        setState('unauthenticated');
      }
    } catch {
      setSession(null);
      setState('unauthenticated');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    session,
    state,
    refresh,
    getErrorMessage,
  };
}
