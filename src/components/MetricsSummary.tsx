import React from 'react';
import { Users, Mail, CheckCircle2, Sparkles, Server } from 'lucide-react';
import { LinkedinIcon } from './Icons';
import type { ScanCounts, ScanMeta } from '../types/enrichment';

interface MetricsSummaryProps {
  counts: ScanCounts | null;
  meta: ScanMeta | null;
  totalRows: number;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({
  counts,
  meta,
  totalRows,
}) => {
  if (!counts && totalRows === 0) return null;

  const peopleCount = counts?.people ?? totalRows;
  const withEmailCount = counts?.with_email ?? 0;
  const verifiedCount = counts?.verified ?? 0;
  const withLinkedinCount = counts?.with_linkedin ?? 0;
  const pattern = meta?.pattern || meta?.patterns_considered?.[0] || 'Unknown';
  const mailProvider = meta?.mail?.providers?.[0] || 'MX Checked';

  const cards = [
    {
      title: 'Total Discovered',
      value: peopleCount,
      subtext: meta?.domain ? `for ${meta.domain}` : 'Contacts',
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
      subtext: verifiedCount === 0 ? 'Port 25 blocked / unverified' : '100% SMTP verified',
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
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email Pattern:</span>
              <strong className="text-white font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60">
                {pattern}
              </strong>
            </span>
          </div>

          {meta.elapsed_seconds && (
            <div className="text-[11px] font-mono text-slate-500">
              Scan run: {meta.elapsed_seconds.toFixed(1)}s • Total records: {meta.total_records}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
