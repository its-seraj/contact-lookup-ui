import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface HeaderProps {
  currentView?: 'landing' | 'console';
  onNavigate?: (view: 'landing' | 'console') => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

  let apiHost = 'its-seraj-contact-lookup.hf.space';
  if (apiBase) {
    try {
      apiHost = new URL(apiBase).host;
    } catch {
      apiHost = apiBase;
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Brand & Menu */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/enrivo-logo.png"
              alt="Enrivo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[10px] uppercase font-data-mono-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
              Console
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center gap-3">
            <a
              href="https://its-seraj-contact-lookup.hf.space/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl font-label-md text-xs font-semibold text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1.5 border border-transparent hover:border-surface-container"
              title="Open Interactive Swagger & OpenAPI Documentation"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">description</span>
              <span>API Documentation</span>
              <span className="material-symbols-outlined text-[13px] text-secondary/60">open_in_new</span>
            </a>
          </nav>
        </div>

        {/* Right Status & User Menu */}
        <div className="flex items-center gap-3">
          {/* Backend Connected Indicator */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container text-xs font-data-mono-sm text-secondary"
            title={`Enrichment Backend: ${apiBase || '/api/scan'}`}
          >
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
            <span className="text-secondary font-medium">API:</span>
            <span className="text-on-surface font-semibold truncate max-w-[170px]">
              {apiHost}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-primary-container"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <div className="text-left hidden sm:block max-w-[120px]">
                  <p className="font-semibold text-xs text-on-surface truncate leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-secondary truncate leading-tight">
                    {user?.email || ''}
                  </p>
                </div>
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  expand_more
                </span>
              </button>

              {/* User Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl py-2 hidden group-hover:block animate-in fade-in z-50">
                <div className="px-4 py-2 border-b border-surface-container-low">
                  <p className="font-semibold text-xs text-on-surface truncate">{user?.name}</p>
                  <p className="text-[11px] text-secondary truncate">{user?.email}</p>
                  {user?.roles && (
                    <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary-fixed text-primary font-semibold">
                      {user.roles.join(', ')}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs text-error hover:bg-error-container/30 flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <GoogleSignInButton radius="8px" />
          )}
        </div>
      </div>
    </header>
  );
};
