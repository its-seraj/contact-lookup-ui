import React, { useState } from 'react';
import {
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import type { ServerHealthInfo } from '../hooks/useServerHealth';
import { normalizeApiBase } from '../hooks/useServerHealth';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverUrl: string;
  onSaveServerUrl: (url: string) => void;
  isOnline: boolean | null;
  latencyMs: number | null;
  healthInfo: ServerHealthInfo | null;
  isChecking: boolean;
  onRefreshHealth: (url?: string) => void;
}

const SERVER_PRESETS = [
  {
    name: 'Hugging Face Space (Deployed)',
    url: 'https://its-seraj-contact-lookup.hf.space',
    description: 'Cloud production backend with MongoDB cache',
    badge: 'Production',
  },
  {
    name: 'Local Dev Server (Localhost)',
    url: 'http://127.0.0.1:8000',
    description: 'Local FastAPI / Python enrichment daemon',
    badge: 'Local',
  },
];

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  isOpen,
  onClose,
  serverUrl,
  onSaveServerUrl,
  isOnline,
  latencyMs,
  healthInfo,
  isChecking,
  onRefreshHealth,
}) => {
  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const target = normalizeApiBase(inputUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const start = performance.now();

      const res = await fetch(`${target}/api/health`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - start);

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          tested: true,
          ok: true,
          message: `Connected successfully (${elapsed}ms) • Version ${data.version || '1.0.0'}`,
        });
      } else {
        setTestResult({
          tested: true,
          ok: false,
          message: `Server returned HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: unknown) {
      setTestResult({
        tested: true,
        ok: false,
        message: (err as Error).message || 'Connection failed (CORS or server unreachable)',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const normalized = normalizeApiBase(inputUrl);
    onSaveServerUrl(normalized);
    onClose();
  };

  const handleSelectPreset = (url: string) => {
    setInputUrl(url);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#090f1f] border border-slate-700/80 rounded-3xl shadow-2xl text-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0d1428] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Backend Server Connection
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your active enrichment API endpoint
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          {/* Current Live Server Status Card */}
          <div className="p-4 rounded-2xl bg-[#060a14] border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Active Endpoint Status
              </span>
              <button
                type="button"
                onClick={() => onRefreshHealth()}
                disabled={isChecking}
                className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Check Now</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline === true
                      ? 'bg-emerald-400 animate-pulse'
                      : isOnline === false
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="font-mono text-xs font-semibold text-white break-all">
                  {serverUrl}
                </span>
              </div>

              {latencyMs !== null && (
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {latencyMs}ms
                </span>
              )}
            </div>

            {/* Health Info Badges */}
            {healthInfo && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Version:</span>
                  <span className="text-slate-200 font-semibold">{healthInfo.version || '1.0.0'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Cache:</span>
                  <span className="text-emerald-400 font-semibold">
                    {healthInfo.cache?.enabled ? 'MongoDB Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 block uppercase tracking-wider">
              Quick Server Presets
            </label>
            <div className="space-y-2">
              {SERVER_PRESETS.map((preset) => {
                const isSelected = normalizeApiBase(inputUrl) === normalizeApiBase(preset.url);
                return (
                  <div
                    key={preset.url}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-sky-950/30 border-sky-500/60 shadow-xs'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100 group-hover:text-white">
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-sm">
                        {preset.url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Server URL Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 block uppercase tracking-wider">
              Server Base URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setTestResult(null);
                }}
                placeholder="https://its-seraj-contact-lookup.hf.space"
                className="flex-1 px-3.5 py-2.5 bg-[#050812] border border-slate-800 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !inputUrl.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition cursor-pointer disabled:opacity-40"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.ok
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="flex-1 font-mono text-[11px]">{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1428] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition cursor-pointer"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
