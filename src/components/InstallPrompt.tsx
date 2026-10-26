import React, { useState, useEffect } from 'react';
import { Download, Share, X, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  PWA_DISMISS_KEY,
  isDismissPeriodActive,
  calculateDismissExpiry,
  isDeviceIOS,
} from '../utils/pwaUtils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check 7-day dismissal status
    let dismissed = false;
    try {
      const savedDismissUntil = localStorage.getItem(PWA_DISMISS_KEY);
      if (isDismissPeriodActive(savedDismissUntil)) {
        dismissed = true;
      }
    } catch (e) {
      console.warn('LocalStorage error reading PWA dismissal:', e);
    }

    // 3. Detect iOS device
    const iosDevice = isDeviceIOS(window.navigator.userAgent);
    setIsIOS(iosDevice);

    // If it's iOS Safari and not standalone and not dismissed, show the iOS tip after 2 seconds
    if (iosDevice && !dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 4. Listen for Chrome/Android/Desktop beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      if (!dismissed) {
        // Show install sheet after a gentle delay for smooth user experience
        setIsOpen(true);
      }
    };

    // 5. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error prompting PWA install:', err);
    }
  };

  const handleDismiss = () => {
    try {
      // Dismiss for 7 days
      const expiry = calculateDismissExpiry();
      localStorage.setItem(PWA_DISMISS_KEY, expiry.toString());
    } catch (e) {
      console.warn('LocalStorage error setting PWA dismissal:', e);
    }
    setIsOpen(false);
  };

  // If already installed or popup is closed, render nothing (or show brief success toast)
  if (isInstalled && !installedSuccess) {
    return null;
  }

  if (installedSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 pointer-events-none flex justify-center">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 shadow-xl text-sm backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Smart Assistant installed successfully!</span>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Install App Prompt"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 pointer-events-none flex justify-center w-full max-w-full overflow-hidden"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 p-4 sm:p-5 shadow-2xl backdrop-blur-xl text-white transition-all transform animate-in slide-in-from-bottom duration-300 box-border overflow-hidden">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* App Icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 border border-blue-400/30">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-white tracking-tight truncate">
                Install Smart Assistant
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Fast, offline-ready & standalone app
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Close install prompt"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: iOS Instructions vs Standard Install */}
        {isIOS ? (
          <div className="mt-3.5 space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <p className="font-medium text-slate-200">
              To install on iPhone or iPad:
            </p>
            <ol className="space-y-1.5 list-none pl-0">
              <li className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[11px] shrink-0">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button{' '}
                  <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" /> in Safari
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[11px] shrink-0">
                  2
                </span>
                <span>
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong>
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed [overflow-wrap:anywhere]">
            Install Smart Assistant on your home screen for quick access, full-screen view, and smoother AI responses.
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5 w-full min-w-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition active:scale-[0.98] text-center"
          >
            Not now
          </button>

          {!isIOS ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Install</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition text-center"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
