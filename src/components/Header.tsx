import React, { useState } from 'react';
import { Sparkles, Settings, Globe, PlayCircle, Database, Check } from 'lucide-react';

interface HeaderProps {
  backendUrl: string;
  onUpdateBackendUrl: (url: string) => void;
  onLoadSample: () => void;
  onSimulateDemo: () => void;
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  backendUrl,
  onUpdateBackendUrl,
  onLoadSample,
  onSimulateDemo,
  isScanning,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(backendUrl);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBackendUrl(tempUrl);
    setShowSettings(false);
  };

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

        {/* Actions & Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Buttons */}
          <button
            type="button"
            onClick={onSimulateDemo}
            disabled={isScanning}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition disabled:opacity-50"
            title="Simulate real-time streaming using sample event logs"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Stream</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition disabled:opacity-50"
            title="Load sample results immediately"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Load Sample</span>
          </button>

          {/* Endpoint Config Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Configure Backend API URL"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
              {backendUrl ? backendUrl.replace(/^https?:\/\//, '') : 'Vite Proxy'}
            </span>
          </button>
        </div>
      </div>

      {/* Backend Settings Dropdown Modal */}
      {showSettings && (
        <div className="border-t border-slate-800 bg-[#0d1322] px-4 py-3 sm:px-6">
          <form onSubmit={handleSaveSettings} className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Target API Endpoint:</span>
            </div>
            <div className="flex-1 max-w-lg w-full flex items-center gap-2">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="Leave blank for Vite Proxy (/api/scan) or http://localhost:8000"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center gap-1 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempUrl('');
                  onUpdateBackendUrl('');
                  setShowSettings(false);
                }}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

