import React, { useState } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { Globe, X, Plus, Sparkles, Building2 } from 'lucide-react';

interface DomainChipInputProps {
  domains: string[];
  onChange: (domains: string[]) => void;
  disabled?: boolean;
}

const PRESET_DOMAINS = [
  { name: 'bamboobox.ai', label: 'BambooBox' },
  { name: 'stripe.com', label: 'Stripe' },
  { name: 'linear.app', label: 'Linear' },
  { name: 'openai.com', label: 'OpenAI' },
  { name: 'vercel.com', label: 'Vercel' },
];

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

  const addPreset = (domainName: string) => {
    if (disabled || domains.includes(domainName)) return;
    onChange([...domains, domainName]);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Label and Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span>Target Domains / Companies</span>
          <span className="text-[11px] text-slate-400 font-normal">
            (Enter company domains to extract and enrich leads)
          </span>
        </label>

        {domains.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium text-sky-300 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-800/80">
              {domains.length} {domains.length === 1 ? 'target' : 'targets'}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Domain Input Field */}
      <div
        className={`min-h-[50px] w-full p-2 bg-[#080d1a] border rounded-xl flex flex-wrap items-center gap-2 transition ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-slate-800'
            : 'border-slate-800 hover:border-slate-700 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20'
        }`}
      >
        {/* Render Chips */}
        {domains.map((dom, idx) => (
          <span
            key={`${dom}-${idx}`}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-100 text-xs font-mono font-medium shadow-xs transition group hover:border-sky-500/50"
          >
            <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
            <span>{dom}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeDomain(idx)}
                className="w-4 h-4 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-rose-300 transition cursor-pointer"
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
          placeholder={
            domains.length === 0
              ? 'e.g. bamboobox.ai, stripe.com, vercel.com (press Enter or Comma)...'
              : 'Add another domain...'
          }
          className="flex-1 min-w-[200px] bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none py-1.5 px-2 font-mono text-xs"
        />
      </div>

      {/* Quick Suggestion Presets */}
      {!disabled && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Quick Presets:</span>
          </span>
          {PRESET_DOMAINS.map((preset) => {
            const isAdded = domains.includes(preset.name);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => addPreset(preset.name)}
                disabled={isAdded}
                className={`text-[11px] px-2 py-0.5 rounded-md border font-mono transition flex items-center gap-1 cursor-pointer ${
                  isAdded
                    ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-default'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                {!isAdded && <Plus className="w-2.5 h-2.5 text-sky-400" />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
