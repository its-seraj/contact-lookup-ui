import { useState } from 'react';
import { Header } from './components/Header';
import { DomainChipInput } from './components/DomainChipInput';
import { ScanControls } from './components/ScanControls';
import { LiveLogFeed } from './components/LiveLogFeed';
import { MetricsSummary } from './components/MetricsSummary';
import { ContactsGrid } from './components/ContactsGrid';
import { ServerConfigModal } from './components/ServerConfigModal';
import { useScanStream } from './hooks/useScanStream';
import { useServerHealth } from './hooks/useServerHealth';
import {
  AlertCircle,
  Sparkles,
  Database,
  Loader2,
  ShieldCheck,
  Zap,
  Globe,
  Play,
  Server,
  Settings,
} from 'lucide-react';

export function App() {
  const [domains, setDomains] = useState<string[]>([]);
  const [isVerify, setIsVerify] = useState<boolean>(true);
  const [isLinkedin, setIsLinkedin] = useState<boolean>(true);
  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);

  // Server health hook
  const {
    serverUrl,
    updateServerUrl,
    isOnline: isServerOnline,
    latencyMs: serverLatencyMs,
    healthInfo,
    isChecking: isCheckingHealth,
    checkHealth,
  } = useServerHealth();

  // Scan streaming hook
  const {
    status,
    isScanning,
    activeDomain,
    stage,
    logs,
    results,
    counts,
    meta,
    domainMetas,
    elapsedMs,
    error,
    startScan,
    stopScan,
    reset,
    loadSampleData,
    simulateStreamDemo,
  } = useScanStream();

  const handleStartScan = () => {
    startScan(
      {
        domains,
        isVerify,
        isLinkedin,
      },
      serverUrl
    );
  };

  const handleQuickDemo = () => {
    setDomains(['bamboobox.ai']);
    loadSampleData();
  };

  const handleSimulateDemo = () => {
    setDomains(['bamboobox.ai']);
    simulateStreamDemo();
  };

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Header Navigation */}
      <Header
        status={status}
        isScanning={isScanning}
        totalResults={results.length}
        serverUrl={serverUrl}
        isServerOnline={isServerOnline}
        serverLatencyMs={serverLatencyMs}
        onOpenServerModal={() => setIsServerModalOpen(true)}
        onLoadSample={handleQuickDemo}
        onSimulateStream={handleSimulateDemo}
        onReset={reset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search & Enrichment Hub */}
        <section className="bg-[#090f1f]/90 p-5 sm:p-6 rounded-3xl border border-slate-800/90 shadow-2xl shadow-black/40 backdrop-blur-md space-y-4 relative overflow-hidden">
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-1/4 w-96 h-24 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Domain Chips Input */}
          <DomainChipInput
            domains={domains}
            onChange={setDomains}
            disabled={isScanning}
          />

          {/* Controls Bar: Toggles, Actions, Advanced Settings */}
          <ScanControls
            isVerify={isVerify}
            onChangeVerify={setIsVerify}
            isLinkedin={isLinkedin}
            onChangeLinkedin={setIsLinkedin}
            onStartScan={handleStartScan}
            onStopScan={stopScan}
            onReset={reset}
            isScanning={isScanning}
            hasResults={hasResults}
            disabled={domains.length === 0}
          />
        </section>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-3 shadow-lg shadow-rose-950/30 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-200 text-sm">Enrichment Service Notice</p>
              <p className="mt-0.5 text-rose-300/90 leading-relaxed">{error}</p>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsServerModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-100 text-[11px] font-medium border border-rose-700/80 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3 h-3" />
                  <span>Configure Server ({serverUrl.replace(/^https?:\/\//, '')})</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700 transition cursor-pointer"
                >
                  Load Offline Sample Dataset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Activity Console & Live Stream */}
        <section>
          <LiveLogFeed
            logs={logs}
            status={status}
            activeDomain={activeDomain || (domains.length > 0 ? domains[0] : null)}
            elapsedMs={elapsedMs}
          />
        </section>

        {/* Metrics Summary & Domain Intel Bar */}
        {(counts || hasResults) && (
          <section>
            <MetricsSummary
              counts={counts}
              meta={meta}
              totalRows={results.length}
              contacts={results}
              domainMetas={domainMetas}
            />
          </section>
        )}

        {/* Results Data Grid */}
        {hasResults && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Enriched Contacts Directory
                </h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {results.length} records
                </span>

                {(isScanning || stage?.toLowerCase().includes('permut')) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400 shrink-0" />
                    <span>{stage || 'enriching'}</span>
                  </span>
                )}
              </div>
            </div>

            <ContactsGrid
              contacts={results}
              isScanning={isScanning}
              domainName={activeDomain || domains[0]}
            />
          </section>
        )}

        {/* Empty State Onboarding Hero (Apollo / Clay style) */}
        {!hasResults && !isScanning && status === 'idle' && (
          <div className="p-8 sm:p-12 text-center border border-slate-800/80 rounded-3xl bg-gradient-to-b from-[#090f1f]/60 to-[#060a14] flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                High-Precision B2B Enrichment Engine
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Extract verified email addresses, discover LinkedIn profiles, and map company teams across any domain using waterfall intelligence.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Waterfall Discovery</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Cascades across Apollo, Hunter, Snov & native web crawling.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Port 25 SMTP Verify</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Direct MX handshake test for 0% bounce deliverability.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Social Intelligence</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Verified current employee matching & GitHub handles.
                </p>
              </div>
            </div>

            {/* Quick Demo CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center gap-2 transition shadow-lg shadow-sky-600/20 active:scale-95 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Load BambooBox Demo Dataset (84 Leads)</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateDemo}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400/40" />
                <span>Simulate Live Pipeline Stream</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-900 bg-[#04070d] py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isServerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <p className="font-mono text-slate-400">
              Enrichment Engine &bull; Connected to{' '}
              <button
                type="button"
                onClick={() => setIsServerModalOpen(true)}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                {serverUrl.replace(/^https?:\/\//, '')}
              </button>
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
            <span>
              Status:{' '}
              <strong className={isServerOnline ? 'text-emerald-400' : 'text-rose-400'}>
                {isServerOnline ? 'Online' : 'Offline'}
              </strong>
            </span>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setIsServerModalOpen(true)}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
            >
              <Server className="w-3 h-3 text-sky-400" />
              <span>Server Settings</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Server Configuration Modal */}
      <ServerConfigModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        serverUrl={serverUrl}
        onSaveServerUrl={updateServerUrl}
        isOnline={isServerOnline}
        latencyMs={serverLatencyMs}
        healthInfo={healthInfo}
        isChecking={isCheckingHealth}
        onRefreshHealth={checkHealth}
      />
    </div>
  );
}

export default App;
