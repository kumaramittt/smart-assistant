import React from 'react';
import { Plus, Menu } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
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

        {/* Right: New Chat Button */}
        <div className="flex items-center gap-2">
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
