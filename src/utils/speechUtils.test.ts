import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSpeechRecognitionLang,
  formatSpeechTranscript,
  getSpeechErrorMessage,
  SPEECH_LANGUAGES,
} from './speechUtils';

test('getSpeechRecognitionLang maps languages appropriately', () => {
  assert.equal(getSpeechRecognitionLang('hindi'), 'hi-IN');
  assert.equal(getSpeechRecognitionLang('english'), 'en-US');
  assert.equal(getSpeechRecognitionLang('auto'), 'en-US');
  assert.equal(getSpeechRecognitionLang('unknown'), 'en-US');
});

test('formatSpeechTranscript joins existing text with new transcript', () => {
  assert.equal(formatSpeechTranscript('', 'Hello world'), 'Hello world');
  assert.equal(formatSpeechTranscript('Hello', ''), 'Hello');
  assert.equal(formatSpeechTranscript('Hello', 'world'), 'Hello world');
  assert.equal(formatSpeechTranscript('  First sentence.  ', '  Second sentence.  '), 'First sentence. Second sentence.');
});

test('getSpeechErrorMessage translates standard Web Speech API errors', () => {
  assert.ok(getSpeechErrorMessage('not-allowed').includes('Microphone access was denied'));
  assert.ok(getSpeechErrorMessage('no-speech').includes('No speech detected'));
  assert.ok(getSpeechErrorMessage('audio-capture').includes('No microphone was found'));
  assert.ok(getSpeechErrorMessage('network').includes('Network error'));
  assert.ok(getSpeechErrorMessage('other-code').includes('other-code'));
});

test('SPEECH_LANGUAGES contains valid supported entries', () => {
  assert.ok(SPEECH_LANGUAGES.some((l) => l.code === 'en-US'));
  assert.ok(SPEECH_LANGUAGES.some((l) => l.code === 'hi-IN'));
});
