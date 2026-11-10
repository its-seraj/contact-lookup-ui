import React from 'react';
import { Mail, Play, Square, RotateCcw, ShieldCheck, Search } from 'lucide-react';
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#0d1322] p-4 rounded-2xl border border-slate-800/80 shadow-xl shadow-black/20">
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
        className={`md:col-span-4 p-3 rounded-xl border transition select-none flex items-center justify-between group ${
          isScanning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-slate-700/80'
        } ${
          isLinkedin
            ? 'bg-slate-900/80 border-slate-800 shadow-sm shadow-sky-500/5'
            : 'bg-slate-900/40 border-slate-800/60'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
            <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>LinkedIn Discovery</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            {isLinkedin ? (
              <span className="flex items-center gap-1 text-sky-400 font-medium">
                <Search className="w-3 h-3" />
                <span>Enabled</span>
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Disabled</span>
            )}
          </div>
        </div>

        <div
          role="switch"
          aria-checked={isLinkedin}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            isLinkedin ? 'bg-sky-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isLinkedin ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
      </div>

      {/* Toggle: Email Verification */}
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
        className={`md:col-span-4 p-3 rounded-xl border transition select-none flex items-center justify-between group ${
          isScanning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-slate-700/80'
        } ${
          isVerify
            ? 'bg-slate-900/80 border-slate-800 shadow-sm shadow-emerald-500/5'
            : 'bg-slate-900/40 border-slate-800/60'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span>Email Verification</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            {isVerify ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Enabled</span>
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Disabled</span>
            )}
          </div>
        </div>

        <div
          role="switch"
          aria-checked={isVerify}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            isVerify ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
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
            className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Scan & Enrich</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopScan}
            className="flex-1 h-11 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 active:scale-[0.98] transition animate-pulse"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Stop Scan</span>
          </button>
        )}

        {(hasResults || isScanning) && (
          <button
            type="button"
            onClick={onReset}
            disabled={isScanning}
            className="h-11 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition disabled:opacity-40 flex items-center justify-center"
            title="Reset form and clear results"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
