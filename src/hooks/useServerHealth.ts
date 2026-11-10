import { useState, useEffect, useCallback } from 'react';

export interface ServerHealthInfo {
  status: string;
  version?: string;
  cache?: {
    enabled?: boolean;
    from?: string;
    db?: string;
    collection?: string;
    error?: string;
  };
  port25?: unknown;
  max_domains_per_request?: number;
}

export const STORAGE_KEY_SERVER_URL = 'enrichment_server_url';
export const DEFAULT_SERVER_URL =
  (import.meta.env.VITE_API_BASE_URL as string)?.trim() ||
  'https://its-seraj-contact-lookup.hf.space';

export function normalizeApiBase(url?: string | null): string {
  if (!url || !url.trim()) return DEFAULT_SERVER_URL;
  let cleaned = url.trim().replace(/\/$/, '');
  cleaned = cleaned.replace(/\/api\/health$/, '');
  cleaned = cleaned.replace(/\/api\/scan$/, '');
  cleaned = cleaned.replace(/\/api$/, '');
  cleaned = cleaned.replace(/:\/\/0\.0\.0\.0/, '://127.0.0.1');
  return cleaned;
}

export function useServerHealth() {
  const [serverUrl, setServerUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_SERVER_URL);
      if (saved) return normalizeApiBase(saved);
    }
    return DEFAULT_SERVER_URL;
  });

  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [healthInfo, setHealthInfo] = useState<ServerHealthInfo | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async (urlToCheck?: string) => {
    const targetBase = normalizeApiBase(urlToCheck || serverUrl);
    setIsChecking(true);
    const start = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${targetBase}/api/health`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      const elapsed = Math.round(performance.now() - start);

      if (res.ok) {
        const data: ServerHealthInfo = await res.json();
        setIsOnline(true);
        setLatencyMs(elapsed);
        setHealthInfo(data);
        setLastChecked(new Date());
        return { ok: true, data, latencyMs: elapsed };
      } else {
        setIsOnline(false);
        setLatencyMs(null);
        setHealthInfo(null);
        setLastChecked(new Date());
        return { ok: false, error: `HTTP ${res.status}` };
      }
    } catch (err: unknown) {
      setIsOnline(false);
      setLatencyMs(null);
      setHealthInfo(null);
      setLastChecked(new Date());
      return { ok: false, error: (err as Error).message || 'Connection failed' };
    } finally {
      setIsChecking(false);
    }
  }, [serverUrl]);

  const updateServerUrl = useCallback((newUrl: string) => {
    const normalized = normalizeApiBase(newUrl);
    setServerUrl(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SERVER_URL, normalized);
    }
    checkHealth(normalized);
  }, [checkHealth]);

  // Initial check on mount
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (active) {
        await checkHealth();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [checkHealth]);

  return {
    serverUrl,
    updateServerUrl,
    isOnline,
    latencyMs,
    healthInfo,
    isChecking,
    lastChecked,
    checkHealth,
  };
}
