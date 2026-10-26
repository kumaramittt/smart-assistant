/**
 * Pure utilities for Web Speech API Voice-to-Text
 */

export interface SpeechLanguageOption {
  code: string;
  label: string;
  flag: string;
}

export const SPEECH_LANGUAGES: SpeechLanguageOption[] = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-IN', label: 'English (India)', flag: '🇮🇳' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
];

/**
 * Determine the appropriate BCP 47 language tag based on the app's language preference
 */
export function getSpeechRecognitionLang(languagePreference: string): string {
  switch (languagePreference) {
    case 'hindi':
      return 'hi-IN';
    case 'english':
      return 'en-US';
    case 'auto':
    default:
      return 'en-US';
  }
}

/**
 * Check if Web Speech API SpeechRecognition is supported in the current environment
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Combine existing textarea text with speech recognition transcript cleanly
 */
export function formatSpeechTranscript(existingText: string, newTranscript: string): string {
  const trimmedExisting = existingText.trim();
  const trimmedNew = newTranscript.trim();

  if (!trimmedExisting) return trimmedNew;
  if (!trimmedNew) return trimmedExisting;

  return `${trimmedExisting} ${trimmedNew}`;
}

/**
 * Map Web Speech API error codes to helpful user-facing error messages
 */
export function getSpeechErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was denied. Please allow microphone permissions in your browser.';
    case 'no-speech':
      return 'No speech detected. Please try speaking closer to your microphone.';
    case 'audio-capture':
      return 'No microphone was found. Please ensure a microphone is connected.';
    case 'network':
      return 'Network error occurred during speech recognition. Please check your connection.';
    case 'aborted':
      return 'Voice input was cancelled.';
    default:
      return `Voice recognition error: ${errorCode}`;
  }
}
