import React from 'react';
import {
  X,
  Sun,
  Moon,
  Search,
  Globe,
  Trash2,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SupportedLanguage } from '../types';

export type ThemeMode = 'light' | 'dark';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  enableSearch: boolean;
  onToggleSearch: () => void;
  languagePreference: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onClearAllConversations: () => void;
  conversationCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  enableSearch,
  onToggleSearch,
  languagePreference,
  onLanguageChange,
  onClearAllConversations,
  conversationCount,
}) => {
  const [confirmClear, setConfirmClear] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Settings Modal Box */}
      <div
        className="w-full max-w-lg bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-heading" className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Settings / सेटिंग्स
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Manage appearance, search grounding, and language
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 3 Core Boxes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* BOX 1: Theme Mode - Black or White Only with Frosted Blur */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-neutral-900/80 backdrop-blur-md border border-slate-200/80 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200">
                  Box 1: Theme (थीम - Black or White)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  Select between crisp White or deep Black appearance
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                2 Colors
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* White Theme Option */}
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-blue-600 bg-white text-slate-900 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white/70 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold text-slate-900">White</span>
                    {theme === 'light' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500">व्हाइट / लाइट</span>
                </div>
              </button>

              {/* Black Theme Option */}
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-black text-white shadow-md ring-2 ring-blue-500/30'
                    : 'border-neutral-800 hover:border-neutral-700 bg-black/80 text-neutral-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-100 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold text-white">Black</span>
                    {theme === 'dark' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <span className="text-[10px] text-neutral-400">ब्लैक / डार्क</span>
                </div>
              </button>
            </div>
          </div>

          {/* BOX 2: Google Search Grounding Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-neutral-900/80 backdrop-blur-md border border-slate-200/80 dark:border-neutral-800 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200">
                  Box 2: Google Search Grounding
                </span>
                <p className="text-xs text-slate-900 dark:text-white font-medium mt-0.5">
                  Live Web Grounding: {enableSearch ? 'Active' : 'Off'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  Verify current news, live facts, and data via Google Search.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleSearch}
              role="switch"
              aria-checked={enableSearch}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                enableSearch ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-neutral-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  enableSearch ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* BOX 3: Language Preference Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-neutral-900/80 backdrop-blur-md border border-slate-200/80 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200">
                Box 3: Language Preference (भाषा)
              </span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                Matches your script
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'auto', label: 'Auto Detect', sub: 'ऑटो' },
                { id: 'hinglish', label: 'Hinglish', sub: 'हिंग्लिश' },
                { id: 'hindi', label: 'हिंदी (Hindi)', sub: 'देवनागरी' },
                { id: 'english', label: 'English', sub: 'अंग्रेजी' },
              ].map((opt) => {
                const isSelected = languagePreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onLanguageChange(opt.id as SupportedLanguage)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="block truncate">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data & History Management */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-neutral-900/40 border border-slate-200/60 dark:border-neutral-800/60">
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-neutral-200">
                Stored Conversations: <span className="font-semibold">{conversationCount}</span>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                Stored locally in browser cache.
              </p>
            </div>

            {confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllConversations();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 text-xs bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={conversationCount === 0}
                onClick={() => setConfirmClear(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  conversationCount > 0
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 cursor-pointer'
                    : 'text-slate-400 border border-slate-200 dark:border-neutral-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-neutral-800/80 bg-slate-50/80 dark:bg-neutral-900/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
