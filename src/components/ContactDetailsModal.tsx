import React, { useEffect, useState } from 'react';
import type { ContactRow } from '../types/enrichment';
import { getEmailStatusBadge } from '../utils/statusBadge';
import { LinkedinIcon } from './Icons';

interface ContactDetailsModalProps {
  contact: ContactRow | null;
  onClose: () => void;
}

export const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({ contact, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!contact) return null;

  const copyEmail = () => {
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayName = contact.full_name || (contact.github ? `@${contact.github}` : 'Unnamed Contact');
  const initial = contact.first_name ? contact.first_name[0] : (displayName[0] || '?');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-surface-container-lowest border border-surface-container rounded-2xl p-6 shadow-2xl text-on-surface animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
          title="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header Profile */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center text-xl font-bold uppercase shadow-md shrink-0">
            {initial}
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-lg font-bold text-on-surface tracking-tight">{displayName}</h3>
            <p className="text-sm text-secondary mt-0.5">{contact.title || 'Role Unspecified'}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-data-mono px-2 py-0.5 rounded-md bg-surface-container-low border border-surface-container text-secondary font-medium">
                {contact.domain}
              </span>
            </div>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="mt-6 space-y-3.5 text-xs">
          {/* Email section */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-primary">mail</span>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-wider font-semibold">
                  Mailbox Address
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-data-mono text-on-surface font-medium">
                    {contact.email || (
                      <span className="text-secondary italic">No address resolved ({contact.email_status})</span>
                    )}
                  </p>
                  {contact.email && getEmailStatusBadge(contact.email_status, contact.email)}
                </div>
              </div>
            </div>

            {contact.email && (
              <button
                type="button"
                onClick={copyEmail}
                className="px-3 py-1.5 text-xs rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-semibold flex items-center gap-1.5 transition border border-surface-container shadow-sm"
              >
                {copied ? (
                  <>
                    <span className="material-symbols-outlined text-[15px] text-[#059669]">check</span>
                    <span className="text-[#059669]">Copied</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px] text-secondary">content_copy</span>
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Social Profiles Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* LinkedIn */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-secondary uppercase font-semibold flex items-center gap-1.5">
                  <LinkedinIcon className="w-3.5 h-3.5 text-[#0a66c2]" />
                  <span>LinkedIn Profile</span>
                </span>
                {contact.linkedin && (
                  <span className="text-[10px] font-semibold text-primary">Resolved</span>
                )}
              </div>
              {contact.linkedin ? (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              ) : (
                <span className="text-secondary/70 italic text-[11px]">Not identified</span>
              )}
            </div>

            {/* GitHub */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-secondary uppercase font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">terminal</span>
                  <span>GitHub</span>
                </span>
                {contact.github && (
                  <span className="text-[10px] font-semibold text-secondary">Matched</span>
                )}
              </div>
              {contact.github ? (
                <a
                  href={`https://github.com/${contact.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-on-surface font-medium hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">@{contact.github}</span>
                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                </a>
              ) : (
                <span className="text-secondary/70 italic text-[11px]">None</span>
              )}
            </div>
          </div>

          {/* Intelligence Sources & Raw Notes */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold">
                Intelligence Sources
              </span>
              <span className="font-data-mono text-[11px] text-secondary font-medium">
                {contact.sources || 'web-crawler'}
              </span>
            </div>
            {contact.notes && (
              <div className="mt-1 pt-1 border-t border-surface-container">
                <p className="text-[11px] text-secondary font-data-mono leading-relaxed bg-surface-container-lowest p-2 rounded-lg border border-surface-container">
                  {contact.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-surface-container flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
