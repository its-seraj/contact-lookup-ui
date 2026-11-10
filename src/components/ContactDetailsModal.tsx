import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  Check,
  Copy,
  Building2,
  ShieldCheck,
  Layers,
  Code2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './Icons';
import type { ContactRow } from '../types/enrichment';
import { getEmailStatusBadge, isEmailStatusValid } from '../utils/statusBadge';

interface ContactDetailsModalProps {
  contact: ContactRow | null;
  onClose: () => void;
}

type TabType = 'overview' | 'waterfall' | 'json';

export const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({ contact, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);

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
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(contact, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const displayName =
    contact.full_name || (contact.github ? `@${contact.github}` : 'Unnamed Contact');
  const initial =
    contact.first_name?.[0] || contact.last_name?.[0] || displayName.replace(/^@/, '')[0] || '?';

  // Deterministic avatar gradient
  const avatarGradients = [
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-violet-600 to-purple-700',
    'from-sky-600 to-blue-700',
    'from-amber-600 to-orange-700',
  ];
  const gradientIdx = Math.abs(displayName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % avatarGradients.length;
  const gradient = avatarGradients[gradientIdx];

  // Sources list
  const sourcesList = contact.sources
    ? contact.sources.split(';').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090f1f] border border-slate-700/80 rounded-3xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-b from-[#0e162d] to-[#090f1f] relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close dossier (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white text-2xl font-bold uppercase shadow-xl ring-2 ring-white/10 shrink-0`}
            >
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white tracking-tight truncate">
                  {displayName}
                </h3>
                {getEmailStatusBadge(contact.email_status, contact.email)}
              </div>

              <p className="text-sm text-slate-300 mt-1 font-medium truncate">
                {contact.title || 'Role Unspecified'}
              </p>

              <div className="flex items-center gap-2 mt-2.5 flex-wrap text-xs">
                <span className="font-mono px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-sky-300 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-sky-400" />
                  <span>{contact.domain}</span>
                </span>

                <span className="font-mono px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Confidence: {contact.confidence || 75}%</span>
                </span>

                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-0.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 hover:text-white flex items-center gap-1 transition"
                  >
                    <LinkedinIcon className="w-3 h-3 text-blue-400" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-800 -mb-6 pb-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Contact Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('waterfall')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'waterfall'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Enrichment Trail</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Email Address Section */}
              <div className="p-4 rounded-2xl bg-[#0d1428] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Primary Work Email
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-mono font-medium text-white select-all">
                        {contact.email || (
                          <span className="text-slate-500 italic">No email resolved</span>
                        )}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isEmailStatusValid(contact.email_status)
                        ? 'Deliverability confirmed via MX host & SMTP handshake'
                        : 'Unconfirmed mailbox candidate'}
                    </p>
                  </div>
                </div>

                {contact.email && (
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 transition self-start sm:self-center cursor-pointer shadow-xs"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                  </button>
                )}
              </div>

              {/* Grid: Profiles & Social Intelligence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* LinkedIn Card */}
                <div className="p-4 rounded-2xl bg-[#0d1428] border border-slate-800/90">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>LinkedIn Profile</span>
                    </span>
                    {contact.linkedin_status && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800">
                        {contact.linkedin_status}
                      </span>
                    )}
                  </div>
                  {contact.linkedin ? (
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1.5 truncate mt-1"
                    >
                      <span className="truncate">
                        {contact.linkedin.replace('https://www.linkedin.com/in/', 'in/')}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-slate-500 italic mt-1">Not mapped</p>
                  )}
                </div>

                {/* GitHub Card */}
                <div className="p-4 rounded-2xl bg-[#0d1428] border border-slate-800/90">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
                      <span>GitHub Identity</span>
                    </span>
                  </div>
                  {contact.github ? (
                    <a
                      href={`https://github.com/${contact.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1.5 truncate mt-1 font-mono"
                    >
                      <span className="truncate">@{contact.github}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-slate-500 italic mt-1">Not linked</p>
                  )}
                </div>
              </div>

              {/* Sources */}
              {sourcesList.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#0d1428] border border-slate-800/90">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                    Discovered Across {sourcesList.length} Intelligence Sources
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {sourcesList.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-700 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Notes / Discovery Evidence */}
              {contact.notes && (
                <div className="p-4 rounded-2xl bg-[#0d1428] border border-slate-800/90">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                    Agent Discovery Evidence
                  </span>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed bg-[#060a14] p-3 rounded-xl border border-slate-800 select-all">
                    {contact.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'waterfall' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Step-by-step waterfall trace for <strong className="text-white">{displayName}</strong>:
              </p>

              <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-2">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-sky-500 ring-4 ring-[#090f1f]" />
                  <h4 className="text-xs font-bold text-white">Stage 1: Multi-Source Crawl</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Queried company website, Google search dorks, and GitHub organization for domain{' '}
                    <span className="font-mono text-slate-200">{contact.domain}</span>.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-[#090f1f]" />
                  <h4 className="text-xs font-bold text-white">Stage 2: LinkedIn Identity Mining</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Profile matched:{' '}
                    <span className="text-slate-200 font-mono">
                      {contact.linkedin || 'Candidate matched through search headline'}
                    </span>
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-[#090f1f]" />
                  <h4 className="text-xs font-bold text-white">Stage 3: Email Pattern Inference</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Analyzed MX host and synthesized address pattern for {contact.domain}.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#090f1f]" />
                  <h4 className="text-xs font-bold text-white">Stage 4: Verification & Scoring</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    SMTP handshake executed. Deliverability confidence rated at{' '}
                    <span className="text-emerald-400 font-semibold">{contact.confidence || 75}%</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Normalized Record Schema</span>
                <button
                  type="button"
                  onClick={copyJSON}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedJSON ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedJSON ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#060a14] border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto leading-relaxed select-all">
                {JSON.stringify(contact, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
