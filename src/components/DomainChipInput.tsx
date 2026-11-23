import React, { useState } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

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
    const parts = pasteData.split(/[\s,;\n\r]+/);
    const valid = parts
      .map(cleanDomain)
      .filter((d) => d.length > 0 && !domains.includes(d));

    if (valid.length > 0) {
      const unique = Array.from(new Set([...domains, ...valid]));
      onChange(unique);
      setInputValue('');
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px] text-primary-container">public</span>
          <span>Target Company Domains</span>
          <span className="text-[11px] text-secondary font-normal lowercase tracking-normal">
            (press enter or comma to add)
          </span>
        </label>
        {domains.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-data-mono-sm text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full font-semibold">
              {domains.length} {domains.length === 1 ? 'target' : 'targets'}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-secondary hover:text-error transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input container with chips inside */}
      <div
        className={`min-h-[46px] p-2 rounded-xl bg-surface-container-low border transition-all flex flex-wrap items-center gap-2 ${
          disabled ? 'opacity-70 cursor-not-allowed bg-surface-dim' : 'border-surface-container focus-within:border-primary-container focus-within:bg-surface-container-lowest focus-within:shadow-sm'
        }`}
      >
        {domains.map((domain, index) => (
          <span
            key={`${domain}-${index}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-data-mono font-medium shadow-sm animate-in fade-in"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest"></span>
            <span>{domain}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeDomain(index)}
                className="hover:opacity-75 focus:outline-none flex items-center"
                title={`Remove ${domain}`}
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => addDomain(inputValue)}
          disabled={disabled}
          placeholder={domains.length === 0 ? 'Type domain (e.g. acme.com) and press Enter...' : 'Add another domain...'}
          className="flex-1 min-w-[200px] bg-transparent text-xs font-body-md text-on-surface placeholder:text-secondary focus:outline-none px-2 py-1"
        />
      </div>
    </div>
  );
};
