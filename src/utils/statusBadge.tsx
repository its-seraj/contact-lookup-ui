import { CheckCircle2, AlertTriangle, ShieldCheck, UserX } from 'lucide-react';

/**
 * Returns true if the email status represents a deliverable / valid address
 * (verified, valid, or greylisted).
 */
export function isEmailStatusValid(status?: string | null): boolean {
  if (!status) return false;
  const s = status.toLowerCase().trim();
  return s === 'verified' || s === 'valid' || s === 'greylisted' || s === 'greylist';
}

/**
 * Renders the status badge for a contact's email address.
 * Apollo / Hunter style visual indicator with icon, contrast, and tooltip.
 */
export function getEmailStatusBadge(status?: string | null, email?: string | null) {
  const s = status?.toLowerCase().trim();
  if (s === 'verified') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xs"
        title="Direct SMTP Handshake verified: 99%+ deliverability"
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>Verified</span>
      </span>
    );
  }
  if (s === 'greylisted' || s === 'greylist' || s === 'valid') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-xs"
        title={s.startsWith('grey') ? 'Greylisted (treated as valid SMTP target)' : 'Syntax & MX Validated'}
      >
        <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
        <span>{s.startsWith('grey') ? 'Greylisted' : 'Valid'}</span>
      </span>
    );
  }
  if (email && email.trim()) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-xs"
        title="Inferred from domain pattern; unconfirmed by Port 25 SMTP"
      >
        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Unverified</span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide uppercase bg-slate-800/60 text-slate-400 border border-slate-700/60"
      title="No email address resolved for this person yet"
    >
      <UserX className="w-3 h-3 text-slate-500 shrink-0" />
      <span>Name Only</span>
    </span>
  );
}
