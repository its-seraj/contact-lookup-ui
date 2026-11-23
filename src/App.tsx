import { useState } from 'react';
import { Header } from './components/Header';
import { DomainChipInput } from './components/DomainChipInput';
import { ScanControls } from './components/ScanControls';
import { LiveLogFeed } from './components/LiveLogFeed';
import { MetricsSummary } from './components/MetricsSummary';
import { ContactsGrid } from './components/ContactsGrid';
import { LandingPage } from './components/LandingPage';
import { useScanStream } from './hooks/useScanStream';
import { useAuth } from './hooks/useAuth';

export function App() {
  const { isAuthenticated, user, triggerGoogleSignIn, error: authError, clearError: clearAuthError } = useAuth();
  const [domains, setDomains] = useState<string[]>([]);
  const [isVerify, setIsVerify] = useState<boolean>(false);
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

  // If user clicks start scan and not authenticated, trigger sign-in
  const handleStartScan = () => {
    if (!isAuthenticated) {
      triggerGoogleSignIn();
      return;
    }

    if (domains.length === 0) return;

    startScan({
      domains,
      isVerify,
      isLinkedin,
    });
  };

  const handleSelectSampleDomain = (dom: string) => {
    setDomains([dom]);
    if (!isAuthenticated) {
      triggerGoogleSignIn();
    }
  };

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col">
      {/* Auth Error Banner if client ID missing or network issue */}
      {authError && (
        <div className="fixed top-4 right-4 z-50 max-w-md p-3.5 rounded-xl bg-error-container text-on-error-container text-xs shadow-lg flex items-start gap-2.5 border border-error/20 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
          <div className="flex-1">
            <p className="font-bold">Authentication Notice</p>
            <p className="mt-0.5">{authError}</p>
          </div>
          <button
            onClick={clearAuthError}
            className="p-1 rounded-lg hover:bg-error/10 text-on-error-container"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* View: Unauthenticated users see Landing Page; Authenticated users see Console Page only */}
      {!isAuthenticated ? (
        <LandingPage
          onGoToConsole={triggerGoogleSignIn}
          onSelectSampleDomain={handleSelectSampleDomain}
        />
      ) : (
        /* View: Enrichment Console */
        <div className="flex-1 flex flex-col">
          {/* Console Header */}
          <Header />

          {/* Console Main Workspace */}
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-8 space-y-6">
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-md pb-2 border-b border-surface-container">
              <div>
                <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                  Enrichment Console
                </h1>
                <p className="font-body-sm text-body-sm text-secondary">
                  Logged in as {user?.name || 'User'} ({user?.email || ''}) • Active waterfall clusters ready
                </p>
              </div>
            </div>

            {/* Controls Section */}
            <section className="space-y-4">
              {/* Domain Chip Input */}
              <DomainChipInput
                domains={domains}
                onChange={setDomains}
                disabled={isScanning}
              />

              {/* Verification & LinkedIn Toggles + Scan Action Button */}
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

            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs flex items-start gap-3 shadow-sm border border-error/20">
                <span className="material-symbols-outlined text-[20px] text-error shrink-0">
                  error
                </span>
                <div className="flex-1">
                  <p className="font-bold text-sm">Scan Engine Notice</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                  <p className="mt-1.5 text-[11px] opacity-80 font-data-mono-sm">
                    Ensure your backend enrichment service is accessible at{' '}
                    <span className="font-semibold underline">
                      {import.meta.env.VITE_API_BASE_URL || '/api/scan'}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Pipeline Progress Indicator */}
            <section>
              <LiveLogFeed
                logs={logs}
                status={status}
                stage={stage}
                activeDomain={activeDomain || (domains.length > 0 ? domains[0] : null)}
                elapsedMs={elapsedMs}
                resultsCount={results.length}
              />
            </section>

            {/* Metrics Summary (Total, Direct MX Valid, With Mailbox, LinkedIn Matches) */}
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
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      dataset
                    </span>
                    <h2 className="text-sm font-bold text-on-surface tracking-tight">
                      Enriched Decision-Maker Contacts
                    </h2>
                    <span className="text-xs font-data-mono-sm text-secondary bg-surface-container px-2 py-0.5 rounded-full">
                      {results.length} records
                    </span>
                    {(isScanning || stage?.toLowerCase().includes('permut')) && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-data-mono-sm bg-primary-fixed text-primary font-semibold">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        <span>{stage || 'spidering'}</span>
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
              <div className="p-12 text-center border-2 border-dashed border-surface-container rounded-3xl bg-surface-container-low/50 flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest border border-surface-container flex items-center justify-center shadow-sm overflow-hidden p-2.5">
                  <img src="/enrivo-icon.png" alt="Enrivo" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Ready to Enrich Contacts
                  </h3>
                  <p className="font-body-md text-body-md text-secondary mt-1 max-w-md mx-auto leading-relaxed">
                    Provide target domains above, choose LinkedIn discovery &amp; direct MX handshake options, then click{' '}
                    <strong className="text-primary font-bold">Scan &amp; Enrich</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartScan}
                    disabled={domains.length === 0}
                    className={`h-11 px-5 text-xs font-semibold rounded-xl flex items-center gap-2 transition shadow-md ${
                      domains.length === 0
                        ? 'bg-surface-container-high text-secondary cursor-not-allowed shadow-none'
                        : 'bg-primary hover:bg-primary-container text-on-primary cursor-pointer'
                    }`}
                  >
                    <span>{domains.length > 0 ? `Run Scan for ${domains[0]}` : 'Scan & Enrich Domains'}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Console Footer */}
          <footer className="border-t border-surface-container py-5 text-center text-xs text-secondary bg-surface-container-lowest mt-auto">
            <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span className="font-medium text-on-surface">Enrivo Precision Waterfall Engine</span>
                <span className="text-secondary/50">&bull;</span>
                <span>Real-Time MX Handshakes</span>
              </div>
              <p>&copy; 2026 Enrivo Technologies Inc. All rights reserved.</p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;
