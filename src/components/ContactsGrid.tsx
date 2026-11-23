import React, { useState, useMemo } from 'react';
import type { ContactRow } from '../types/enrichment';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import { ContactDetailsModal } from './ContactDetailsModal';
import { getEmailStatusBadge, isEmailStatusValid } from '../utils/statusBadge';
import { LinkedinIcon } from './Icons';

interface ContactsGridProps {
  contacts: ContactRow[];
  isScanning?: boolean;
  domainName?: string;
}

type FilterTab = 'all' | 'with_email' | 'with_linkedin' | 'verified';
type SortField = 'full_name' | 'title' | 'domain';
type SortOrder = 'asc' | 'desc';

function getInitialsColor(name: string): string {
  const colors = [
    'bg-blue-50 border border-blue-200 text-blue-600',
    'bg-purple-50 border border-purple-200 text-purple-600',
    'bg-teal-50 border border-teal-200 text-teal-600',
    'bg-amber-50 border border-amber-200 text-amber-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const clean = name.trim().replace(/^[@#]/, '');
  return clean.charAt(0).toUpperCase();
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
          c.domain?.toLowerCase().includes(q) ||
          c.email_status?.toLowerCase().includes(q) ||
          (q === 'valid' && isEmailStatusValid(c.email_status))
      );
    }

    // Tab filter
    if (activeTab === 'with_email') {
      result = result.filter((c) => Boolean(c.email && c.email.trim()));
    } else if (activeTab === 'with_linkedin') {
      result = result.filter((c) => Boolean(c.linkedin && c.linkedin.trim()));
    } else if (activeTab === 'verified') {
      result = result.filter((c) => isEmailStatusValid(c.email_status));
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

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

  const handleExportCSV = () => {
    const target = domainName || 'enrivo-contacts';
    exportToCSV(filteredContacts, target);
  };

  const handleExportJSON = () => {
    const target = domainName || 'enrivo-contacts';
    exportToJSON(filteredContacts, target);
  };

  const totalWithEmail = contacts.filter((c) => Boolean(c.email && c.email.trim())).length;
  const totalVerified = contacts.filter((c) => isEmailStatusValid(c.email_status)).length;
  const totalWithLinkedin = contacts.filter((c) => Boolean(c.linkedin && c.linkedin.trim())).length;

  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low p-2 rounded-2xl border border-surface-container">
        <div className="flex-1 min-w-[260px] flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-xl shadow-sm border border-surface-container">
          <span className="material-symbols-outlined text-[18px] text-secondary">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, role, email, or domain..."
            className="w-full bg-transparent font-body-md text-xs text-on-surface focus:outline-none placeholder-secondary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-secondary hover:text-on-surface text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Filter Chips */}
          <button
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-lowest text-secondary hover:text-on-surface border border-surface-container'
            }`}
          >
            All ({contacts.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('with_email');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'with_email'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-lowest text-secondary hover:text-on-surface border border-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">mail</span>
            <span>With Email ({totalWithEmail})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('verified');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'verified'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-lowest text-secondary hover:text-on-surface border border-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>Verified MX ({totalVerified})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('with_linkedin');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'with_linkedin'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-lowest text-secondary hover:text-on-surface border border-surface-container'
            }`}
          >
            <LinkedinIcon className={`w-3.5 h-3.5 ${activeTab === 'with_linkedin' ? 'text-white' : 'text-[#0a66c2]'}`} />
            <span>LinkedIn ({totalWithLinkedin})</span>
          </button>

          {/* Export Buttons */}
          <div className="h-6 w-[1px] bg-outline-variant mx-1"></div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-data-mono-sm text-xs font-semibold shadow-sm hover:bg-surface-container transition-colors flex items-center gap-1 border border-surface-container"
            title="Download CSV"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">download</span>
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-data-mono-sm text-xs font-semibold shadow-sm hover:bg-surface-container transition-colors flex items-center gap-1 border border-surface-container"
            title="Download JSON"
          >
            <span className="material-symbols-outlined text-[15px] text-tertiary">code</span>
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Table Container - Fixed Height & Scrollable */}
      <div className="w-full max-h-[560px] min-h-[380px] overflow-y-auto overflow-x-auto rounded-2xl shadow-sm bg-surface-container-lowest border border-surface-container relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider border-b border-surface-container">
              <th
                onClick={() => toggleSort('full_name')}
                className="py-3 px-space-md font-medium cursor-pointer hover:text-on-surface select-none bg-surface-container-low"
              >
                <div className="flex items-center gap-1">
                  <span>Contact Name</span>
                  <span className="material-symbols-outlined text-[14px]">swap_vert</span>
                </div>
              </th>
              <th
                onClick={() => toggleSort('title')}
                className="py-3 px-space-md font-medium cursor-pointer hover:text-on-surface select-none bg-surface-container-low"
              >
                <div className="flex items-center gap-1">
                  <span>Role &amp; Company</span>
                  <span className="material-symbols-outlined text-[14px]">swap_vert</span>
                </div>
              </th>
              <th className="py-3 px-space-md font-medium bg-surface-container-low">Email Address</th>
              <th className="py-3 px-space-md font-medium bg-surface-container-low">Deliverability</th>
              <th className="py-3 px-space-md font-medium text-center bg-surface-container-low">Profiles</th>
              <th className="py-3 px-space-md font-medium bg-surface-container-low">Source</th>
              <th className="py-3 px-space-md font-medium text-right bg-surface-container-low">Details</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-xs divide-y divide-surface-container-low">
            {paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-secondary">
                  No contacts found matching the selected filters.
                </td>
              </tr>
            ) : (
              paginatedContacts.map((contact, idx) => {
                const displayName =
                  contact.full_name || (contact.github ? `@${contact.github}` : 'Unnamed Contact');
                const initials = getInitials(displayName);
                const colorClass = getInitialsColor(displayName);
                const sourceTag = (contact.sources || 'web-spider')
                  .split(';')
                  .filter(Boolean)[0] || 'direct-mx';

                return (
                  <tr
                    key={`contact-${idx}-${contact.email || contact.full_name || contact.github}`}
                    onClick={() => setSelectedContact(contact)}
                    className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                  >
                    {/* Contact Name & Domain */}
                    <td className="py-3.5 px-space-md whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center font-bold text-base shadow-xs shrink-0 select-none`}
                        >
                          {initials}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors leading-snug">
                            {displayName}
                          </span>
                          <span className="font-data-mono-sm text-xs text-secondary leading-snug mt-0.5">
                            {contact.domain}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Company */}
                    <td className="py-3.5 px-space-md whitespace-nowrap">
                      <span className="text-on-surface font-medium">
                        {contact.title || 'Role Unspecified'}
                      </span>
                      {contact.domain && (
                        <span className="text-secondary text-body-sm"> &bull; {contact.domain}</span>
                      )}
                    </td>

                    {/* Email Address with Click-to-Copy */}
                    <td className="py-3.5 px-space-md whitespace-nowrap font-data-mono text-data-mono text-on-surface">
                      {contact.email ? (
                        <div
                          onClick={(e) => copyToClipboard(contact.email, e)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface-container transition-colors group/email cursor-pointer"
                          title="Click to copy email address"
                        >
                          <span>{contact.email}</span>
                          {copiedEmail === contact.email ? (
                            <span className="material-symbols-outlined text-[14px] text-[#059669]">check</span>
                          ) : (
                            <span className="material-symbols-outlined text-[13px] text-secondary opacity-0 group-hover/email:opacity-100 transition-opacity">
                              content_copy
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-secondary/70 italic text-[11px]">No mailbox resolved</span>
                      )}
                    </td>

                    {/* Deliverability Badge */}
                    <td className="py-3.5 px-space-md whitespace-nowrap">
                      {getEmailStatusBadge(contact.email_status, contact.email)}
                    </td>

                    {/* Profiles */}
                    <td className="py-3.5 px-space-md whitespace-nowrap text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 rounded bg-[#0a66c2]/10 flex items-center justify-center text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white transition-all shadow-xs"
                            title="LinkedIn Profile"
                          >
                            <LinkedinIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {contact.github && (
                          <a
                            href={`https://github.com/${contact.github}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                            title={`GitHub: @${contact.github}`}
                          >
                            <span className="material-symbols-outlined text-[14px]">terminal</span>
                          </a>
                        )}
                        {contact.website && (
                          <a
                            href={contact.website}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                            title="Personal / Corporate Site"
                          >
                            <span className="material-symbols-outlined text-[14px]">public</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-space-md whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container-low font-data-mono-sm text-data-mono-sm text-secondary border border-surface-container">
                        {sourceTag}
                      </span>
                    </td>

                    {/* View Button */}
                    <td className="py-3.5 px-space-md whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                        }}
                        className="font-label-sm text-label-sm font-semibold text-primary hover:text-primary-container inline-flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
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
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 font-body-sm text-xs text-secondary">
        <div className="flex items-center gap-2">
          <span>
            Showing {paginatedContacts.length} of {filteredContacts.length} matched records
          </span>
          <span className="text-secondary/40">&bull;</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-secondary flex items-center gap-1">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-surface-container-lowest border border-surface-container rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>

          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className={`p-1.5 rounded-lg border transition-colors ${
              currentPage <= 1
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className={`p-1.5 rounded-lg border transition-colors ${
              currentPage >= totalPages
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
};
