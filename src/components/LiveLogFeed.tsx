import React, { useState } from 'react';
import type { LogMessage, ScanStatus } from '../types/enrichment';
import { LinkedinIcon } from './Icons';

interface LiveLogFeedProps {
  logs: LogMessage[];
  status: ScanStatus;
  activeDomain: string | null;
  elapsedMs: number | null;
  stage?: string | null;
  resultsCount?: number;
}

interface StepInfo {
  number: number;
  label: string;
  sublabel: string;
  icon: string;
  isCustomIcon?: boolean;
}

const STEPS: StepInfo[] = [
  {
    number: 1,
    label: 'Domain Crawl',
    sublabel: 'DNS & Spidering',
    icon: 'language',
  },
  {
    number: 2,
    label: 'LinkedIn Graph',
    sublabel: 'Profile Sweep',
    icon: 'linkedin',
    isCustomIcon: true,
  },
  {
    number: 3,
    label: 'MX Handshake',
    sublabel: 'Mailbox Verify',
    icon: 'mark_email_read',
  },
  {
    number: 4,
    label: 'Completed',
    sublabel: 'Enriched Leads',
    icon: 'verified',
  },
];

function calculateProgress(
  status: ScanStatus,
  stage: string | null | undefined,
  logs: LogMessage[]
): { percent: number; currentStep: number; stageLabel: string } {
  if (status === 'completed') {
    return {
      percent: 100,
      currentStep: 4,
      stageLabel: 'Enrichment complete! All verified records are ready.',
    };
  }

  if (status === 'aborted') {
    return {
      percent: 100,
      currentStep: 0,
      stageLabel: 'Scan was stopped by user.',
    };
  }

  if (status === 'error') {
    return {
      percent: 100,
      currentStep: 0,
      stageLabel: 'Encountered an issue during pipeline execution.',
    };
  }

  const s = (stage || '').toLowerCase();
  const latestLog = logs.length > 0 ? logs[logs.length - 1].message.toLowerCase() : '';

  // Step 3: MX Handshake & SMTP Verification
  if (
    s.includes('smtp') ||
    s.includes('mx') ||
    s.includes('verify') ||
    s.includes('handshake') ||
    latestLog.includes('mx') ||
    latestLog.includes('smtp') ||
    latestLog.includes('handshake')
  ) {
    return {
      percent: 85,
      currentStep: 3,
      stageLabel: 'Executing real-time direct MX mailbox handshakes & deliverability checks...',
    };
  }

  // Step 3: Permutation Generation
  if (
    s.includes('permut') ||
    latestLog.includes('permut') ||
    latestLog.includes('generating')
  ) {
    return {
      percent: 65,
      currentStep: 3,
      stageLabel: 'Synthesizing email permutation ladders & pattern matching...',
    };
  }

  // Step 2: LinkedIn Graph & Identity Resolution
  if (
    s.includes('linkedin') ||
    s.includes('graph') ||
    latestLog.includes('linkedin') ||
    latestLog.includes('profile')
  ) {
    return {
      percent: 45,
      currentStep: 2,
      stageLabel: 'Spidering public LinkedIn graph and resolving verified employee profiles...',
    };
  }

  // Step 1: Domain Spidering / Crawling
  if (
    s.includes('spider') ||
    s.includes('crawl') ||
    s.includes('dns') ||
    s.includes('whois') ||
    latestLog.includes('spider') ||
    latestLog.includes('crawl')
  ) {
    return {
      percent: 25,
      currentStep: 1,
      stageLabel: 'Crawling target domain and discovering corporate contact footprints...',
    };
  }

  // Default initial scanning
  return {
    percent: 15,
    currentStep: 1,
    stageLabel: 'Initializing distributed waterfall enrichment clusters...',
  };
}

export const LiveLogFeed: React.FC<LiveLogFeedProps> = ({
  logs,
  status,
  activeDomain,
  elapsedMs,
  stage,
  resultsCount = 0,
}) => {
  const [showRawLogs, setShowRawLogs] = useState(false);

  if (logs.length === 0 && status === 'idle') {
    return null;
  }

  const { percent, currentStep, stageLabel } = calculateProgress(status, stage, logs);
  const isScanning = status === 'scanning';
  const isCompleted = status === 'completed';

  return (
    <div className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
      {/* Top Header: Title, Active Status, Elapsed Time & Records */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
            {isScanning ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">
                autorenew
              </span>
            ) : isCompleted ? (
              <span className="material-symbols-outlined text-[20px] text-[#059669]">
                check_circle
              </span>
            ) : (
              <span className="material-symbols-outlined text-[20px] text-secondary">
                hourglass_empty
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-on-surface tracking-tight">
                Pipeline Progress
              </h3>

              {isScanning && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-on-primary shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest animate-ping" />
                  <span>Enriching {activeDomain || 'targets'}</span>
                </span>
              )}

              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                  <span className="material-symbols-outlined text-[13px]">check</span>
                  <span>Completed</span>
                </span>
              )}
            </div>

            <p className="text-xs text-secondary mt-0.5">
              {stageLabel}
            </p>
          </div>
        </div>

        {/* Right Stats: Elapsed Time & Discovered Count */}
        <div className="flex items-center gap-2 text-xs">
          {resultsCount > 0 && (
            <span className="font-data-mono-sm text-primary font-semibold bg-primary-fixed px-2.5 py-1 rounded-lg">
              {resultsCount} contacts found
            </span>
          )}

          {elapsedMs !== null && (
            <span className="font-data-mono-sm text-secondary bg-surface-container-low px-2.5 py-1 rounded-lg border border-surface-container">
              {(elapsedMs / 1000).toFixed(1)}s elapsed
            </span>
          )}
        </div>
      </div>

      {/* 4-Step Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {STEPS.map((step) => {
          const isDone = isCompleted || currentStep > step.number;
          const isActive = isScanning && currentStep === step.number;

          return (
            <div
              key={step.number}
              className={`p-3 rounded-xl border transition-all flex items-center gap-2.5 ${
                isActive
                  ? 'bg-primary-fixed/20 border-primary/40 shadow-xs'
                  : isDone
                  ? 'bg-surface-container-low/70 border-surface-container'
                  : 'bg-surface-container-lowest border-surface-container/60 opacity-60'
              }`}
            >
              {/* Step Icon Badge */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-[#059669] text-white shadow-xs'
                    : isActive
                    ? 'bg-primary text-on-primary animate-pulse shadow-xs'
                    : 'bg-surface-container text-secondary'
                }`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : step.isCustomIcon ? (
                  <LinkedinIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#0a66c2]'}`} />
                ) : (
                  <span className="material-symbols-outlined text-[16px]">
                    {step.icon}
                  </span>
                )}
              </div>

              {/* Step Labels */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-semibold truncate leading-tight ${
                    isActive
                      ? 'text-primary'
                      : isDone
                      ? 'text-on-surface'
                      : 'text-secondary'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-secondary truncate leading-tight mt-0.5">
                  {isDone ? 'Completed' : isActive ? 'Active now' : step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-1.5 pt-1">
        <div className="w-full h-2.5 bg-surface-container-low rounded-full overflow-hidden p-0.5 border border-surface-container">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isCompleted
                ? 'bg-[#059669]'
                : 'bg-gradient-to-r from-primary via-[#2563eb] to-primary-container'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-secondary">
          <span className="font-data-mono-sm flex items-center gap-1">
            {isScanning && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
            <span>{isCompleted ? 'Pipeline finished' : `Processing: ${activeDomain || 'Domains'}`}</span>
          </span>
          <span className="font-data-mono-sm font-bold text-primary">
            {percent}%
          </span>
        </div>
      </div>

      {/* Discreet Raw Log Toggle for Advanced Diagnostics */}
      {logs.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowRawLogs(!showRawLogs)}
            className="text-[11px] text-secondary hover:text-on-surface flex items-center gap-1 font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              {showRawLogs ? 'expand_less' : 'expand_more'}
            </span>
            <span>
              {showRawLogs ? 'Hide diagnostic event logs' : `Show diagnostic event logs (${logs.length} events)`}
            </span>
          </button>

          {showRawLogs && (
            <div className="mt-2 p-3 rounded-xl bg-surface-container-low border border-surface-container max-h-48 overflow-y-auto font-data-mono-sm text-[11px] space-y-1 text-secondary animate-in fade-in">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-secondary/50 shrink-0">{log.timestamp}</span>
                  <span className="text-secondary/70 shrink-0">[{log.domain}]</span>
                  <span className="text-on-surface">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const PipelineProgress = LiveLogFeed;
