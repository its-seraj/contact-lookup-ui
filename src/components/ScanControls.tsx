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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-[#0d1322] p-4 rounded-2xl border border-slate-800/80 shadow-xl shadow-black/20">
      {/* Radio: LinkedIn Discovery */}
      <div className="md:col-span-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
          <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>LinkedIn Discovery</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
            <input
              type="radio"
              name="isLinkedinRadio"
              checked={isLinkedin === true}
              onChange={() => onChangeLinkedin(true)}
              disabled={isScanning}
              className="w-4 h-4 text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500 focus:ring-offset-slate-900"
            />
            <span className="flex items-center gap-1">
              <Search className="w-3 h-3 text-sky-400" />
              <span>Enabled</span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer select-none">
            <input
              type="radio"
              name="isLinkedinRadio"
              checked={isLinkedin === false}
              onChange={() => onChangeLinkedin(false)}
              disabled={isScanning}
              className="w-4 h-4 text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500 focus:ring-offset-slate-900"
            />
            <span>Disabled</span>
          </label>
        </div>
      </div>

      {/* Radio: Email Verification */}
      <div className="md:col-span-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
          <Mail className="w-3.5 h-3.5 text-sky-400" />
          <span>Email Verification</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
            <input
              type="radio"
              name="isVerifyRadio"
              checked={isVerify === true}
              onChange={() => onChangeVerify(true)}
              disabled={isScanning}
              className="w-4 h-4 text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500 focus:ring-offset-slate-900"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Enabled</span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer select-none">
            <input
              type="radio"
              name="isVerifyRadio"
              checked={isVerify === false}
              onChange={() => onChangeVerify(false)}
              disabled={isScanning}
              className="w-4 h-4 text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500 focus:ring-offset-slate-900"
            />
            <span>Disabled</span>
          </label>
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
