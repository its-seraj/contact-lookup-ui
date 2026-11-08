import React, { useEffect } from 'react';
import { X, ExternalLink, Mail, Check, Copy } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './Icons';
import type { ContactRow } from '../types/enrichment';

interface ContactDetailsModalProps {
  contact: ContactRow | null;
  onClose: () => void;
}

export const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({ contact, onClose }) => {
  const [copied, setCopied] = React.useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0e1424] border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold uppercase shadow-lg shadow-sky-600/20">
            {contact.first_name ? contact.first_name[0] : (displayName[0] || '?')}
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-lg font-semibold text-white tracking-tight">{displayName}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{contact.title || 'Role Unspecified'}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                {contact.domain}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400">
                Confidence: {contact.confidence}%
              </span>
            </div>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="mt-6 space-y-4 text-xs">
          {/* Email section */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Email Address</p>
                <p className="text-sm font-mono text-slate-200 mt-0.5">
                  {contact.email || <span className="text-slate-500 italic">No address resolved ({contact.email_status})</span>}
                </p>
              </div>
            </div>
            {contact.email && (
              <button
                type="button"
                onClick={copyEmail}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {/* Social Profiles */}
          <div className="grid grid-cols-2 gap-3">
            {/* LinkedIn */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn</span>
                </span>
                {contact.linkedin_status && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {contact.linkedin_status}
                  </span>
                )}
              </div>
              {contact.linkedin ? (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1 truncate mt-1"
                >
                  <span className="truncate">{contact.linkedin.replace('https://www.linkedin.com/in/', '@')}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <p className="text-xs text-slate-500 italic mt-1">Not mapped</p>
              )}
            </div>

            {/* GitHub */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                  <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub</span>
                </span>
              </div>
              {contact.github ? (
                <a
                  href={`https://github.com/${contact.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1 truncate mt-1 font-mono"
                >
                  <span className="truncate">@{contact.github}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <p className="text-xs text-slate-500 italic mt-1">Not mapped</p>
              )}
            </div>
          </div>

          {/* Sources */}
          {contact.sources && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Discovered Sources</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {contact.sources.split(';').map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw Notes */}
          {contact.notes && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Discovery Notes</p>
              <p className="text-xs font-mono text-slate-300 leading-relaxed break-words bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                {contact.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
