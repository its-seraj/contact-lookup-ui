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
 * If status is 'verified', displays 'verified' (green).
 * If status is 'greylisted' or 'valid', displays 'valid' (green).
 * If email exists but unverified, displays 'unverified' (amber).
 * Otherwise, displays 'name only' (slate).
 */
export function getEmailStatusBadge(status?: string | null, email?: string | null) {
  const s = status?.toLowerCase().trim();
  if (s === 'verified') {
    return (
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800"
        title="Verified deliverable"
      >
        verified
      </span>
    );
  }
  if (s === 'greylisted' || s === 'greylist' || s === 'valid') {
    return (
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800"
        title={s.startsWith('grey') ? 'Greylisted (treated as valid)' : 'Valid deliverable'}
      >
        valid
      </span>
    );
  }
  if (email && email.trim()) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950 text-amber-400 border border-amber-800">
        unverified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-500 border border-slate-800">
      name only
    </span>
  );
}
