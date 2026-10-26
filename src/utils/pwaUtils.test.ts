import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldShowInstallPrompt,
  isDismissPeriodActive,
  calculateDismissExpiry,
  isDeviceIOS,
  SEVEN_DAYS_MS,
} from './pwaUtils';

test('isDismissPeriodActive returns true when timestamp is in future', () => {
  const now = 1000000;
  const future = (now + 50000).toString();
  assert.equal(isDismissPeriodActive(future, now), true);
});

test('isDismissPeriodActive returns false when timestamp is in past', () => {
  const now = 1000000;
  const past = (now - 50000).toString();
  assert.equal(isDismissPeriodActive(past, now), false);
});

test('calculateDismissExpiry adds 7 days by default', () => {
  const now = 1000000;
  assert.equal(calculateDismissExpiry(now), now + SEVEN_DAYS_MS);
});

test('shouldShowInstallPrompt suppresses prompt if installed', () => {
  assert.equal(
    shouldShowInstallPrompt({ isInstalled: true, isDismissed: false, hasPromptOrIOS: true }),
    false
  );
});

test('shouldShowInstallPrompt suppresses prompt if dismissed', () => {
  assert.equal(
    shouldShowInstallPrompt({ isInstalled: false, isDismissed: true, hasPromptOrIOS: true }),
    false
  );
});

test('shouldShowInstallPrompt displays prompt if installable and not dismissed', () => {
  assert.equal(
    shouldShowInstallPrompt({ isInstalled: false, isDismissed: false, hasPromptOrIOS: true }),
    true
  );
});

test('isDeviceIOS accurately identifies iPhone user agent', () => {
  const iphoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
  assert.equal(isDeviceIOS(iphoneUA), true);
  const androidUA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36';
  assert.equal(isDeviceIOS(androidUA), false);
});
