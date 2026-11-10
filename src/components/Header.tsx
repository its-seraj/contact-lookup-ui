import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  let apiHost = 'Local Proxy (/api)';
  if (apiBase) {
    try {
      apiHost = new URL(apiBase).host;
    } catch {
      apiHost = apiBase;
    }
  }

  return (
    <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
            <Sparkles className="w-5 h-5 text-sky-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white tracking-tight">Contact Enrichment</h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-400">
                Live Stream
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-source intelligence & email verification engine
            </p>
          </div>
        </div>

        {/* Backend Connected Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-400">API:</span>
          <span className="text-emerald-400 truncate max-w-[200px]" title={apiBase || '/api/scan'}>
            {apiHost}
          </span>
        </div>
      </div>
    </header>
  );
};
