import React from 'react';
import { Users, Mail, CheckCircle2, Clock, Server } from 'lucide-react';
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

  const distinctDomains = Array.from(
    new Set((contacts || []).map((c) => c.domain).filter(Boolean))
  );
  const totalSubtext =
    distinctDomains.length > 1
      ? `across ${distinctDomains.length} domains`
      : distinctDomains.length === 1
      ? `for ${distinctDomains[0]}`
      : meta?.domain
      ? `for ${meta.domain}`
      : 'Contacts';

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
      : meta?.mail?.providers?.[0] || 'MX Checked';

  let totalScanRunSeconds = 0;
  let totalPermuteSeconds = 0;

  for (const m of allMetas) {
    if (m.timings && typeof m.timings === 'object') {
      const timingsSum = Object.values(m.timings).reduce<number>(
        (acc, val) => acc + parseTimingNumber(val),
        0
      );
      totalScanRunSeconds += timingsSum > 0 ? timingsSum : parseTimingNumber(m.elapsed_seconds);
      totalPermuteSeconds += parseTimingNumber(m.timings.permute ?? (m as Record<string, unknown>).permute);
    } else {
      totalScanRunSeconds += parseTimingNumber(m.elapsed_seconds);
      totalPermuteSeconds += parseTimingNumber((m as Record<string, unknown>)?.permute);
    }
  }

  // Fallback to meta if allMetas didn't yield values
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

  const cards = [
    {
      title: 'Total Discovered',
      value: peopleCount,
      subtext: totalSubtext,
      icon: Users,
      color: 'from-sky-500/20 to-sky-600/5',
      borderColor: 'border-sky-500/30',
      iconColor: 'text-sky-400',
    },
    {
      title: 'With Email',
      value: withEmailCount,
      subtext: `${((withEmailCount / (peopleCount || 1)) * 100).toFixed(0)}% resolved`,
      icon: Mail,
      color: 'from-amber-500/20 to-amber-600/5',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      title: 'Verified Deliverable',
      value: verifiedCount,
      subtext: verifiedCount === 0 ? 'Port 25 blocked / unverified' : 'SMTP verified / valid',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'LinkedIn Profiles',
      value: withLinkedinCount,
      subtext: `${((withLinkedinCount / (peopleCount || 1)) * 100).toFixed(0)}% mapped`,
      icon: LinkedinIcon,
      color: 'from-blue-500/20 to-blue-600/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl bg-gradient-to-br ${card.color} bg-[#0c101d] border ${card.borderColor} backdrop-blur shadow-lg shadow-black/10 flex items-center justify-between transition hover:scale-[1.01]`}
            >
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.subtext}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Domain Intel Mini Bar */}
      {meta && (
        <div className="px-4 py-2 rounded-xl bg-[#0b101c] border border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>Mail Host:</span>
              <strong className="text-white font-mono">{mailProvider}</strong>
            </span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email Enrich Time:</span>
              <strong className="text-white font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60">
                {enrichTimeString}
              </strong>
            </span>
          </div>

          {totalScanRunSeconds > 0 ? (
            <div className="text-[11px] font-mono text-slate-500">
              Scan run: {scanRunTimeString}{/*  • Total records: {peopleCount} */}
            </div>
          ) : meta.elapsed_seconds ? (
            <div className="text-[11px] font-mono text-slate-500">
              Scan run: {formatEnrichTime(meta.elapsed_seconds)}{/*  • Total records: {peopleCount} */}
            </div>
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
};
