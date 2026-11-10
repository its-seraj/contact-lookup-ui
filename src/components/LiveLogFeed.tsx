import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Check,
} from 'lucide-react';
import type { LogMessage, ScanStatus } from '../types/enrichment';

interface LiveLogFeedProps {
  logs: LogMessage[];
  status: ScanStatus;
  activeDomain: string | null;
  elapsedMs: number | null;
}

type LogFilter = 'all' | 'success' | 'warning' | 'progress' | 'skipped';

export const LiveLogFeed: React.FC<LiveLogFeedProps> = ({
  logs,
  status,
  activeDomain,
  elapsedMs,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeFilter, setActiveFilter] = useState<LogFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isExpanded]);

  // Filter logs based on category and search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (activeFilter !== 'all' && log.type !== activeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(q) ||
          log.domain.toLowerCase().includes(q) ||
          log.timestamp.includes(q)
        );
      }
      return true;
    });
  }, [logs, activeFilter, searchQuery]);

  // Pipeline stages calculation
  const stageStates = useMemo(() => {
    const text = logs.map((l) => l.message).join(' ').toLowerCase();
    return {
      mx: text.includes('mail:') || text.includes('mx host') || text.includes('google workspace'),
      sources: text.includes('discovering') || text.includes('github') || text.includes('linkedin'),
      pattern: text.includes('pattern:') || text.includes('{first}'),
      permute: text.includes('permute') || text.includes('verifying') || text.includes('permuting'),
      done: status === 'completed',
    };
  }, [logs, status]);

  const latestMessage = logs.length > 0 ? logs[logs.length - 1].message.trim() : '';

  // If there are no logs and idle, don't render
  if (logs.length === 0 && status === 'idle') {
    return null;
  }

  const getBadge = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            [+] FOUND
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            [!] WARN
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
            [-] SKIP
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30">
            [i] INTEL
          </span>
        );
      case 'progress':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            [*] EXEC
          </span>
        );
      default:
        return (
          <span className="inline-block w-4 text-center text-slate-600 font-mono text-[11px]">
            &gt;
          </span>
        );
    }
  };

  const getRowColor = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-300';
      case 'warning':
        return 'text-amber-300';
      case 'skipped':
        return 'text-slate-500';
      case 'info':
        return 'text-sky-300';
      case 'progress':
        return 'text-indigo-300';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="w-full bg-[#080d19] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl transition">
      {/* HUD Header Bar */}
      <div className="px-4 py-3 bg-[#0a1020]/95 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-white font-semibold">Agent Live Feed</span>

            {status === 'scanning' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-800 text-[11px] text-sky-300">
                <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                <span>Enriching {activeDomain || ''}</span>
              </span>
            )}

            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Done</span>
              </span>
            )}

            {status === 'aborted' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-[11px] text-amber-400">
                <AlertCircle className="w-3 h-3" />
                <span>Stopped</span>
              </span>
            )}
          </div>
        </div>

        {/* Right metrics and collapse toggle */}
        <div className="flex items-center gap-3">
          {elapsedMs !== null && (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              {(elapsedMs / 1000).toFixed(1)}s elapsed
            </span>
          )}

          <span className="text-[11px] font-mono text-slate-400">
            {logs.length} events
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={isExpanded ? 'Collapse activity HUD' : 'Expand activity HUD'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stepper Pipeline Trail */}
      <div className="px-4 py-2 bg-[#060a14] border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-500 uppercase tracking-wider text-[10px] shrink-0 font-sans font-semibold mr-1">
          Pipeline:
        </span>
        {[
          { label: 'DNS & MX', active: stageStates.mx },
          { label: 'Multi-Source Crawl', active: stageStates.sources },
          { label: 'Pattern Inference', active: stageStates.pattern },
          { label: 'SMTP Permutation', active: stageStates.permute },
          { label: 'Completed', active: stageStates.done },
        ].map((step, idx) => (
          <div key={step.label} className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono transition ${
                step.active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {step.active ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              )}
              <span>{step.label}</span>
            </span>
            {idx < 4 && <span className="text-slate-700 text-xs">&rarr;</span>}
          </div>
        ))}
      </div>

      {/* Collapsed Preview */}
      {!isExpanded && latestMessage && (
        <div className="px-4 py-2 bg-[#050811] text-xs font-mono text-slate-400 truncate flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500">Latest Event:</span>
            <span className="text-sky-300 truncate">{latestMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-[11px] text-sky-400 hover:underline shrink-0 cursor-pointer"
          >
            Show full feed
          </button>
        </div>
      )}

      {/* Expanded Logs Body */}
      {isExpanded && (
        <div>
          {/* Filter and Search Bar */}
          <div className="px-4 py-2 bg-[#070b16] border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'success', label: '[+] Found' },
                  { id: 'progress', label: '[*] Exec' },
                  { id: 'warning', label: '[!] Warnings' },
                  { id: 'skipped', label: '[-] Skipped' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-sky-600 text-white font-medium shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="pl-7 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-md text-[11px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Terminal Console View */}
          <div className="relative">
            <div
              ref={logContainerRef}
              className="max-h-60 min-h-[140px] overflow-y-auto p-3.5 space-y-1 font-mono text-xs bg-[#050811] divide-y divide-slate-900/50"
            >
              {filteredLogs.length === 0 ? (
                <div className="py-6 text-center text-slate-600 text-xs">
                  No log events match your filter criteria.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const raw = log.message.trim();
                  const hasBadge = /^\[[-+!*i]\]/.test(raw);
                  const cleanMsg = hasBadge ? raw.replace(/^\[[-+!*i]\]\s*/, '') : log.message;

                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2.5 py-1 leading-relaxed hover:bg-slate-900/40 px-1.5 rounded transition ${getRowColor(
                        log.type
                      )}`}
                    >
                      <span className="text-slate-600 text-[10px] select-none pt-0.5 w-16 shrink-0">
                        {log.timestamp}
                      </span>
                      <span className="select-none shrink-0 pt-0.5">{getBadge(log.type)}</span>
                      <span className="break-all whitespace-pre-wrap flex-1 text-[11px]">
                        {cleanMsg}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Autoscroll Toggle Pill */}
            <div className="absolute bottom-2.5 right-3">
              <button
                type="button"
                onClick={() => setAutoScroll(!autoScroll)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition cursor-pointer shadow-xs ${
                  autoScroll
                    ? 'bg-sky-950/90 border-sky-700 text-sky-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {autoScroll ? 'Auto-scroll: ON' : 'Auto-scroll: PAUSED'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
