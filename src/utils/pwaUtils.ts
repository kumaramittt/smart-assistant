export const PWA_DISMISS_KEY = 'smart_assistant_pwa_dismissed_until';
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function shouldShowInstallPrompt({
  isInstalled,
  isDismissed,
  hasPromptOrIOS,
}: {
  isInstalled: boolean;
  isDismissed: boolean;
  hasPromptOrIOS: boolean;
}): boolean {
  if (isInstalled) return false;
  if (isDismissed) return false;
  return hasPromptOrIOS;
}

export function isDismissPeriodActive(savedTimestamp: string | null, currentTime: number = Date.now()): boolean {
  if (!savedTimestamp) return false;
  const expiry = parseInt(savedTimestamp, 10);
  if (isNaN(expiry)) return false;
  return currentTime < expiry;
}

export function calculateDismissExpiry(currentTime: number = Date.now(), durationMs: number = SEVEN_DAYS_MS): number {
  return currentTime + durationMs;
}

export function isDeviceIOS(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !/windows|android/.test(ua);
}
