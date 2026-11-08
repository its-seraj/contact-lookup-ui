import { useState, useRef, useCallback } from 'react';
import type {
  ContactRow,
  LogMessage,
  ScanCounts,
  ScanEvent,
  ScanMeta,
  ScanRequest,
  ScanStatus,
} from '../types/enrichment';
import { SAMPLE_COUNTS, SAMPLE_LOGS, SAMPLE_META, SAMPLE_ROWS } from '../data/sampleData';

function parseLogType(message: string): LogMessage['type'] {
  const trimmed = message.trim();
  if (trimmed.startsWith('[+]')) return 'success';
  if (trimmed.startsWith('[!]')) return 'warning';
  if (trimmed.startsWith('[-]')) return 'skipped';
  if (trimmed.startsWith('[i]')) return 'info';
  if (trimmed.startsWith('[*]')) return 'progress';
  return 'detail';
}

export function useScanStream() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [results, setResults] = useState<ContactRow[]>([]);
  const [counts, setCounts] = useState<ScanCounts | null>(null);
  const [meta, setMeta] = useState<ScanMeta | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const logIdCounter = useRef(0);

  const appendLog = useCallback((domain: string, message: string) => {
    logIdCounter.current += 1;
    const newLog: LogMessage = {
      id: `log-${logIdCounter.current}-${Date.now()}`,
      domain,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type: parseLogType(message),
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('idle');
    setActiveDomain(null);
    setLogs([]);
    setResults([]);
    setCounts(null);
    setMeta(null);
    setElapsedMs(null);
    setError(null);
  }, []);

  const stopScan = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('aborted');
    appendLog(activeDomain || 'system', '  [!] Scan cancelled by user.');
  }, [activeDomain, appendLog]);

  const loadSampleData = useCallback(() => {
    reset();
    setStatus('completed');
    setActiveDomain('bamboobox.ai');
    setElapsedMs(113532);

    const formattedLogs: LogMessage[] = SAMPLE_LOGS.map((msg, idx) => ({
      id: `sample-log-${idx}`,
      domain: 'bamboobox.ai',
      message: msg,
      timestamp: new Date().toLocaleTimeString(),
      type: parseLogType(msg),
    }));

    setLogs(formattedLogs);
    setResults(SAMPLE_ROWS);
    setCounts(SAMPLE_COUNTS);
    setMeta(SAMPLE_META);
  }, [reset]);

  const simulateStreamDemo = useCallback(async () => {
    reset();
    setStatus('scanning');
    setActiveDomain('bamboobox.ai');
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    appendLog('bamboobox.ai', '  [*] Initiating simulation scan...');

    for (let i = 0; i < SAMPLE_LOGS.length; i++) {
      if (controller.signal.aborted) return;
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (controller.signal.aborted) return;
      appendLog('bamboobox.ai', SAMPLE_LOGS[i]);
    }

    if (controller.signal.aborted) return;
    setResults(SAMPLE_ROWS);
    setCounts(SAMPLE_COUNTS);
    setMeta(SAMPLE_META);
    setElapsedMs(113532);
    setStatus('completed');
    abortControllerRef.current = null;
  }, [appendLog, reset]);

  const startScan = useCallback(
    async (request: ScanRequest, customBaseUrl?: string) => {
      if (!request.domains.length) {
        setError('Please enter at least one domain.');
        return;
      }

      reset();
      setStatus('scanning');
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Determine endpoint
      const rawBase = customBaseUrl?.trim() ? customBaseUrl.trim().replace(/\/$/, '') : '';
      let endpoint = '/api/scan';
      if (rawBase) {
        // Replace 0.0.0.0 with 127.0.0.1 because browsers cannot route to 0.0.0.0 on Windows
        const normalized = rawBase.replace(/:\/\/0\.0\.0\.0/, '://127.0.0.1');
        endpoint = normalized.endsWith('/api/scan') ? normalized : `${normalized}/api/scan`;
      }

      try {
        appendLog(request.domains[0], `  [*] Connecting to ${endpoint}...`);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported or empty response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
              const event: ScanEvent = JSON.parse(trimmed);

              switch (event.type) {
                case 'start':
                  setActiveDomain(event.domain);
                  appendLog(event.domain, `  [*] Scan started for domain: ${event.domain}`);
                  break;

                case 'log':
                  appendLog(event.domain, event.message);
                  break;

                case 'result':
                  if (event.rows && Array.isArray(event.rows)) {
                    setResults((prev) => [...prev, ...event.rows]);
                  }
                  if (event.meta) setMeta(event.meta);
                  if (event.counts) setCounts(event.counts);
                  break;

                case 'done':
                  setElapsedMs(event.elapsed_ms);
                  setStatus('completed');
                  appendLog('system', `  [+] Done! Processed ${event.domains} domain(s) in ${(event.elapsed_ms / 1000).toFixed(1)}s`);
                  break;

                case 'error':
                  setError(event.message);
                  appendLog(event.domain || 'system', `  [!] Error: ${event.message}`);
                  break;
              }
            } catch {
              // Non-JSON line or formatted log message
              appendLog(activeDomain || 'stream', trimmed);
            }
          }
        }

        // Process leftover buffer
        if (buffer.trim()) {
          try {
            const event: ScanEvent = JSON.parse(buffer.trim());
            if (event.type === 'result' && event.rows) {
              setResults((prev) => [...prev, ...event.rows]);
            }
          } catch {
            // Ignore
          }
        }

        setStatus((prev) => (prev === 'scanning' ? 'completed' : prev));
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          setStatus('aborted');
          return;
        }

        const errMsg = err instanceof Error ? err.message : 'Failed to connect to backend scan API';
        setError(errMsg);
        setStatus('error');
        appendLog('system', `  [!] Error: ${errMsg}`);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [activeDomain, appendLog, reset]
  );

  return {
    status,
    isScanning: status === 'scanning',
    activeDomain,
    logs,
    results,
    counts,
    meta,
    elapsedMs,
    error,
    startScan,
    stopScan,
    reset,
    loadSampleData,
    simulateStreamDemo,
  };
}
