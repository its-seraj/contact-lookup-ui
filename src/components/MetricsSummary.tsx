import React from 'react';
import type { ContactRow, ScanCounts, ScanMeta } from '../types/enrichment';
import { isEmailStatusValid } from '../utils/statusBadge';
import { formatEnrichTime, parseTimingNumber } from '../utils/timeUtils';
import { LinkedinIcon } from './Icons';

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
      : 'Profiles cataloged';

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
      : meta?.mail?.providers?.[0] || 'Active MX Handshake';

  let totalScanRunSeconds = 0;
  for (const m of allMetas) {
    if (m.timings && typeof m.timings === 'object') {
      const timingsSum = Object.values(m.timings).reduce<number>(
        (acc, val) => acc + parseTimingNumber(val),
        0
      );
      totalScanRunSeconds += timingsSum > 0 ? timingsSum : parseTimingNumber(m.elapsed_seconds);
    } else {
      totalScanRunSeconds += parseTimingNumber(m.elapsed_seconds);
    }
  }

  if (totalScanRunSeconds === 0 && meta) {
    totalScanRunSeconds = parseTimingNumber(meta.elapsed_seconds);
  }

  const scanRunTimeString = formatEnrichTime(totalScanRunSeconds);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
      {/* Total People */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-secondary mb-2">
          <span className="font-data-mono-sm text-data-mono-sm uppercase font-semibold">Total Resolved</span>
          <span className="material-symbols-outlined text-[20px] text-primary">groups</span>
        </div>
        <div>
          <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
            {peopleCount}
          </span>
          <p className="font-body-sm text-body-sm text-secondary mt-0.5">{totalSubtext}</p>
        </div>
      </div>

      {/* Verified Emails */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-secondary mb-2">
          <span className="font-data-mono-sm text-data-mono-sm uppercase font-semibold">Direct MX Valid</span>
          <span className="material-symbols-outlined text-[20px] text-[#059669]">verified</span>
        </div>
        <div>
          <span className="font-headline-lg text-headline-lg font-bold text-[#059669]">
            {verifiedCount}
          </span>
          <p className="font-body-sm text-body-sm text-secondary mt-0.5">
            {peopleCount > 0 ? `${Math.round((verifiedCount / peopleCount) * 100)}% deliverability` : 'Zero bounce'}
          </p>
        </div>
      </div>

      {/* With Email */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-secondary mb-2">
          <span className="font-data-mono-sm text-data-mono-sm uppercase font-semibold">With Mailbox</span>
          <span className="material-symbols-outlined text-[20px] text-tertiary">mail</span>
        </div>
        <div>
          <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
            {withEmailCount}
          </span>
          <p className="font-body-sm text-body-sm text-secondary mt-0.5">
            {mailProvider}
          </p>
        </div>
      </div>

      {/* LinkedIn Profiles */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-secondary mb-2">
          <span className="font-data-mono-sm text-data-mono-sm uppercase font-semibold">LinkedIn Matches</span>
          <LinkedinIcon className="w-5 h-5 text-[#0a66c2]" />
        </div>
        <div>
          <span className="font-headline-lg text-headline-lg font-bold text-primary">
            {withLinkedinCount}
          </span>
          <p className="font-body-sm text-body-sm text-secondary mt-0.5">
            {scanRunTimeString ? `Scanned in ${scanRunTimeString}` : 'Active graph links'}
          </p>
        </div>
      </div>
    </div>
  );
};
