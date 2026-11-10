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
import { mergeRows, replaceDomain } from '../utils/rowKey';
import { normalizeApiBase, STORAGE_KEY_SERVER_URL } from './useServerHealth';

function parseLogType(message: string): LogMessage['type'] {
  const trimmed = message.trim();
  if (trimmed.startsWith('[+]')) return 'success';
  if (trimmed.startsWith('[!]')) return 'warning';
  if (trimmed.startsWith('[-]')) return 'skipped';
  if (trimmed.startsWith('[i]')) return 'info';
  if (trimmed.startsWith('[*]')) return 'progress';
  return 'detail';
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useScanStream() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [results, setResults] = useState<ContactRow[]>([]);
  const [counts, setCounts] = useState<ScanCounts | null>(null);
  const [meta, setMeta] = useState<ScanMeta | null>(null);
  const [domainMetas, setDomainMetas] = useState<Record<string, ScanMeta>>({});
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Latest pipeline stage reported by a `partial` event. */
  const [stage, setStage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);
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
    cancelledRef.current = true;
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
    setDomainMetas({});
    setElapsedMs(null);
    setError(null);
    setStage(null);
  }, []);

  const loadSampleData = useCallback(() => {
    reset();
    setStatus('completed');
    setActiveDomain(SAMPLE_META.domain || 'sample.com');
    setLogs(
      SAMPLE_LOGS.map((message, index) => ({
        id: `sample-${index}`,
        domain: SAMPLE_META.domain || 'sample.com',
        message,
        timestamp: new Date().toLocaleTimeString(),
        type: parseLogType(message),
      }))
    );
    setResults(SAMPLE_ROWS);
    setCounts(SAMPLE_COUNTS);
    setMeta(SAMPLE_META);
    setDomainMetas({ [SAMPLE_META.domain || 'bamboobox.ai']: SAMPLE_META });
    setElapsedMs(3400);
    setStage('completed');
  }, [reset]);

  const simulateStreamDemo = useCallback(async () => {
    reset();
    cancelledRef.current = false;
    setStatus('scanning');
    const demoDomain = SAMPLE_META.domain || 'sample.com';
    setActiveDomain(demoDomain);

    for (const message of SAMPLE_LOGS) {
      if (cancelledRef.current) return;
      appendLog(demoDomain, message);
      await sleep(45);
    }

    // Rows arrive in chunks, the way the real backend emits partial stages.
    const chunkSize = Math.max(1, Math.ceil(SAMPLE_ROWS.length / 4));
    for (let index = 0; index < SAMPLE_ROWS.length; index += chunkSize) {
      if (cancelledRef.current) return;
      const chunk = SAMPLE_ROWS.slice(index, index + chunkSize);
      setResults((prev) => mergeRows(prev, chunk, [], demoDomain));
      setStage(index === 0 ? 'discovered' : `permuting:${index / chunkSize}`);
      await sleep(450);
    }

    if (cancelledRef.current) return;
    setCounts(SAMPLE_COUNTS);
    setMeta(SAMPLE_META);
    setDomainMetas({ [SAMPLE_META.domain || 'bamboobox.ai']: SAMPLE_META });
    setElapsedMs(3400);
    setStage('completed');
    setStatus('completed');
  }, [appendLog, reset]);

  const stopScan = useCallback(() => {
    cancelledRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('aborted');
    appendLog(activeDomain || 'system', '  [!] Scan cancelled by user.');
  }, [activeDomain, appendLog]);

  const handleEvent = useCallback(
    (event: ScanEvent) => {
      switch (event.type) {
        case 'start':
          setActiveDomain(event.domain);
          appendLog(event.domain, `  [*] Scan started for domain: ${event.domain}`);
          break;

        case 'log':
          appendLog(event.domain, event.message);
          break;

        case 'partial':
          // Incremental rows: upsert by person, apply deletions.
          setResults((prev) =>
            mergeRows(prev, event.rows || [], event.removed || [], event.domain)
          );
          setStage(event.stage);
          break;

        case 'cached':
          setCounts(event.counts ?? null);
          if (event.meta) {
            setMeta(event.meta);
            setDomainMetas((prev) => ({
              ...prev,
              [event.domain]: event.meta!,
            }));
          }
          appendLog(
            event.domain,
            `  [i] Served from cache (scanned ${event.scanned_at || 'earlier'})`
          );
          break;

        case 'result':
          // Authoritative for this domain: replace, never append.
          setResults((prev) => replaceDomain(prev, event.domain, event.rows || []));
          if (event.meta) {
            const timings = event.meta.timings || event.timings;
            const updatedMeta: ScanMeta = {
              ...event.meta,
              ...(timings ? { timings } : {}),
            };
            setMeta(updatedMeta);
            setDomainMetas((prev) => ({
              ...prev,
              [event.domain]: updatedMeta,
            }));
          }
          if (event.counts) setCounts(event.counts);
          setStage(event.cached ? 'cached' : 'result');
          break;

        case 'done':
          setElapsedMs(event.elapsed_ms);
          setStatus('completed');
          appendLog(
            'system',
            `  [+] Done! Processed ${event.domains} domain(s) in ${(event.elapsed_ms / 1000).toFixed(1)}s`
          );
          break;

        case 'error':
          setError(event.message);
          appendLog(event.domain || 'system', `  [!] Error: ${event.message}`);
          break;
      }
    },
    [appendLog]
  );

  const startScan = useCallback(
    async (request: ScanRequest, customBaseUrl?: string) => {
      if (!request.domains.length) {
        setError('Please enter at least one domain.');
        return;
      }

      reset();
      cancelledRef.current = false;
      setStatus('scanning');
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const savedUrl =
        typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SERVER_URL) : null;
      const targetBase = normalizeApiBase(customBaseUrl || savedUrl);
      const endpoint = `${targetBase}/api/scan`;

      try {
        appendLog(request.domains[0], `  [*] Connecting to ${endpoint}...`);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
              handleEvent(JSON.parse(trimmed) as ScanEvent);
            } catch {
              appendLog(activeDomain || 'stream', trimmed);
            }
          }
        }

        if (buffer.trim()) {
          try {
            handleEvent(JSON.parse(buffer.trim()) as ScanEvent);
          } catch {
            // ignore trailing partial JSON
          }
        }

        setStatus((prev) => (prev === 'scanning' ? 'completed' : prev));
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          setStatus('aborted');
          return;
        }
        const errMsg =
          err instanceof Error ? err.message : 'Failed to connect to backend scan API';
        setError(errMsg);
        setStatus('error');
        appendLog('system', `  [!] Error: ${errMsg}`);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [activeDomain, appendLog, handleEvent, reset]
  );

  return {
    status,
    isScanning: status === 'scanning',
    activeDomain,
    stage,
    logs,
    results,
    counts,
    meta,
    domainMetas,
    elapsedMs,
    error,
    startScan,
    stopScan,
    reset,
    loadSampleData,
    simulateStreamDemo,
  };
}
