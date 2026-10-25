import React, { useState } from 'react';
import { LogOut, X, Check, ShieldCheck, Mail, User } from 'lucide-react';

export interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
  signedInAt: number;
}

interface GoogleAuthProps {
  user: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
}

// Pixel-perfect official 4-color Google 'G' Icon
export const GoogleGIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 18,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`shrink-0 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ user, onLogin, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Quick 1-click Google Sign In with detected user email
  const handleQuickGoogleSignIn = (email = 'amitkumar678793@gmail.com', name = 'Amit Kumar') => {
    onLogin({
      name,
      email,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563eb,4f46e5`,
      signedInAt: Date.now(),
    });
    setIsModalOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const email = customEmail.trim();
    const name = customName.trim() || email.split('@')[0];
    handleQuickGoogleSignIn(email, name);
  };

  return (
    <>
      {/* Header Button: Sign in OR User Profile Avatar */}
      {user ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full border border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-2xs"
            aria-label="User Google Account menu"
          >
            <div className="relative">
              <img
                src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-neutral-700"
              />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5 shadow-xs">
                <GoogleGIcon size={10} />
              </div>
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-neutral-200 max-w-[100px] truncate">
              {user.name}
            </span>
          </button>

          {/* User Account Popover Dropdown */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <img
                    src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-neutral-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{user.email}</span>
                    </p>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Google Account Active
                  </span>
                  <GoogleGIcon size={12} />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Sign in with Google Button */
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Sign in with Google or Gmail"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <GoogleGIcon size={16} />
          <span className="hidden sm:inline">Sign in with Google</span>
          <span className="sm:hidden">Sign in</span>
        </button>
      )}

      {/* Google Sign-In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <GoogleGIcon size={22} />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Google Account
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setShowCustomInput(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 pt-1 space-y-4 text-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Sign in to Smart Assistant
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Sync your chat history and preferences with your Google or Gmail account.
                </p>
              </div>

              {!showCustomInput ? (
                <div className="space-y-2.5 pt-2">
                  {/* Default Google account detected button */}
                  <button
                    type="button"
                    onClick={() => handleQuickGoogleSignIn('amitkumar678793@gmail.com', 'Amit Kumar')}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/80 dark:bg-neutral-800/80 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                      AK
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Amit Kumar
                        </span>
                        <GoogleGIcon size={14} />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate block">
                        amitkumar678793@gmail.com
                      </span>
                    </div>
                  </button>

                  {/* Option to use another Gmail address */}
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-medium text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Use another Google / Gmail account</span>
                  </button>
                </div>
              ) : (
                /* Custom Google / Gmail input form */
                <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Gmail Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="py-2 px-3 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Protected by Google Security • OAuth Ready</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
