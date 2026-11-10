import React from 'react';
import {
  Layers,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Server,
  Activity,
} from 'lucide-react';
import type { ScanStatus } from '../types/enrichment';

interface HeaderProps {
  status?: ScanStatus;
  isScanning?: boolean;
  totalResults?: number;
  onReset?: () => void;
  serverUrl?: string;
  isServerOnline?: boolean | null;
  serverLatencyMs?: number | null;
  onOpenServerModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status = 'idle',
  isScanning = false,
  totalResults = 0,
  onReset,
  serverUrl = 'https://its-seraj-contact-lookup.hf.space',
  isServerOnline = true,
  serverLatencyMs = null,
  onOpenServerModal,
}) => {
  const isHF = serverUrl.includes('hf.space');

  return (
    <header className="border-b border-slate-800/80 bg-[#080d19]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold ring-1 ring-white/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            {isScanning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Enrichment</span>
                <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  Agent
                </span>
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                PRO v2.4
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Waterfall Engine</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-source B2B intelligence &bull; Apollo, Hunter & Snov waterfall discovery
            </p>
          </div>
        </div>

        {/* Live Engine Status, Server Pill & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Server Connection Status Pill */}
          {onOpenServerModal && (
            <button
              type="button"
              onClick={onOpenServerModal}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                isServerOnline === true
                  ? 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  : isServerOnline === false
                  ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800/80 text-rose-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
              title="Click to configure backend server endpoint"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isServerOnline === true
                      ? 'bg-emerald-400 animate-pulse'
                      : isServerOnline === false
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                />
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline text-[11px] font-medium">
                  {isHF ? 'HF Cloud Space' : 'Custom Server'}
                </span>
                {serverLatencyMs !== null && (
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {serverLatencyMs}ms
                  </span>
                )}
              </div>
            </button>
          )}

          {/* Engine Scanning Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            {isScanning ? (
              <div className="flex items-center gap-1.5 text-sky-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="font-medium">Agent Active</span>
              </div>
            ) : status === 'completed' ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-medium">Scan Complete</span>
                {totalResults > 0 && (
                  <span className="text-slate-400 font-mono">({totalResults} enriched)</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-3 h-3 text-slate-500" />
                <span>Agent Idle</span>
              </div>
            )}
          </div>

          {totalResults > 0 && onReset && !isScanning && (
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-800 transition cursor-pointer"
              title="Reset results"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
