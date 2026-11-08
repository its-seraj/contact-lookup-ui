import type { ContactRow } from '../types/enrichment';

export function exportToCSV(contacts: ContactRow[], filename = 'contacts_enriched.csv') {
  if (!contacts.length) return;

  const headers = [
    'Domain',
    'Full Name',
    'First Name',
    'Last Name',
    'Title',
    'Email',
    'Email Status',
    'Confidence (%)',
    'LinkedIn',
    'LinkedIn Status',
    'GitHub',
    'Website',
    'Sources',
    'Notes',
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = contacts.map(c => [
    escapeCSV(c.domain),
    escapeCSV(c.full_name),
    escapeCSV(c.first_name),
    escapeCSV(c.last_name),
    escapeCSV(c.title),
    escapeCSV(c.email),
    escapeCSV(c.email_status),
    escapeCSV(c.confidence),
    escapeCSV(c.linkedin),
    escapeCSV(c.linkedin_status),
    escapeCSV(c.github),
    escapeCSV(c.website),
    escapeCSV(c.sources),
    escapeCSV(c.notes),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(contacts: ContactRow[], filename = 'contacts_enriched.json') {
  if (!contacts.length) return;

  const jsonContent = JSON.stringify(contacts, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
