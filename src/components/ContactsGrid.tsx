import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  Mail,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './Icons';
import type { ContactRow } from '../types/enrichment';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import { ContactDetailsModal } from './ContactDetailsModal';

interface ContactsGridProps {
  contacts: ContactRow[];
  isScanning?: boolean;
  domainName?: string;
}

type FilterTab = 'all' | 'with_email' | 'with_linkedin' | 'high_confidence';
type SortField = 'confidence' | 'full_name' | 'title';
type SortOrder = 'asc' | 'desc';

export const ContactsGrid: React.FC<ContactsGridProps> = ({
  contacts,
  domainName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortField, setSortField] = useState<SortField>('confidence');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Email copy handler
  const copyToClipboard = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Filtered and sorted contacts
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.github?.toLowerCase().includes(q) ||
          c.domain?.toLowerCase().includes(q)
      );
    }

    // Tab filter
    if (activeTab === 'with_email') {
      result = result.filter((c) => Boolean(c.email && c.email.trim()));
    } else if (activeTab === 'with_linkedin') {
      result = result.filter((c) => Boolean(c.linkedin && c.linkedin.trim()));
    } else if (activeTab === 'high_confidence') {
      result = result.filter((c) => c.confidence >= 60);
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = a[sortField] || '';
      let valB: string | number = b[sortField] || '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [contacts, searchQuery, activeTab, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, currentPage, pageSize]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 60) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800">
          {confidence}%
        </span>
      );
    }
    if (confidence >= 45) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-amber-950/80 text-amber-400 border border-amber-800">
          {confidence}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-slate-900 text-slate-400 border border-slate-800">
        {confidence}%
      </span>
    );
  };

  const getEmailStatusBadge = (status: string, email: string) => {
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
          verified
        </span>
      );
    }
    if (email) {
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
  };

  return (
    <div className="w-full bg-[#0d1322] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, role, email, or handle..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({contacts.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('with_email');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'with_email'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Mail className="w-3 h-3" />
            <span>With Email ({contacts.filter((c) => Boolean(c.email)).length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('with_linkedin');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'with_linkedin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <LinkedinIcon className="w-3 h-3" />
            <span>With LinkedIn ({contacts.filter((c) => Boolean(c.linkedin)).length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('high_confidence');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'high_confidence'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Confidence ≥ 60%</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCSV(filteredContacts, `contacts_${domainName || 'enriched'}.csv`)}
            disabled={filteredContacts.length === 0}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 transition disabled:opacity-50"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => exportToJSON(filteredContacts, `contacts_${domainName || 'enriched'}.json`)}
            disabled={filteredContacts.length === 0}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 transition disabled:opacity-50"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort('full_name')}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  <span>Contact Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort('title')}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  <span>Role & Title</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort('confidence')}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  <span>Confidence</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Profiles</th>
              <th className="py-3 px-4">Sources</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-6 h-6 text-slate-600" />
                    <p className="text-sm font-medium text-slate-400">No matching contacts found</p>
                    <p className="text-xs text-slate-600">
                      Try adjusting your search query or switching the filter tab.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedContacts.map((contact, index) => {
                const displayName =
                  contact.full_name ||
                  (contact.github ? `@${contact.github}` : 'Unnamed Contact');
                const initial = displayName.replace(/^@/, '')[0] || '?';

                return (
                  <tr
                    key={`${contact.domain}-${contact.github || contact.email || index}`}
                    onClick={() => setSelectedContact(contact)}
                    className="hover:bg-slate-900/60 cursor-pointer transition group"
                  >
                    {/* Contact Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-700/60 to-indigo-700/60 border border-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="font-medium text-slate-100 group-hover:text-sky-300 transition">
                            {displayName}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {contact.domain}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-300 truncate" title={contact.title}>
                        {contact.title || <span className="text-slate-600 italic">—</span>}
                      </p>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4">
                      {contact.email ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 truncate max-w-[200px]" title={contact.email}>
                            {contact.email}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(contact.email, e)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Copy email"
                          >
                            {copiedEmail === contact.email ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          {getEmailStatusBadge(contact.email_status, contact.email)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-600 italic">Unresolved</span>
                          {getEmailStatusBadge(contact.email_status, '')}
                        </div>
                      )}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4">{getConfidenceBadge(contact.confidence)}</td>

                    {/* Profiles (LinkedIn & GitHub) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-400 hover:text-white border border-blue-800/80 transition"
                            title={`LinkedIn: ${contact.linkedin_status || 'profile'}`}
                          >
                            <LinkedinIcon className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {contact.github && (
                          <a
                            href={`https://github.com/${contact.github}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                            title={`GitHub: @${contact.github}`}
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {!contact.linkedin && !contact.github && (
                          <span className="text-slate-600 text-xs italic">—</span>
                        )}
                      </div>
                    </td>

                    {/* Sources */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {contact.sources ? (
                          contact.sources.split(';').map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
          <span className="text-slate-500">
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredContacts.length)} -{' '}
            {Math.min(currentPage * pageSize, filteredContacts.length)} of {filteredContacts.length}
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal Details Inspection */}
      <ContactDetailsModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </div>
  );
};
