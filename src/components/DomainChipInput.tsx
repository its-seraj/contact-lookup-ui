import { useState } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { Globe, X } from 'lucide-react';

interface DomainChipInputProps {
  domains: string[];
  onChange: (domains: string[]) => void;
  disabled?: boolean;
}

function cleanDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^@/, '');
}

export const DomainChipInput: React.FC<DomainChipInputProps> = ({
  domains,
  onChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const addDomain = (raw: string) => {
    const cleaned = cleanDomain(raw);
    if (!cleaned) return;

    if (!domains.includes(cleaned)) {
      onChange([...domains, cleaned]);
    }
    setInputValue('');
  };

  const removeDomain = (indexToRemove: number) => {
    if (disabled) return;
    onChange(domains.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addDomain(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && domains.length > 0) {
      e.preventDefault();
      removeDomain(domains.length - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    // Split by comma, space, newline, or tab
    const parts = pasteData.split(/[\s,;\n\r]+/);
    const valid = parts
      .map(cleanDomain)
      .filter((d) => d.length > 0 && !domains.includes(d));

    if (valid.length > 0) {
      // deduplicate
      const unique = Array.from(new Set([...domains, ...valid]));
      onChange(unique);
      setInputValue('');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Target Domains</span>
          <span className="text-[10px] text-slate-500 font-normal">
            (Press Enter, Comma, or paste multiple)
          </span>
        </label>
        {domains.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-800/60">
              {domains.length} {domains.length === 1 ? 'domain' : 'domains'}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className={`min-h-[46px] w-full p-2 bg-[#0d1322] border rounded-xl flex flex-wrap items-center gap-1.5 transition ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-slate-800'
            : 'border-slate-800 hover:border-slate-700 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20'
        }`}
      >
        {/* Render Chips */}
        {domains.map((dom, idx) => (
          <span
            key={`${dom}-${idx}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-800/80 text-sky-200 text-xs font-mono font-medium shadow-sm transition group"
          >
            <span>{dom}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeDomain(idx)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-sky-400 hover:bg-sky-900 hover:text-white transition"
                title={`Remove ${dom}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {/* Text Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (inputValue.trim()) addDomain(inputValue);
          }}
          disabled={disabled}
          placeholder={domains.length === 0 ? "e.g. bamboobox.ai, stripe.com..." : "Add another domain..."}
          className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none py-1 px-1 font-mono text-xs"
        />
      </div>
    </div>
  );
};
