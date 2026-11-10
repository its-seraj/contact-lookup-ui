import { useState } from 'react';
import { Header } from './components/Header';
import { DomainChipInput } from './components/DomainChipInput';
import { ScanControls } from './components/ScanControls';
import { LiveLogFeed } from './components/LiveLogFeed';
import { MetricsSummary } from './components/MetricsSummary';
import { ContactsGrid } from './components/ContactsGrid';
import { useScanStream } from './hooks/useScanStream';
import { AlertCircle, Sparkles, Database, ArrowRight, Loader2 } from 'lucide-react';

export function App() {
  const [domains, setDomains] = useState<string[]>([]);
  const [isVerify, setIsVerify] = useState<boolean>(true);
  const [isLinkedin, setIsLinkedin] = useState<boolean>(true);

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
  } = useScanStream();

  const handleStartScan = () => {
    startScan({
      domains,
      isVerify,
      isLinkedin,
    });
  };

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Controls Card */}
        <section className="space-y-4">
          {/* Domain Chip Input */}
          <div className="bg-[#0c111e] p-5 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 space-y-4">
            <DomainChipInput
              domains={domains}
              onChange={setDomains}
              disabled={isScanning}
            />

            {/* Verification & LinkedIn Radio Buttons + Action Button */}
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
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Encountered an issue</p>
              <p className="mt-0.5 text-rose-300/90">{error}</p>
              <p className="mt-1 text-[11px] text-rose-400/80">
                Tip: Ensure your backend enrichment service is running and accessible at /api/scan.
              </p>
            </div>
          </div>
        )}

        {/* Live Status and Terminal Stream */}
        <section>
          <LiveLogFeed
            logs={logs}
            status={status}
            activeDomain={activeDomain || (domains.length > 0 ? domains[0] : null)}
            elapsedMs={elapsedMs}
          />
        </section>

        {/* Metrics Summary (Total, With Email, With LinkedIn, Verified) */}
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
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Enriched Contacts Data Grid
                </h2>
                <span className="text-xs font-mono text-slate-400">
                  ({results.length} records)
                </span>
                {(isScanning || stage?.toLowerCase().includes('permut')) && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400 shrink-0" />
                    <span>{stage || 'starting'}</span>
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

        {/* Empty State when no results and idle */}
        {!hasResults && !isScanning && status === 'idle' && (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-[#090d17]/50 flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-800/80 flex items-center justify-center text-sky-400 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Ready to Enrich Contacts</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Enter target domains, configure email verification and LinkedIn discovery options, then click <strong className="text-sky-300 font-semibold">Scan & Enrich</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleStartScan}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition shadow-lg shadow-sky-600/20"
              >
                <span>Run Scan for {domains[0] || 'domain'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-600">
        <p>Contact Enrichment System &bull; Minimal Live Stream UI</p>
      </footer>
    </div>
  );
}

export default App;
