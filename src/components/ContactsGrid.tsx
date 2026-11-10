import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  Mail,
  ChevronRight,
  ArrowUpDown,
  Copy,
  Check,
  Star,
  ShieldCheck,
  Building2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './Icons';
import type { ContactRow } from '../types/enrichment';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import { ContactDetailsModal } from './ContactDetailsModal';
import { getEmailStatusBadge, isEmailStatusValid } from '../utils/statusBadge';

interface ContactsGridProps {
  contacts: ContactRow[];
  isScanning?: boolean;
  domainName?: string;
}

type FilterTab = 'all' | 'verified' | 'with_email' | 'with_linkedin' | 'leadership';
type SortField = 'full_name' | 'title' | 'confidence' | 'domain';
type SortOrder = 'asc' | 'desc';

// Helper to detect executive/leadership seniority
function isLeadership(title?: string): boolean {
  if (!title) return false;
  const t = title.toLowerCase();
  return (
    t.includes('founder') ||
    t.includes('ceo') ||
    t.includes('cto') ||
    t.includes('cfo') ||
    t.includes('coo') ||
    t.includes('vp') ||
    t.includes('vice president') ||
    t.includes('director') ||
    t.includes('head of') ||
    t.includes('lead') ||
    t.includes('chief') ||
    t.includes('partner')
  );
}

export const ContactsGrid: React.FC<ContactsGridProps> = ({
  contacts,
  domainName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortField, setSortField] = useState<SortField>('full_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [bulkCopied, setBulkCopied] = useState(false);

  // Email copy handler
  const copyToClipboard = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Generate unique key for a contact row
  const getRowId = (c: ContactRow, idx: number) => {
    return `${c.domain}-${c.full_name || c.github || c.email || idx}`;
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
          c.domain?.toLowerCase().includes(q) ||
          c.sources?.toLowerCase().includes(q) ||
          c.email_status?.toLowerCase().includes(q) ||
          (q === 'valid' && isEmailStatusValid(c.email_status))
      );
    }

    // Tab filter
    if (activeTab === 'verified') {
      result = result.filter((c) => isEmailStatusValid(c.email_status));
    } else if (activeTab === 'with_email') {
      result = result.filter((c) => Boolean(c.email && c.email.trim()));
    } else if (activeTab === 'with_linkedin') {
      result = result.filter((c) => Boolean(c.linkedin && c.linkedin.trim()));
    } else if (activeTab === 'leadership') {
      result = result.filter((c) => isLeadership(c.title));
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = a[sortField] || '';
      let valB: string | number = b[sortField] || '';

      if (sortField === 'confidence') {
        valA = a.confidence || 0;
        valB = b.confidence || 0;
        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
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
      setSortOrder('asc');
    }
  };

  // Selection handlers
  const handleToggleRow = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    const visibleKeys = paginatedContacts.map(getRowId);
    const allSelected = visibleKeys.every((k) => selectedRowKeys.has(k));

    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleKeys.forEach((k) => next.delete(k));
      } else {
        visibleKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const areAllVisibleSelected =
    paginatedContacts.length > 0 &&
    paginatedContacts.every((c, idx) => selectedRowKeys.has(getRowId(c, idx)));

  // Bulk actions
  const selectedContacts = useMemo(() => {
    return contacts.filter((c, idx) => selectedRowKeys.has(getRowId(c, idx)));
  }, [contacts, selectedRowKeys]);

  const handleExportSelectedCSV = () => {
    if (selectedContacts.length > 0) {
      exportToCSV(selectedContacts, `selected_contacts_${domainName || 'enriched'}.csv`);
    }
  };

  const handleCopySelectedEmails = () => {
    const emails = selectedContacts
      .map((c) => c.email)
      .filter((e) => Boolean(e && e.trim()))
      .join(', ');

    if (emails) {
      navigator.clipboard.writeText(emails);
      setBulkCopied(true);
      setTimeout(() => setBulkCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-[#080d19] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800/80 bg-[#0a1020]/90 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
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
            placeholder="Search leads by name, title, email, domain or source..."
            className="w-full pl-10 pr-4 py-2 bg-[#050812] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
          />
        </div>

        {/* Segment Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            All Leads ({contacts.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('verified');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'verified'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified ({contacts.filter((c) => isEmailStatusValid(c.email_status)).length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('with_email');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'with_email'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>With Email ({contacts.filter((c) => Boolean(c.email)).length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('with_linkedin');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'with_linkedin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>LinkedIn ({contacts.filter((c) => Boolean(c.linkedin)).length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('leadership');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'leadership'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-purple-400" />
            <span>Leadership ({contacts.filter((c) => isLeadership(c.title)).length})</span>
          </button>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCSV(filteredContacts, `contacts_${domainName || 'enriched'}.csv`)}
            disabled={filteredContacts.length === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer shadow-xs"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => exportToJSON(filteredContacts, `contacts_${domainName || 'enriched'}.json`)}
            disabled={filteredContacts.length === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer shadow-xs"
            title="Export filtered records to JSON"
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
            <tr className="border-b border-slate-800 bg-[#060a14] text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              {/* Checkbox column */}
              <th className="py-3.5 px-4 w-10">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="flex items-center text-slate-400 hover:text-white cursor-pointer"
                  title={areAllVisibleSelected ? 'Deselect all visible' : 'Select all visible'}
                >
                  {areAllVisibleSelected ? (
                    <CheckSquare className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </th>

              <th className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort('full_name')}
                  className="flex items-center gap-1 hover:text-slate-200 cursor-pointer"
                >
                  <span>Contact Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>

              <th className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort('title')}
                  className="flex items-center gap-1 hover:text-slate-200 cursor-pointer"
                >
                  <span>Role & Title</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>

              <th className="py-3.5 px-4">Work Email & Status</th>

              <th className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort('confidence')}
                  className="flex items-center gap-1 hover:text-slate-200 cursor-pointer"
                >
                  <span>Confidence</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>

              <th className="py-3.5 px-4">Profiles</th>
              <th className="py-3.5 px-4">Waterfall Sources</th>
              <th className="py-3.5 px-4 text-right">Dossier</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-xs">
            {paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Filter className="w-8 h-8 text-slate-600 mb-1" />
                    <p className="text-sm font-semibold text-slate-300">No matching contacts found</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Try clearing your search query or switching to another filter tab above.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedContacts.map((contact, index) => {
                const rowKey = getRowId(contact, index);
                const isSelected = selectedRowKeys.has(rowKey);
                const displayName =
                  contact.full_name ||
                  (contact.github ? `@${contact.github}` : 'Unnamed Contact');
                const initial =
                  contact.first_name?.[0] ||
                  contact.last_name?.[0] ||
                  displayName.replace(/^@/, '')[0] ||
                  '?';

                const isLeader = isLeadership(contact.title);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => setSelectedContact(contact)}
                    className={`hover:bg-[#0c1324] cursor-pointer transition group ${
                      isSelected ? 'bg-sky-950/20' : ''
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="py-3 px-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleRow(rowKey, e)}
                        className="flex items-center text-slate-400 hover:text-white cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-sky-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* Contact Name & Domain */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600/40 to-indigo-600/40 border border-slate-700/80 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0 shadow-xs">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-100 group-hover:text-sky-300 transition">
                              {displayName}
                            </span>
                            {isLeader && (
                              <span className="px-1.5 py-0.2 text-[9px] font-semibold uppercase rounded bg-purple-950 text-purple-300 border border-purple-800">
                                Lead
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Building2 className="w-2.5 h-2.5 text-slate-600" />
                            <span>{contact.domain}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-300 truncate font-medium" title={contact.title}>
                        {contact.title || <span className="text-slate-600 italic">—</span>}
                      </p>
                    </td>

                    {/* Email & Status */}
                    <td className="py-3 px-4">
                      {contact.email ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-slate-200 truncate max-w-[190px] select-all font-medium text-[11px]"
                            title={contact.email}
                          >
                            {contact.email}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(contact.email, e)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            title="Copy email to clipboard"
                          >
                            {copiedEmail === contact.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {getEmailStatusBadge(contact.email_status, contact.email)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 italic text-[11px]">Unresolved</span>
                          {getEmailStatusBadge(contact.email_status, '')}
                        </div>
                      )}
                    </td>

                    {/* Confidence Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (contact.confidence || 0) >= 80
                                ? 'bg-emerald-500'
                                : (contact.confidence || 0) >= 60
                                ? 'bg-amber-500'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${Math.min(100, contact.confidence || 60)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-slate-300">
                          {contact.confidence || 60}%
                        </span>
                      </div>
                    </td>

                    {/* Profiles */}
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition font-mono"
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

                    {/* Waterfall Sources */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {contact.sources ? (
                          contact.sources.split(';').map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </div>
                    </td>

                    {/* Dossier Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition text-xs font-semibold cursor-pointer"
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
      <div className="p-4 border-t border-slate-800 bg-[#060a14] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
          <span className="text-slate-500 font-mono">
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredContacts.length)} -{' '}
            {Math.min(currentPage * pageSize, filteredContacts.length)} of {filteredContacts.length}
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1 font-mono">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Dock when rows are selected */}
      {selectedRowKeys.size > 0 && (
        <div className="sticky bottom-4 left-0 right-0 mx-auto max-w-lg z-30 px-4 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <div className="p-2.5 px-4 rounded-2xl bg-[#0e162d]/95 border border-sky-500/40 backdrop-blur-md shadow-2xl flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="font-bold text-sky-200 font-mono">
                {selectedRowKeys.size} {selectedRowKeys.size === 1 ? 'lead' : 'leads'} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySelectedEmails}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 transition font-medium cursor-pointer shadow-xs"
              >
                {bulkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{bulkCopied ? 'Copied!' : 'Copy Emails'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportSelectedCSV}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition font-semibold cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRowKeys(new Set())}
                className="text-slate-400 hover:text-slate-200 ml-1 text-xs cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Dossier Inspector Modal */}
      <ContactDetailsModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </div>
  );
};
