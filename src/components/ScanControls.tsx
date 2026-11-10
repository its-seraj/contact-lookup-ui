import React, { useState } from 'react';
import {
  Mail,
  Play,
  Square,
  RotateCcw,
  Sliders,
  Cpu,
} from 'lucide-react';
import { LinkedinIcon } from './Icons';

interface ScanControlsProps {
  isVerify: boolean;
  onChangeVerify: (val: boolean) => void;
  isLinkedin: boolean;
  onChangeLinkedin: (val: boolean) => void;
  onStartScan: () => void;
  onStopScan: () => void;
  onReset: () => void;
  isScanning: boolean;
  hasResults: boolean;
  disabled: boolean;
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  isVerify,
  onChangeVerify,
  isLinkedin,
  onChangeLinkedin,
  onStartScan,
  onStopScan,
  onReset,
  isScanning,
  hasResults,
  disabled,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-3 pt-1">
      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Toggle: LinkedIn Discovery */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isScanning && onChangeLinkedin(!isLinkedin)}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !isScanning) {
              e.preventDefault();
              onChangeLinkedin(!isLinkedin);
            }
          }}
          className={`md:col-span-4 p-3.5 rounded-xl border transition select-none flex items-center justify-between group ${
            isScanning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-slate-700'
          } ${
            isLinkedin
              ? 'bg-gradient-to-r from-blue-950/30 to-slate-900/80 border-blue-900/40 shadow-xs'
              : 'bg-slate-900/40 border-slate-800/80'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`p-2 rounded-lg mt-0.5 ${
                isLinkedin
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700/60'
              }`}
            >
              <LinkedinIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100 group-hover:text-white transition">
                LinkedIn Discovery
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Profile matching & role verification
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium font-mono">
                {isLinkedin ? (
                  <span className="text-sky-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>Enabled</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Disabled</span>
                )}
              </div>
            </div>
          </div>

          <div
            role="switch"
            aria-checked={isLinkedin}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isLinkedin ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isLinkedin ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Toggle: Deep Email Verification */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isScanning && onChangeVerify(!isVerify)}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !isScanning) {
              e.preventDefault();
              onChangeVerify(!isVerify);
            }
          }}
          className={`md:col-span-4 p-3.5 rounded-xl border transition select-none flex items-center justify-between group ${
            isScanning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-slate-700'
          } ${
            isVerify
              ? 'bg-gradient-to-r from-emerald-950/30 to-slate-900/80 border-emerald-900/40 shadow-xs'
              : 'bg-slate-900/40 border-slate-800/80'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`p-2 rounded-lg mt-0.5 ${
                isVerify
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700/60'
              }`}
            >
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100 group-hover:text-white transition">
                Email Verification
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                SMTP handshake & catch-all check
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium font-mono">
                {isVerify ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Port 25 Direct</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Disabled</span>
                )}
              </div>
            </div>
          </div>

          <div
            role="switch"
            aria-checked={isVerify}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isVerify ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isVerify ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-4 flex items-center gap-2">
          {!isScanning ? (
            <button
              type="button"
              onClick={onStartScan}
              disabled={disabled}
              className="flex-1 h-12 px-5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white transition group-hover:scale-110" />
              <span>Start Enrichment</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-black/25 rounded border border-white/20 font-mono text-white/90">
                ↵
              </kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopScan}
              className="flex-1 h-12 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-[0.98] transition cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white animate-pulse" />
              <span>Stop Agent</span>
            </button>
          )}

          {(hasResults || isScanning) && (
            <button
              type="button"
              onClick={onReset}
              disabled={isScanning}
              className="h-12 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition disabled:opacity-40 flex items-center justify-center cursor-pointer"
              title="Reset query and clear results"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-12 px-3 rounded-xl border text-xs transition flex items-center justify-center cursor-pointer ${
              showAdvanced
                ? 'bg-slate-800 text-sky-400 border-sky-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
            title="Toggle waterfall sources & engine parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Waterfall Pipeline Info Drawer */}
      {showAdvanced && (
        <div className="p-4 rounded-xl bg-[#080d19] border border-slate-800/90 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Multi-Source Waterfall Pipeline</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Auto-cascade strategy active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
            {[
              { name: 'Hunter.io', desc: 'API Waterfall', status: 'Ready' },
              { name: 'Apollo.io', desc: 'Company Dossier', status: 'Ready' },
              { name: 'Snov.io', desc: 'Pattern Inference', status: 'Ready' },
              { name: 'Prospeo', desc: 'Email Permuter', status: 'Ready' },
              { name: 'GitHub Org', desc: 'Team Members', status: 'Native' },
              { name: 'Web Crawler', desc: 'About & Press', status: 'Native' },
            ].map((source) => (
              <div
                key={source.name}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">{source.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{source.desc}</p>
                <span className="inline-block mt-1 text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                  {source.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
