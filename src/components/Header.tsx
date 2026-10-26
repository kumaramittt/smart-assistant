import React from 'react';
import { Plus, Menu, Download } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { GoogleAuth, GoogleUser } from './GoogleAuth';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  user: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
  onExport?: () => void;
  canExport?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  user,
  onLogin,
  onLogout,
  onExport,
  canExport = false,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full max-w-full overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-4 py-2.5 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 min-w-0">
        {/* Left: 'Three Line' Hamburger menu button & Brand */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open menu and settings (Three lines)"
            title="Menu & Settings"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <BrandLogo size="md" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                Smart Assistant
              </span>
            </div>
          </div>
        </div>

        {/* Right: Export, Google Sign In & New Chat */}
        <div className="flex items-center gap-2">
          {/* Export Button */}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={!canExport}
              aria-label="Export conversation as Markdown"
              title={canExport ? 'Export chat as Markdown (.md)' : 'Start a chat to export'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <GoogleAuth user={user} onLogin={onLogin} onLogout={onLogout} />

          <button
            type="button"
            onClick={onNewChat}
            aria-label="Start a new chat"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
