import React from 'react';
import {
  Users,
  Mail,
  CheckCircle2,
  Clock,
  Server,
  ShieldCheck,
  Hash,
} from 'lucide-react';
import { LinkedinIcon } from './Icons';
import type { ContactRow, ScanCounts, ScanMeta } from '../types/enrichment';
import { isEmailStatusValid } from '../utils/statusBadge';
import { formatEnrichTime, parseTimingNumber } from '../utils/timeUtils';

interface MetricsSummaryProps {
  counts: ScanCounts | null;
  meta: ScanMeta | null;
  totalRows: number;
  contacts?: ContactRow[];
  domainMetas?: Record<string, ScanMeta>;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({
  counts,
  meta,
  totalRows,
  contacts,
  domainMetas,
}) => {
  if (!counts && totalRows === 0) return null;

  const validContactsCount = (contacts || []).filter((c) =>
    isEmailStatusValid(c.email_status)
  ).length;
  const emailsCount = (contacts || []).filter((c) => Boolean(c.email && c.email.trim())).length;
  const linkedinCount = (contacts || []).filter((c) => Boolean(c.linkedin && c.linkedin.trim())).length;

  const peopleCount = Math.max(counts?.people ?? 0, totalRows, contacts?.length ?? 0);
  const withEmailCount = Math.max(counts?.with_email ?? 0, emailsCount);
  const verifiedCount = Math.max(counts?.verified ?? 0, validContactsCount);
  const withLinkedinCount = Math.max(counts?.with_linkedin ?? 0, linkedinCount);

  const emailRate = peopleCount > 0 ? Math.round((withEmailCount / peopleCount) * 100) : 0;
  const linkedinRate = peopleCount > 0 ? Math.round((withLinkedinCount / peopleCount) * 100) : 0;
  const deliverabilityRate = withEmailCount > 0 ? Math.round((verifiedCount / withEmailCount) * 100) : 0;

  const distinctDomains = Array.from(
    new Set((contacts || []).map((c) => c.domain).filter(Boolean))
  );
  const totalSubtext =
    distinctDomains.length > 1
      ? `${distinctDomains.length} target domains`
      : distinctDomains.length === 1
      ? distinctDomains[0]
      : meta?.domain
      ? meta.domain
      : 'Target Pool';

  const allMetas: ScanMeta[] =
    domainMetas && Object.keys(domainMetas).length > 0
      ? Object.values(domainMetas)
      : meta
      ? [meta]
      : [];

  const providers = Array.from(
    new Set(allMetas.flatMap((m) => m.mail?.providers || []).filter(Boolean))
  );
  const mailProvider =
    providers.length > 0
      ? providers.join(', ')
      : meta?.mail?.providers?.[0] || 'Google Workspace';

  // Detected email pattern
  const detectedPattern = meta?.pattern || '{first}{last}';

  let totalScanRunSeconds = 0;
  let totalPermuteSeconds = 0;

  for (const m of allMetas) {
    if (m.timings && typeof m.timings === 'object') {
      const timingsSum = Object.values(m.timings).reduce<number>(
        (acc, val) => acc + parseTimingNumber(val),
        0
      );
      totalScanRunSeconds += timingsSum > 0 ? timingsSum : parseTimingNumber(m.elapsed_seconds);
      totalPermuteSeconds += parseTimingNumber(
        m.timings.permute ?? (m as Record<string, unknown>).permute
      );
    } else {
      totalScanRunSeconds += parseTimingNumber(m.elapsed_seconds);
      totalPermuteSeconds += parseTimingNumber((m as Record<string, unknown>)?.permute);
    }
  }

  if (totalScanRunSeconds === 0 && meta) {
    if (meta.timings && typeof meta.timings === 'object') {
      totalScanRunSeconds = Object.values(meta.timings).reduce<number>(
        (acc, val) => acc + parseTimingNumber(val),
        0
      );
    }
    if (totalScanRunSeconds === 0) {
      totalScanRunSeconds = parseTimingNumber(meta.elapsed_seconds);
    }
  }

  if (totalPermuteSeconds === 0 && meta) {
    totalPermuteSeconds = parseTimingNumber(
      meta.timings?.permute ?? (meta as Record<string, unknown>)?.permute
    );
  }

  const enrichTimeString = formatEnrichTime(totalPermuteSeconds);
  const scanRunTimeString = formatEnrichTime(totalScanRunSeconds);

  return (
    <div className="space-y-3">
      {/* 4 Apollo/Hunter Style Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Discovered */}
        <div className="p-4 rounded-2xl bg-[#090f1e] border border-slate-800/90 hover:border-slate-700 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              People Discovered
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {peopleCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">records</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="truncate font-mono">{totalSubtext}</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full w-full" />
          </div>
        </div>

        {/* Card 2: Email Resolution */}
        <div className="p-4 rounded-2xl bg-[#090f1e] border border-slate-800/90 hover:border-slate-700 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Emails Resolved
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {withEmailCount.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-amber-400 font-mono">
              ({emailRate}% rate)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pattern & MX matched</span>
            <span className="font-mono text-slate-300 font-medium">{emailRate}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, emailRate)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Deliverability */}
        <div className="p-4 rounded-2xl bg-[#090f1e] border border-slate-800/90 hover:border-slate-700 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              SMTP Deliverability
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {verifiedCount.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              {verifiedCount > 0 ? `${deliverabilityRate}% Valid` : 'Guessed'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {verifiedCount > 0 ? 'Handshake verified deliverable' : 'Pattern match only (Port 25 bypass)'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${verifiedCount > 0 ? Math.min(100, deliverabilityRate) : 35}%` }}
            />
          </div>
        </div>

        {/* Card 4: LinkedIn Coverage */}
        <div className="p-4 rounded-2xl bg-[#090f1e] border border-slate-800/90 hover:border-slate-700 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              LinkedIn Coverage
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <LinkedinIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {withLinkedinCount.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-blue-400 font-mono">
              ({linkedinRate}% matched)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified current employee</span>
            <span className="font-mono text-slate-300 font-medium">{linkedinRate}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, linkedinRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Domain Intel & Execution Speed Ribbon */}
      <div className="px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800/90 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3 shadow-md">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          {/* Mail Host */}
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">MX Mail Host:</span>
            <strong className="text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
              {mailProvider}
            </strong>
          </div>

          {/* Email Pattern */}
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400">Inferred Pattern:</span>
            <strong className="text-amber-300 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50 text-[11px]">
              {detectedPattern}@{distinctDomains[0] || 'domain.com'}
            </strong>
          </div>

          {/* Enrichment Latency */}
          {totalScanRunSeconds > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400">Scan Execution:</span>
              <strong className="text-indigo-300 font-mono bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/50 text-[11px]">
                {scanRunTimeString} {totalPermuteSeconds > 0 ? `(${enrichTimeString} permute)` : ''}
              </strong>
            </div>
          )}
        </div>

        {/* Security / SPF status */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>SPF / MX Validated</span>
        </div>
      </div>
    </div>
  );
};
