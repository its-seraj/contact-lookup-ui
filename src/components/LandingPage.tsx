import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { LinkedinIcon } from './Icons';

interface LandingPageProps {
  onGoToConsole: () => void;
  onSelectSampleDomain?: (domain: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToConsole,
  onSelectSampleDomain,
}) => {
  const { user, isAuthenticated, logout, triggerGoogleSignIn } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'email' | 'verified'>('all');
  const [sandboxSearch, setSandboxSearch] = useState('');
  const [activeTargets, setActiveTargets] = useState<string[]>(['dbs.com', 'linear.app', 'stripe.com']);
  const [linkedinEnabled, setLinkedinEnabled] = useState(true);
  const [verifyEnabled, setVerifyEnabled] = useState(true);
  const [ctaEmail, setCtaEmail] = useState('');
  const [selectedDemoContact, setSelectedDemoContact] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const demoContacts = [
    {
      id: 'c1',
      name: 'Aaron Yang',
      initials: 'A',
      color: 'bg-blue-50 border border-blue-200 text-blue-600',
      domain: 'dbs.com',
      role: 'Site Reliability Engineer',
      department: 'Infrastructure',
      email: 'aaron.yang@dbs.com',
      deliverability: '99.4% Valid',
      profiles: ['linkedin', 'github'],
      source: 'direct-mx',
      hasEmail: true,
      isVerified: true,
    },
    {
      id: 'c2',
      name: 'Adrian Tan',
      initials: 'A',
      color: 'bg-blue-50 border border-blue-200 text-blue-600',
      domain: 'dbs.com',
      role: 'Head of Wealth Digital',
      department: 'Management',
      email: 'adrian.tan@dbs.com',
      deliverability: '98.7% Valid',
      profiles: ['linkedin'],
      source: 'linkedin-mx',
      hasEmail: true,
      isVerified: true,
    },
    {
      id: 'c3',
      name: 'Ajai Jose',
      initials: 'A',
      color: 'bg-blue-50 border border-blue-200 text-blue-600',
      domain: 'dbs.com',
      role: 'Lead Cloud Architect',
      department: 'Infrastructure',
      email: 'ajai.jose@dbs.com',
      deliverability: '99.1% Valid',
      profiles: ['linkedin', 'github'],
      source: 'direct-mx',
      hasEmail: true,
      isVerified: true,
    },
    {
      id: 'c4',
      name: 'Karri Saarinen',
      initials: 'K',
      color: 'bg-purple-50 border border-purple-200 text-purple-600',
      domain: 'linear.app',
      role: 'CEO & Co-Founder',
      department: 'Executive',
      email: 'karri@linear.app',
      deliverability: '99.8% Valid',
      profiles: ['linkedin', 'twitter'],
      source: 'mx-handshake',
      hasEmail: true,
      isVerified: true,
    },
    {
      id: 'c5',
      name: 'Patrick Collison',
      initials: 'P',
      color: 'bg-teal-50 border border-teal-200 text-teal-600',
      domain: 'stripe.com',
      role: 'Chief Executive Officer',
      department: 'Executive',
      email: 'patrick@stripe.com',
      deliverability: '99.9% Valid',
      profiles: ['linkedin', 'website'],
      source: 'active-smtp',
      hasEmail: true,
      isVerified: true,
    },
    {
      id: 'c6',
      name: 'Akash Chatterjee',
      initials: 'A',
      color: 'bg-amber-50 border border-amber-200 text-amber-600',
      domain: 'dbs.com',
      role: 'VP, Platform Engineering',
      department: 'Technology',
      email: 'akash.chatterjee@dbs.com',
      deliverability: '99.5% Valid',
      profiles: ['linkedin'],
      source: 'mx-handshake',
      hasEmail: true,
      isVerified: true,
    },
  ];

  const filteredDemoContacts = demoContacts.filter((c) => {
    if (activeFilter === 'email' && !c.hasEmail) return false;
    if (activeFilter === 'verified' && !c.isVerified) return false;
    if (sandboxSearch.trim()) {
      const q = sandboxSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartEnriching = () => {
    if (isAuthenticated) {
      onGoToConsole();
    } else {
      triggerGoogleSignIn();
    }
  };

  const handleRemoveTarget = (domain: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTargets((prev) => prev.filter((d) => d !== domain));
  };

  const handleAddSampleTarget = () => {
    const suggestions = ['openai.com', 'vercel.com', 'github.com', 'notion.so'];
    const next = suggestions.find((s) => !activeTargets.includes(s));
    if (next) {
      setActiveTargets((prev) => [...prev, next]);
    }
  };

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      onGoToConsole();
    } else {
      triggerGoogleSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-space-lg">
            <a
              className="flex items-center cursor-pointer"
              data-path="product"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img
                src="/enrivo-logo.png"
                alt="Enrivo"
                className="h-8 w-auto object-contain"
              />
            </a>

            <nav className="hidden md:flex items-center gap-6">
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-medium"
                data-path="product"
                href="#product-showcase"
              >
                Product
              </a>
              <a
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors font-medium"
                data-path="pricing"
                href="#pricing"
              >
                Pricing
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-space-md">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onGoToConsole}
                  className="h-9 px-space-md bg-primary-container text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary transition-all flex items-center justify-center font-medium shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">terminal</span>
                  <span>Enrichment Console</span>
                </button>

                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-low transition-colors">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-primary-container"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
                        {user?.name?.[0] || 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl py-2 hidden group-hover:block animate-in fade-in z-50">
                    <div className="px-4 py-2 border-b border-surface-container-low">
                      <p className="font-semibold text-xs text-on-surface truncate">{user?.name}</p>
                      <p className="text-[11px] text-secondary truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={onGoToConsole}
                      className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">analytics</span>
                      <span>Go to Console</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-error hover:bg-error-container/30 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <GoogleSignInButton radius="8px" />
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full pt-16 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* HERO SECTION */}
          <section className="relative w-full overflow-hidden px-margin-sm lg:px-margin pt-space-lg pb-space-xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[760px] h-[360px] bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col items-center text-center">
              {/* Main Headline */}
              <h1 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface max-w-4xl mx-auto leading-tight mb-space-md mt-6 sm:mt-8">
                Turn any company domain into{' '}
                <span className="text-primary-container">verified decision-maker contacts</span> in seconds.
              </h1>

              {/* Subheadline */}
              <p className="font-body-lg text-body-lg text-secondary max-w-3xl mx-auto mb-space-lg leading-relaxed">
                Enrivo automatically crawls target domains, resolves active LinkedIn profiles, validates deliverability via multi-step MX handshakes, and exports enriched lead lists instantly.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-space-md mb-space-lg">
                {isAuthenticated ? (
                  <button
                    onClick={onGoToConsole}
                    className="h-12 px-space-lg bg-primary-container text-on-primary font-label-md text-label-md rounded-xl shadow-md hover:bg-primary transition-all flex items-center gap-space-xs font-semibold cursor-pointer"
                  >
                    <span>Open Enrichment Console</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                ) : (
                  <GoogleSignInButton
                    variant="primary"
                    size="lg"
                    radius="12px"
                    text="Sign in to start enriching"
                    showArrow
                  />
                )}
              </div>

              {/* Trust Markers */}
              <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-space-md font-body-sm text-body-sm text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary-container">check_circle</span>
                  <span>No credit card required</span>
                </div>
                <span className="opacity-40">&bull;</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary-container">offline_bolt</span>
                  <span>Unlimited domain search</span>
                </div>
                <span className="opacity-40">&bull;</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary-container">verified_user</span>
                  <span>99.4% mailbox deliverability</span>
                </div>
              </div>
            </div>
          </section>

          {/* LIVE PRODUCT SHOWCASE MOCKUP */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-space-xl scroll-mt-0" id="product-showcase">
            <div className="max-w-5xl mx-auto w-full">
              <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col border border-surface-container">
                {/* Top App Navigation / Status Bar */}
                <div className="bg-surface-container-low px-space-md py-3 flex flex-wrap items-center justify-between gap-space-md border-b border-surface-container">
                  <div className="flex items-center gap-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-error-container"></span>
                      <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
                      <span className="w-3 h-3 rounded-full bg-surface-container-highest"></span>
                    </div>
                    <div className="h-4 w-[1px] bg-outline-variant mx-1"></div>
                    <span className="font-data-mono-sm text-data-mono-sm text-secondary font-medium flex items-center gap-1.5">
                      <img src="/enrivo-icon.png" alt="" className="w-3.5 h-3.5 rounded-[3px] object-contain" />
                      pipeline: live-waterfall-v2
                    </span>
                  </div>

                  {/* Pulsing Live Enrichment Badge */}
                  <div className="flex items-center gap-space-sm">
                    <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-lowest shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
                      </span>
                      <span className="font-data-mono-sm text-data-mono-sm text-on-surface font-semibold">
                        132 Contacts Enriched
                      </span>
                      <span className="font-data-mono-sm text-data-mono-sm text-secondary">
                        &bull; {activeTargets.length} domains &bull; 1.4s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inner Application Console Canvas */}
                <div className="p-space-md lg:p-space-lg flex flex-col gap-space-lg">
                  {/* Domain Targets Bar & Operational Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
                    {/* Target Domains Pill Selector */}
                    <div className="md:col-span-6 flex flex-wrap items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mr-1">
                        Targets:
                      </span>
                      {activeTargets.map((dom, idx) => (
                        <button
                          key={dom}
                          onClick={() => {
                            if (onSelectSampleDomain) onSelectSampleDomain(dom);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-data-mono-sm text-data-mono-sm font-medium transition-all ${
                            idx === 0
                              ? 'bg-primary text-on-primary shadow-sm'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              idx === 0 ? 'bg-surface-container-lowest' : 'bg-primary-container'
                            }`}
                          ></span>
                          <span>{dom}</span>
                          <span
                            onClick={(e) => handleRemoveTarget(dom, e)}
                            className="material-symbols-outlined text-[13px] opacity-70 hover:opacity-100"
                          >
                            close
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={handleAddSampleTarget}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-bright text-secondary font-data-mono-sm text-data-mono-sm hover:text-on-surface transition-colors border border-outline-variant/40"
                      >
                        <span className="material-symbols-outlined text-[13px]">add</span>
                        <span>Add Target</span>
                      </button>
                    </div>

                    {/* Toggles (LinkedIn Discovery & Email Verification) */}
                    <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-space-sm">
                      {/* LinkedIn Toggle */}
                      <div
                        onClick={() => setLinkedinEnabled(!linkedinEnabled)}
                        className="flex items-center justify-between gap-space-md px-3.5 py-2 rounded-xl bg-surface-container-low shadow-sm cursor-pointer select-none"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <LinkedinIcon className="w-4 h-4 text-[#0a66c2]" />
                            <span className="font-label-md text-label-md font-semibold text-on-surface">
                              LinkedIn Discovery
                            </span>
                          </div>
                          <span className="font-data-mono-sm text-data-mono-sm text-primary-container flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">search</span>
                            {linkedinEnabled ? 'Enabled' : 'Paused'}
                          </span>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full relative cursor-pointer flex items-center p-0.5 transition-colors ${
                            linkedinEnabled ? 'bg-primary-container' : 'bg-outline-variant'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-surface-container-lowest rounded-full shadow-sm transition-transform ${
                              linkedinEnabled ? 'ml-auto' : 'ml-0'
                            }`}
                          ></div>
                        </div>
                      </div>

                      {/* Email Verification Toggle */}
                      <div
                        onClick={() => setVerifyEnabled(!verifyEnabled)}
                        className="flex items-center justify-between gap-space-md px-3.5 py-2 rounded-xl bg-surface-container-low shadow-sm cursor-pointer select-none"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-tertiary">mail</span>
                            <span className="font-label-md text-label-md font-semibold text-on-surface">
                              Email Verification
                            </span>
                          </div>
                          <span className="font-data-mono-sm text-data-mono-sm text-tertiary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            {verifyEnabled ? 'Direct MX' : 'Permutations Only'}
                          </span>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full relative cursor-pointer flex items-center p-0.5 transition-colors ${
                            verifyEnabled ? 'bg-tertiary' : 'bg-outline-variant'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-surface-container-lowest rounded-full shadow-sm transition-transform ${
                              verifyEnabled ? 'ml-auto' : 'ml-0'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Search & Filter Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low p-2 rounded-xl">
                    <div className="flex-1 min-w-[260px] flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm border border-surface-container">
                      <span className="material-symbols-outlined text-[18px] text-secondary">search</span>
                      <input
                        className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none placeholder-secondary"
                        placeholder="Search by name, role, email, or handle..."
                        value={sandboxSearch}
                        onChange={(e) => setSandboxSearch(e.target.value)}
                        type="text"
                      />
                      {sandboxSearch && (
                        <button
                          onClick={() => setSandboxSearch('')}
                          className="text-xs text-secondary hover:text-on-surface"
                        >
                          clear
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                      {/* Filter Chips */}
                      <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-medium transition-colors ${
                          activeFilter === 'all'
                            ? 'bg-primary-container text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        All (132)
                      </button>
                      <button
                        onClick={() => setActiveFilter('email')}
                        className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-medium transition-colors ${
                          activeFilter === 'email'
                            ? 'bg-primary-container text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">mail</span> With Email (128)
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveFilter('verified')}
                        className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-medium transition-colors ${
                          activeFilter === 'verified'
                            ? 'bg-primary-container text-on-primary shadow-sm'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">verified</span> Verified 99% (114)
                        </span>
                      </button>

                      {/* Export / Action Buttons */}
                      <div className="h-6 w-[1px] bg-outline-variant mx-1"></div>
                      <button
                        onClick={handleStartEnriching}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-data-mono-sm text-data-mono-sm font-semibold shadow-sm hover:bg-surface-container transition-colors flex items-center gap-1 border border-surface-container"
                      >
                        <span className="material-symbols-outlined text-[15px]">download</span> CSV
                      </button>
                      <button
                        onClick={handleStartEnriching}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-data-mono-sm text-data-mono-sm font-semibold shadow-sm hover:bg-surface-container transition-colors flex items-center gap-1 border border-surface-container"
                      >
                        <span className="material-symbols-outlined text-[15px]">code</span> JSON
                      </button>
                    </div>
                  </div>

                  {/* The Contacts Enrichment Data Table */}
                  <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-surface-container-lowest border border-surface-container">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                          <th className="py-3 px-space-md font-medium">Contact Name</th>
                          <th className="py-3 px-space-md font-medium">Role &amp; Company</th>
                          <th className="py-3 px-space-md font-medium">Email Address</th>
                          <th className="py-3 px-space-md font-medium">Deliverability</th>
                          <th className="py-3 px-space-md font-medium text-center">Profiles</th>
                          <th className="py-3 px-space-md font-medium">Source</th>
                          <th className="py-3 px-space-md font-medium text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-body-md divide-y divide-surface-container-low">
                        {filteredDemoContacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-surface-container-low/50 transition-colors group">
                            <td className="py-3.5 px-space-md whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl ${contact.color} flex items-center justify-center font-bold text-base shadow-xs shrink-0 select-none`}
                                >
                                  {contact.initials}
                                </div>
                                <div className="flex flex-col justify-center">
                                  <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors leading-snug">
                                    {contact.name}
                                  </span>
                                  <span className="font-data-mono-sm text-xs text-secondary leading-snug mt-0.5">
                                    {contact.domain}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-space-md whitespace-nowrap">
                              <span className="text-on-surface font-medium">{contact.role}</span>
                              <span className="text-secondary text-body-sm"> &bull; {contact.department}</span>
                            </td>
                            <td className="py-3.5 px-space-md whitespace-nowrap font-data-mono text-data-mono text-on-surface">
                              {contact.email}
                            </td>
                            <td className="py-3.5 px-space-md whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
                                <span className="material-symbols-outlined text-[13px]">check</span>{' '}
                                {contact.deliverability}
                              </span>
                            </td>
                            <td className="py-3.5 px-space-md whitespace-nowrap text-center">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                {contact.profiles.includes('linkedin') && (
                                  <span
                                    className="w-6 h-6 rounded bg-[#0a66c2]/10 flex items-center justify-center text-[#0a66c2]"
                                    title="LinkedIn Profile Identified"
                                  >
                                    <LinkedinIcon className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                {contact.profiles.includes('github') && (
                                  <span
                                    className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-secondary"
                                    title="GitHub Contributor"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                                  </span>
                                )}
                                {contact.profiles.includes('twitter') && (
                                  <span
                                    className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-secondary"
                                    title="X Profile Verified"
                                  >
                                    <span className="font-data-mono-sm text-data-mono-sm font-bold">𝕏</span>
                                  </span>
                                )}
                                {contact.profiles.includes('website') && (
                                  <span
                                    className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-secondary"
                                    title="Personal Site"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">public</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-space-md whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container font-data-mono-sm text-data-mono-sm text-secondary">
                                {contact.source}
                              </span>
                            </td>
                            <td className="py-3.5 px-space-md whitespace-nowrap text-right">
                              <button
                                onClick={() => setSelectedDemoContact(contact)}
                                className="font-label-sm text-label-sm font-medium text-primary hover:text-primary-container inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                View <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Footer Bar in Browser Showcase */}
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs font-body-sm text-body-sm text-secondary">
                    <div className="flex items-center gap-space-md">
                      <span>
                        Showing {filteredDemoContacts.length} of {demoContacts.length} matched profiles
                      </span>
                      <span className="inline-flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[16px]">sync</span>
                        Waterfall auto-resolver idle
                      </span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <span className="font-data-mono-sm text-data-mono-sm">API Response: 200 OK (1,418ms)</span>
                      {/* <button
                        onClick={handleStartEnriching}
                        className="ml-2 px-3 py-1 bg-primary text-on-primary text-xs rounded-lg font-semibold hover:bg-primary-container transition-all flex items-center gap-1"
                      >
                        <span>Launch Live Console</span>
                        <span className="material-symbols-outlined text-[14px]">launch</span>
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PERFORMANCE & SCALE METRICS BAR */}
          <section className="w-full bg-surface-container-low py-space-xl px-4 sm:px-6 lg:px-10 scroll-mt-24" id="features">
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-space-md">
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col border border-surface-container">
                <span className="font-data-mono-sm text-data-mono-sm uppercase text-secondary font-semibold mb-1">
                  Guaranteed Quality
                </span>
                <span className="font-headline-xl text-headline-xl font-bold text-primary mb-1">99.4%</span>
                <p className="font-body-sm text-body-sm text-secondary">
                  Direct mailbox deliverability with zero bounce rates.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col border border-surface-container">
                <span className="font-data-mono-sm text-data-mono-sm uppercase text-secondary font-semibold mb-1">
                  Latency
                </span>
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface mb-1">1.4s</span>
                <p className="font-body-sm text-body-sm text-secondary">
                  Average domain discovery &amp; verification response time.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col border border-surface-container">
                <span className="font-data-mono-sm text-data-mono-sm uppercase text-secondary font-semibold mb-1">
                  Coverage
                </span>
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface mb-1">15M+</span>
                <p className="font-body-sm text-body-sm text-secondary">
                  Active executive &amp; technical B2B buyer profiles cataloged.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col border border-surface-container">
                <span className="font-data-mono-sm text-data-mono-sm uppercase text-secondary font-semibold mb-1">
                  Accuracy Guarantee
                </span>
                <span className="font-headline-xl text-headline-xl font-bold text-tertiary mb-1">0%</span>
                <p className="font-body-sm text-body-sm text-secondary">
                  False positive rate with multi-layer direct MX pinging.
                </p>
              </div>
            </div>
          </section>

          {/* VALUE PROPOSITION / FEATURE PILLARS */}
          <section className="w-full px-4 sm:px-6 lg:px-10 py-space-xl">
            <div className="w-full flex flex-col gap-space-xl">
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <span className="font-data-mono-sm text-data-mono-sm uppercase tracking-wider text-primary font-semibold mb-space-xs">
                  Engine Capabilities
                </span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mb-space-sm">
                  Engineered for outbound teams where every bounce matters.
                </h2>
                <p className="font-body-md text-body-md text-secondary">
                  Legacy providers scrape outdated static databases. Enrivo inspects company domains and live mailservers in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                {/* Pillar 1 */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mb-space-md">
                      <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                      Waterfall Mailbox Validation
                    </h3>
                    <p className="font-body-md text-body-md text-secondary mb-space-md">
                      Stop burning burner domains and mailbox reputations. Enrivo performs multi-step handshake verification down to catch-all servers without sending a single test email.
                    </p>
                  </div>
                  <div className="pt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold cursor-pointer">
                    <span>Learn MX verification</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mb-space-md">
                      <span className="material-symbols-outlined text-[24px]">account_tree</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                      Real-Time LinkedIn Discovery
                    </h3>
                    <p className="font-body-md text-body-md text-secondary mb-space-md">
                      Surface active executive profiles, internal reporting hierarchies, and stealth department heads across 200M+ professionals with instantaneous profile resolution.
                    </p>
                  </div>
                  <div className="pt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold cursor-pointer">
                    <span>Explore hierarchy mapping</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mb-space-md">
                      <span className="material-symbols-outlined text-[24px]">sync_alt</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                      One-Click CRM &amp; Webhook Sync
                    </h3>
                    <p className="font-body-md text-body-md text-secondary mb-space-md">
                      Pipe enriched leads directly into HubSpot, Salesforce, Clay, or your custom outbound sequencing stack with low-latency webhooks and clean RESTful endpoints.
                    </p>
                  </div>
                  <div className="pt-space-md flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold cursor-pointer">
                    <span>Browse connectors</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS STEP SEQUENCE */}
          <section className="w-full bg-surface-container-low py-space-xl px-4 sm:px-6 lg:px-10 scroll-mt-24" id="workflow">
            <div className="w-full flex flex-col gap-space-xl">
              <div className="flex flex-col items-center text-center max-w-xl mx-auto">
                <span className="font-data-mono-sm text-data-mono-sm uppercase tracking-wider text-secondary font-semibold mb-space-xs">
                  Execution Workflow
                </span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Three steps from domain to verified outbound
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Step 1 */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col relative overflow-hidden border border-surface-container">
                  <span className="font-data-mono text-data-mono text-primary font-bold mb-space-xs">
                    01 / INPUT
                  </span>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                    Supply Domains or CSV
                  </h4>
                  <p className="font-body-md text-body-md text-secondary">
                    Paste target website addresses, upload account lists, or pipe prospect companies directly through our high-throughput batch API.
                  </p>
                  <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg font-data-mono-sm text-data-mono-sm text-secondary overflow-x-auto">
                    $ curl -X POST https://api.enrivo.com/v2/enrich -d &apos;&#123;&quot;domains&quot;: [&quot;dbs.com&quot;]&#125;&apos;
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col relative overflow-hidden border border-surface-container">
                  <span className="font-data-mono text-data-mono text-primary font-bold mb-space-xs">
                    02 / RESOLVE
                  </span>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                    Live Waterfall Discovery
                  </h4>
                  <p className="font-body-md text-body-md text-secondary">
                    Enrivo spiders corporate directories, queries real-time LinkedIn nodes, and initiates non-intrusive SMTP handshakes with authoritative MX servers.
                  </p>
                  <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg flex items-center justify-between font-data-mono-sm text-data-mono-sm text-primary">
                    <span>MX Handshake: OK</span>
                    <span className="text-tertiary">200 Verified</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col relative overflow-hidden border border-surface-container">
                  <span className="font-data-mono text-data-mono text-primary font-bold mb-space-xs">
                    03 / EXPORT
                  </span>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">
                    Export Clean Datasets
                  </h4>
                  <p className="font-body-md text-body-md text-secondary">
                    Download verified contacts complete with direct emails, role titles, and matched social handles ready for automated campaign sequences.
                  </p>
                  <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-xs font-data-mono-sm text-data-mono-sm text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">file_download</span>
                    <span>contacts_enriched_132.csv</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PRICING PLANS SECTION */}
          <section
            className="w-full px-4 sm:px-6 lg:px-10 py-space-xl scroll-mt-24 relative overflow-hidden bg-gradient-to-b from-surface via-[#fbfaff] to-surface"
            id="pricing"
          >
            {/* Subtle background ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary-fixed/25 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-5xl mx-auto flex flex-col items-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-container-lowest border border-surface-container shadow-xs mb-space-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">sell</span>
                <span className="font-label-md text-xs font-semibold text-on-surface">
                  Transparent pricing
                </span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1e1b4b] text-center mb-3">
                Individual Plans
              </h2>
              <p className="font-body-lg text-secondary text-center max-w-xl mx-auto mb-8 leading-relaxed">
                Receive unlimited credits when you pay yearly, and save on your plan.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="inline-flex items-center p-1 rounded-full bg-surface-container-low border border-surface-container mb-12 shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    billingCycle === 'yearly'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <span>Bill annually</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold uppercase tracking-wider">
                    Unlimited
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  Bill monthly
                </button>
              </div>

              {/* Pricing Cards Grid (Free & Email only) */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto items-stretch">
                {/* 1. Free Plan */}
                <div className="bg-surface-container-lowest rounded-3xl p-7 sm:p-8 border border-surface-container shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface tracking-tight">Free</h3>
                    <p className="text-xs text-secondary mt-1">Great for occasional prospecting.</p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-on-surface tracking-tight">
                        ₹0
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-1">free forever, no card required.</p>

                    <button
                      type="button"
                      onClick={handleStartEnriching}
                      className="w-full mt-6 py-2.5 px-4 bg-surface-container-lowest text-on-surface border border-surface-container font-label-md text-xs font-semibold rounded-xl hover:bg-surface-container-low hover:border-outline-variant transition-all shadow-xs cursor-pointer text-center"
                    >
                      {isAuthenticated ? 'Get started' : 'Sign in to start'}
                    </button>

                    {/* Decorative subtle separator */}
                    <div className="my-6 border-t border-surface-container-low relative flex items-center justify-center">
                      <span className="bg-surface-container-lowest px-2 text-[10px] text-outline-variant opacity-60">✦</span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
                        What&apos;s included:
                      </span>

                      <div className="space-y-3 text-xs text-on-surface">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <span className="font-medium text-on-surface">Unlimited domain search</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <span className="font-medium text-on-surface">All rows shown (Everything)</span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <div>
                            <p className="font-medium text-on-surface">Website, GitHub and PGP only</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-secondary">
                          <span className="material-symbols-outlined text-[18px] text-secondary/60 shrink-0">close</span>
                          <span>Email addresses not available</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-secondary">
                          <span className="material-symbols-outlined text-[18px] text-secondary/60 shrink-0">close</span>
                          <span>Email verification not available</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-secondary">
                          <span className="material-symbols-outlined text-[18px] text-secondary/60 shrink-0">remove</span>
                          <span>Export / API: None (view only)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Email Plan (Featured) */}
                <div className="bg-surface-container-lowest rounded-3xl p-7 sm:p-8 border-2 border-primary/25 ring-4 ring-primary/5 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface tracking-tight">Email</h3>
                    <p className="text-xs text-secondary mt-1">For those looking for high-accuracy verified outbound.</p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-on-surface tracking-tight">
                        {billingCycle === 'yearly' ? '₹1,799' : '₹2,499'}
                      </span>
                      <span className="text-xs text-secondary">/mo</span>
                    </div>
                    <p className="text-xs text-secondary mt-1">
                      {billingCycle === 'yearly' ? 'billed yearly (₹21,588/yr)' : 'per month, per user.'}
                    </p>

                    <button
                      type="button"
                      onClick={handleStartEnriching}
                      className="w-full mt-6 py-2.5 px-4 bg-[#1e1b4b] hover:bg-[#2e266d] text-white font-label-md text-xs font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-center"
                    >
                      {isAuthenticated ? 'Get started' : 'Sign in to start'}
                    </button>

                    {/* Decorative subtle separator */}
                    <div className="my-6 border-t border-surface-container-low relative flex items-center justify-center">
                      <span className="bg-surface-container-lowest px-2 text-[10px] text-primary opacity-80">✦</span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
                        What&apos;s included:
                      </span>

                      <div className="space-y-3 text-xs text-on-surface">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <span className="font-medium text-on-surface">Unlimited domain search</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <span className="font-medium text-on-surface">All rows shown (Everything)</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <span className="font-medium text-on-surface">Full verified email addresses unlocked</span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <div>
                            <p className="font-medium text-on-surface">SMTP-verified</p>
                            <p className="text-[11px] text-secondary mt-0.5">plus the permutation ladder</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <div>
                            <p className="font-medium text-on-surface">All sources included</p>
                            <p className="text-[11px] text-secondary mt-0.5">LinkedIn sweep and search dorks</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span>
                          <span className="font-medium text-on-surface">CSV, JSON and API key</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Plan Comparison Table Matching Specifications */}
              {/* <div className="mt-14 w-full max-w-3xl mx-auto overflow-hidden rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm">
                <div className="px-5 py-3.5 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-secondary">
                    Plan Specifications Breakdown
                  </span>
                  <span className="font-data-mono-sm text-[11px] text-primary font-semibold">
                    Free vs Email
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-surface-container bg-surface-container-low/60 text-secondary font-semibold">
                        <th className="py-3 px-5 w-1/4">Feature</th>
                        <th className="py-3 px-5 w-1/3 text-on-surface font-bold">Free</th>
                        <th className="py-3 px-5 w-5/12 text-primary font-bold">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low text-on-surface">
                      <tr className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-secondary">Price</td>
                        <td className="py-3.5 px-5 font-bold">₹0</td>
                        <td className="py-3.5 px-5 font-bold text-primary">
                          ₹2,499/mo, or ₹1,799/mo billed yearly (₹21,588/yr)
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-secondary">Domain search</td>
                        <td className="py-3.5 px-5 font-medium text-primary">Unlimited</td>
                        <td className="py-3.5 px-5 font-medium text-primary">Unlimited</td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-secondary">Rows shown</td>
                        <td className="py-3.5 px-5 font-medium text-on-surface">All rows (Everything)</td>
                        <td className="py-3.5 px-5 font-medium text-on-surface">All rows (Everything)</td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-secondary">Email addresses</td>
                        <td className="py-3.5 px-5 text-secondary">
                          Not available
                        </td>
                        <td className="py-3.5 px-5 font-medium text-primary">
                          Available (full reveal)
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-secondary">Email verification</td>
                        <td className="py-3.5 px-5 text-secondary">
                          Not available (Paid only)
                        </td>
                        <td className="py-3.5 px-5 font-medium text-primary">
                          SMTP-verified plus the permutation ladder
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-secondary">Sources</td>
                        <td className="py-3.5 px-5">Website, GitHub and PGP only</td>
                        <td className="py-3.5 px-5 font-medium">All sources, including the LinkedIn sweep and search dorks</td>
                      </tr>
                      <tr className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-secondary">Export / API</td>
                        <td className="py-3.5 px-5 text-secondary">None (view only)</td>
                        <td className="py-3.5 px-5 font-medium">CSV, JSON and API key</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div> */}
            </div>
          </section>

          {/* SOCIAL PROOF & TESTIMONIALS */}
          {/* <section className="w-full px-4 sm:px-6 lg:px-10 py-space-xl scroll-mt-24" id="testimonials">
            <div className="w-full flex flex-col gap-space-lg">
              <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-space-md">
                <span className="font-data-mono-sm text-data-mono-sm uppercase tracking-wider text-primary font-semibold mb-space-xs">
                  Revenue Impact
                </span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Trusted by top outbound teams
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
                  <p className="font-body-lg text-body-lg text-on-surface mb-space-md leading-relaxed">
                    &ldquo;We replaced our Apollo + NeverBounce workflow completely with Enrivo. Our bounce rate plummeted from 8.4% to under 0.6%, and the real-time LinkedIn discovery catches job title changes weeks before static databases update.&rdquo;
                  </p>
                  <div className="flex items-center gap-space-md">
                    <img
                      className="w-12 h-12 rounded-full object-cover border border-primary-fixed"
                      alt="Marcus Thorne"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">Marcus Thorne</span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        VP of Revenue Ops &bull; Scalix Tech
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
                  <p className="font-body-lg text-body-lg text-on-surface mb-space-md leading-relaxed">
                    &ldquo;Enrivo gives our SDR team complete certainty. The one-click CSV export with direct MX verification status means reps don&apos;t second guess email validity. Outbound meeting volume grew 40% in our first quarter.&rdquo;
                  </p>
                  <div className="flex items-center gap-space-md">
                    <img
                      className="w-12 h-12 rounded-full object-cover border border-primary-fixed"
                      alt="Elena Rostova"
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">Elena Rostova</span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        Head of Growth &bull; HyperScale
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section> */}

          {/* FINAL HIGH-CONVERSION CTA BANNER */}
          <section className="w-full px-4 sm:px-6 lg:px-10 pb-space-xl">
            <div className="w-full">
              <div className="bg-gradient-to-r from-surface-container-low via-surface-container-lowest to-surface-container-low p-space-lg lg:p-space-xl rounded-xl shadow-md flex flex-col lg:flex-row items-center justify-between gap-space-lg border border-surface-container">
                <div className="flex flex-col max-w-xl text-center lg:text-left">
                  <div className="inline-flex items-center gap-1.5 self-center lg:self-start px-3 py-1 rounded-full bg-surface-container-lowest shadow-sm mb-space-sm border border-surface-container">
                    <span className="material-symbols-outlined text-[16px] text-primary-container">rocket_launch</span>
                    <span className="font-data-mono-sm text-data-mono-sm font-semibold text-primary">
                      INSTANT PROVISIONING
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mb-space-xs">
                    Ready to 10x your outbound pipeline?
                  </h2>
                  <p className="font-body-md text-body-md text-secondary">
                    Get instant access to live domain discovery, active LinkedIn role mapping, and 100 free MX mailbox verifications every month.
                  </p>
                </div>

                <form
                  onSubmit={handleCtaSubmit}
                  className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-space-xs"
                >
                  <div className="w-full sm:w-72 bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm flex items-center gap-2 border border-surface-container">
                    <span className="material-symbols-outlined text-secondary text-[20px]">mail</span>
                    <input
                      className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder-secondary focus:outline-none"
                      placeholder="Enter your work email"
                      type="email"
                      value={ctaEmail}
                      onChange={(e) => setCtaEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto h-12 px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    <span>{isAuthenticated ? 'Go to Console' : 'Sign in to Start'}</span>
                    <span className="material-symbols-outlined text-[18px]">key</span>
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low mt-space-xl border-t border-surface-container">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-space-xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-space-lg mb-space-xl">
            <div className="col-span-2">
              <div className="flex items-center mb-space-sm">
                <img
                  src="/enrivo-logo.png"
                  alt="Enrivo"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-space-md">
                Autonomous B2B data enrichment and identity resolution engine engineered for precision sales teams.
              </p>
              <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-lowest shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] border border-surface-container">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  All enrichment clusters operational
                </span>
              </div>
            </div>

            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-space-sm font-semibold">
                Product
              </p>
              <ul className="space-y-space-xs">
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#product-showcase">Enrichment Engine</a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#workflow">Data Connectors</a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#pricing">Pricing Plans</a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="https://its-seraj-contact-lookup.hf.space/docs" target="_blank" rel="noreferrer">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-space-sm font-semibold">
                Developers
              </p>
              <ul className="space-y-space-xs">
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="https://its-seraj-auth-service.hf.space" target="_blank" rel="noreferrer">
                    Auth Microservice
                  </a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#features">SDK Libraries</a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#workflow">Webhooks</a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="https://its-seraj-auth-service.hf.space/health" target="_blank" rel="noreferrer">
                    Health Check
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary mb-space-sm font-semibold">
                Company
              </p>
              <ul className="space-y-space-xs">
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#">About Us</a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#">Privacy Policy</a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#">Terms of Service</a>
                </li>
                <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  <a href="#">Security &amp; Trust</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-surface-container">
            <p className="font-body-sm text-body-sm">&copy; 2026 Enrivo Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-space-md font-body-sm text-body-sm">
              <a className="hover:text-on-surface" href="#">Privacy</a>
              <a className="hover:text-on-surface" href="#">Terms</a>
              <a className="hover:text-on-surface" href="#">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Contact Details Quick Modal */}
      {selectedDemoContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-surface-container-lowest border border-surface-container rounded-2xl p-6 shadow-2xl text-on-surface">
            <button
              onClick={() => setSelectedDemoContact(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${selectedDemoContact.color} flex items-center justify-center font-bold text-lg`}
              >
                {selectedDemoContact.initials}
              </div>
              <div>
                <h3 className="font-bold text-base">{selectedDemoContact.name}</h3>
                <p className="text-xs text-secondary">
                  {selectedDemoContact.role} &bull; {selectedDemoContact.domain}
                </p>
              </div>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl mb-4 space-y-1">
              <span className="text-[11px] text-secondary font-semibold uppercase">Email</span>
              <div className="font-mono text-sm text-on-surface">{selectedDemoContact.email}</div>
              <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                {selectedDemoContact.deliverability}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedDemoContact(null);
                handleStartEnriching();
              }}
              className="w-full h-10 bg-primary-container text-on-primary rounded-xl font-semibold hover:bg-primary transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <span>Perform Live Scan in Console</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
