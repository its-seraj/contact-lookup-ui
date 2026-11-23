export function isEmailStatusValid(status?: string | null): boolean {
  if (!status) return false;
  const s = status.toLowerCase().trim();
  return (
    s === 'verified' ||
    s === 'valid' ||
    s === 'greylisted' ||
    s === 'greylist' ||
    s.includes('99') ||
    s.includes('valid')
  );
}

export function getEmailStatusBadge(status?: string | null, email?: string | null) {
  const s = status?.toLowerCase().trim();

  if (s === 'verified' || s === 'valid' || s === 'greylisted' || s === 'greylist') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-data-mono-sm text-data-mono-sm font-semibold"
        title="Direct MX Handshake Verified"
      >
        <span className="material-symbols-outlined text-[13px]">check</span>
        <span>Valid</span>
      </span>
    );
  }

  if (email && email.trim()) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-data-mono-sm text-data-mono-sm font-semibold"
        title="Pattern resolved, direct MX handshake pending"
      >
        <span className="material-symbols-outlined text-[13px]">help_outline</span>
        <span>Pattern Guess</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-secondary font-data-mono-sm text-data-mono-sm font-medium"
      title="Profile found without resolvable email"
    >
      Name only
    </span>
  );
}
