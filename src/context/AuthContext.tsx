import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types/auth';
import { AuthContext, STORAGE_KEY_ACCESS } from './authContextDef';

const STORAGE_KEY_REFRESH = 'enrivo_auth_refresh_token';
const STORAGE_KEY_USER = 'enrivo_auth_user';

const DEFAULT_AUTH_URL =
  (import.meta.env.VITE_AUTH_SERVICE_URL as string)?.replace(/\/$/, '') ||
  'https://its-seraj-auth-service.hf.space';

const GOOGLE_CLIENT_ID =
  ((import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '').trim();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_ACCESS);
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_REFRESH);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const authServiceUrl = DEFAULT_AUTH_URL;
  const googleClientId = GOOGLE_CLIENT_ID;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Save session state to localStorage
  const saveSession = (
    newUser: UserProfile,
    newAccessToken: string,
    newRefreshToken: string
  ) => {
    setUser(newUser);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEY_ACCESS, newAccessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH, newRefreshToken);
  };

  const clearSession = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ACCESS);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
  };

  // Refresh active session using refresh token
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const currentRefresh = localStorage.getItem(STORAGE_KEY_REFRESH);
    if (!currentRefresh) {
      clearSession();
      return false;
    }

    try {
      const res = await fetch(`${authServiceUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefresh }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const { accessToken: newAccess, refreshToken: newRefresh } = data.data;
        setAccessToken(newAccess);
        localStorage.setItem(STORAGE_KEY_ACCESS, newAccess);

        if (newRefresh) {
          setRefreshToken(newRefresh);
          localStorage.setItem(STORAGE_KEY_REFRESH, newRefresh);
        }
        return true;
      }
    } catch (err) {
      console.warn('Refresh request failed:', err);
    }

    clearSession();
    return false;
  }, [authServiceUrl]);

  // Initial token verification on load
  useEffect(() => {
    let isMounted = true;

    async function checkExistingAuth() {
      const storedAccess = localStorage.getItem(STORAGE_KEY_ACCESS);
      if (!storedAccess) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${authServiceUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedAccess}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.user && isMounted) {
            setUser(data.data.user);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.data.user));
          }
        } else if (res.status === 401) {
          const refreshed = await refreshSession();
          if (!refreshed && isMounted) {
            clearSession();
          }
        }
      } catch (err) {
        console.warn('Check existing auth failed:', err);
      }

      if (isMounted) setIsLoading(false);
    }

    checkExistingAuth();

    return () => {
      isMounted = false;
    };
  }, [authServiceUrl, refreshSession]);

  // Authenticate with Google ID Token via backend
  const loginWithGoogleIdToken = useCallback(
    async (idToken: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${authServiceUrl}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.data) {
          const { user: authedUser, accessToken: newAccess, refreshToken: newRefresh } = data.data;
          saveSession(authedUser, newAccess, newRefresh);
          setIsLoading(false);
          return true;
        }

        setError(data.error?.message || 'Authentication with Google failed.');
        setIsLoading(false);
        return false;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to reach auth backend: ${msg}`);
        setIsLoading(false);
        return false;
      }
    },
    [authServiceUrl]
  );

  // Trigger Google One Tap / Sign-In programmatically
  const triggerGoogleSignIn = useCallback(() => {
    setError(null);
    if (!googleClientId) {
      setError('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential: string }) => {
            if (response?.credential) {
              await loginWithGoogleIdToken(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.prompt();
      } catch (err) {
        console.error('Google Sign-In initialization failed:', err);
      }
    }
  }, [googleClientId, loginWithGoogleIdToken]);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    const currentRefresh = refreshToken || localStorage.getItem(STORAGE_KEY_REFRESH);
    const currentAccess = accessToken || localStorage.getItem(STORAGE_KEY_ACCESS);

    if (currentRefresh) {
      try {
        await fetch(`${authServiceUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentAccess ? { Authorization: `Bearer ${currentAccess}` } : {}),
          },
          body: JSON.stringify({ refreshToken: currentRefresh }),
        });
      } catch (err) {
        console.warn('Logout request failed:', err);
      }
    }

    clearSession();
    setIsLoading(false);
  }, [authServiceUrl, refreshToken, accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: Boolean(user),
        isLoading,
        error,
        authServiceUrl,
        googleClientId,
        loginWithGoogleIdToken,
        logout,
        refreshSession,
        clearError,
        triggerGoogleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
