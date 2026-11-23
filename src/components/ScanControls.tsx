import React from 'react';
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm">
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
          isScanning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary-fixed'
        } ${
          isLinkedin
            ? 'bg-surface-container-low border-surface-container shadow-sm'
            : 'bg-surface border-surface-container'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <LinkedinIcon className="w-4 h-4 text-[#0a66c2]" />
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              LinkedIn Discovery
            </span>
          </div>
          <span className="font-data-mono-sm text-data-mono-sm text-primary-container flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[13px]">search</span>
            {isLinkedin ? 'Active Graph Spider' : 'Disabled'}
          </span>
        </div>

        <div
          role="switch"
          aria-checked={isLinkedin}
          className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out flex items-center p-0.5 ${
            isLinkedin ? 'bg-primary-container' : 'bg-outline-variant'
          }`}
        >
          <div
            className={`w-4 h-4 bg-surface-container-lowest rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
              isLinkedin ? 'ml-auto' : 'ml-0'
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
        className={`md:col-span-4 p-3.5 rounded-xl border transition select-none flex items-center justify-between group ${
          isScanning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-tertiary-fixed'
        } ${
          isVerify
            ? 'bg-surface-container-low border-surface-container shadow-sm'
            : 'bg-surface border-surface-container'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-tertiary">mail</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              Email Verification
            </span>
          </div>
          <span className="font-data-mono-sm text-data-mono-sm text-tertiary flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            {isVerify ? 'Direct MX Handshake' : 'Pattern Guess Only'}
          </span>
        </div>

        <div
          role="switch"
          aria-checked={isVerify}
          className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out flex items-center p-0.5 ${
            isVerify ? 'bg-tertiary' : 'bg-outline-variant'
          }`}
        >
          <div
            className={`w-4 h-4 bg-surface-container-lowest rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
              isVerify ? 'ml-auto' : 'ml-0'
            }`}
          />
        </div>
      </div>

      {/* Action Buttons: Start, Stop, Reset */}
      <div className="md:col-span-4 flex items-center justify-end gap-2.5">
        {hasResults && !isScanning && (
          <button
            type="button"
            onClick={onReset}
            className="h-11 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface font-label-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-surface-container"
            title="Reset dataset and logs"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset</span>
          </button>
        )}

        {isScanning ? (
          <button
            type="button"
            onClick={onStopScan}
            className="h-11 px-5 rounded-xl bg-error text-on-error font-label-md text-xs font-semibold hover:bg-error/90 transition-all shadow-md flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-on-error animate-pulse"></span>
            <span>Abort Scan</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartScan}
            disabled={disabled}
            className={`h-11 px-6 rounded-xl font-label-md text-xs font-semibold transition-all flex items-center gap-2 shadow-md ${
              disabled
                ? 'bg-surface-container-high text-secondary cursor-not-allowed shadow-none'
                : 'bg-primary text-on-primary hover:bg-primary-container cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            <span>Scan &amp; Enrich</span>
          </button>
        )}
      </div>
    </div>
  );
};
