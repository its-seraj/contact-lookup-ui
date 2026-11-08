import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import type { LogMessage, ScanStatus } from '../types/enrichment';

interface LiveLogFeedProps {
  logs: LogMessage[];
  status: ScanStatus;
  activeDomain: string | null;
  elapsedMs: number | null;
}

export const LiveLogFeed: React.FC<LiveLogFeedProps> = ({
  logs,
  status,
  activeDomain,
  elapsedMs,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // If there are no logs and idle, don't show the feed
  if (logs.length === 0 && status === 'idle') {
    return null;
  }

  const getBadge = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            [+]
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-amber-950/80 text-amber-400 border border-amber-800/80">
            [!]
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-900 text-slate-400 border border-slate-800">
            [-]
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-sky-950/80 text-sky-400 border border-sky-800/80">
            [i]
          </span>
        );
      case 'progress':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
            [*]
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
        return 'text-slate-400';
    }
  };

  const latestMessage = logs.length > 0 ? logs[logs.length - 1].message.trim() : '';

  return (
    <div className="w-full bg-[#0a0e17] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-semibold">Live Backend Stream</span>

            {status === 'scanning' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-[11px] text-sky-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Scanning {activeDomain || ''}...</span>
              </span>
            )}

            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Finished</span>
              </span>
            )}

            {status === 'error' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-[11px] text-rose-400">
                <XCircle className="w-3 h-3" />
                <span>Error</span>
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

        <div className="flex items-center gap-3">
          {elapsedMs !== null && (
            <span className="text-[11px] font-mono text-slate-500">
              {(elapsedMs / 1000).toFixed(1)}s elapsed
            </span>
          )}

          <span className="text-[11px] font-mono text-slate-500">
            {logs.length} logs
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={isExpanded ? "Collapse logs" : "Expand logs"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsed Single Line Preview */}
      {!isExpanded && latestMessage && (
        <div className="px-4 py-2 bg-[#080b12] text-xs font-mono text-slate-400 truncate flex items-center gap-2">
          <span className="text-slate-600">Latest:</span>
          <span className="truncate">{latestMessage}</span>
        </div>
      )}

      {/* Expanded Logs Body */}
      {isExpanded && (
        <div className="relative">
          <div
            ref={logContainerRef}
            className="max-h-64 min-h-[140px] overflow-y-auto p-3.5 space-y-1 font-mono text-xs bg-[#070a10]"
          >
            {logs.map((log) => {
              // Strip bracket prefixes if we render badge separately
              const raw = log.message.trim();
              const hasBadge = /^\[[+!*i\-]\]/.test(raw);
              const cleanMsg = hasBadge ? raw.replace(/^\[[+!*i\-]\]\s*/, '') : log.message;

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-0.5 leading-relaxed hover:bg-slate-900/40 px-1 rounded transition ${getRowColor(
                    log.type
                  )}`}
                >
                  <span className="text-slate-600 text-[10px] select-none pt-0.5 w-14 shrink-0">
                    {log.timestamp}
                  </span>
                  <span className="select-none shrink-0 pt-0.5">
                    {getBadge(log.type)}
                  </span>
                  <span className="break-all whitespace-pre-wrap flex-1">
                    {cleanMsg}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Autoscroll Toggle Pill */}
          <div className="absolute bottom-2 right-3">
            <button
              type="button"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition ${
                autoScroll
                  ? 'bg-sky-950/80 border-sky-800 text-sky-400'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {autoScroll ? 'Auto-scroll on' : 'Auto-scroll paused'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
