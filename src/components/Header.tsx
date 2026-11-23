import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface HeaderProps {
  currentTab?: 'console' | 'docs';
  onNavigateTab?: (tab: 'console' | 'docs') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab = 'console', onNavigateTab }) => {
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
          <nav className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container">
            <button
              type="button"
              onClick={() => onNavigateTab?.('console')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'console'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">terminal</span>
              <span>Enrichment Console</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab?.('docs')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'docs'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">description</span>
              <span>API Documentation</span>
            </button>
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
              {/* Outer wrapper uses padding (not margin) for the visual gap so the hover area stays continuous */}
              <div className="absolute right-0 top-full pt-2 w-56 hidden group-hover:block z-50">
              <div className="bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl py-2 animate-in fade-in">
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
            </div>
          ) : (
            <GoogleSignInButton radius="8px" />
          )}
        </div>
      </div>
    </header>
  );
};
