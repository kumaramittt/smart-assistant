import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectLanguage,
  formatGroundingSources,
  extractSearchQueries,
  parseAnswerSections
} from './chatUtils';

test('detectLanguage correctly detects Hindi Devanagari', () => {
  assert.equal(detectLanguage('नमस्ते, आप कैसे हैं?'), 'hindi');
  assert.equal(detectLanguage('आज भारत में मौसम कैसा है?'), 'hindi');
  assert.equal(detectLanguage('50,000 रुपये का ब्याज कितना होगा?'), 'hindi');
});

test('detectLanguage correctly detects Hinglish', () => {
  assert.equal(detectLanguage('Aaj ka weather kaisa hai?'), 'hinglish');
  assert.equal(detectLanguage('Mujhe Python me list comprehension samjhao bhai'), 'hinglish');
  assert.equal(detectLanguage('Yeh code kaise kaam karta hai?'), 'hinglish');
  assert.equal(detectLanguage('kya haal hai sab theek?'), 'hinglish');
});

test('detectLanguage falls back to English for standard English text', () => {
  assert.equal(detectLanguage('What is the capital of France?'), 'english');
  assert.equal(detectLanguage('Explain quantum computing in simple terms.'), 'english');
  assert.equal(detectLanguage('Write a python function to sort a list.'), 'english');
});

test('formatGroundingSources cleans URIs, extracts hostname and deduplicates', () => {
  const rawChunks = [
    { web: { uri: 'https://en.wikipedia.org/wiki/India', title: 'India - Wikipedia' } },
    { web: { uri: 'https://en.wikipedia.org/wiki/India', title: 'Duplicate India' } },
    { web: { uri: 'https://weather.com/forecast', title: 'Weather Forecast' } },
    { web: { uri: 'invalid-uri', title: 'Invalid' } },
    null
  ];

  const formatted = formatGroundingSources(rawChunks);
  assert.equal(formatted.length, 2);
  assert.equal(formatted[0].hostname, 'en.wikipedia.org');
  assert.equal(formatted[0].title, 'India - Wikipedia');
  assert.equal(formatted[1].hostname, 'weather.com');
  assert.ok(formatted[0].faviconUrl.includes('en.wikipedia.org'));
});

test('extractSearchQueries extracts valid queries array', () => {
  const meta = {
    webSearchQueries: ['weather today', 'latest tech news 2026', '   ', 123]
  };

  const queries = extractSearchQueries(meta);
  assert.deepEqual(queries, ['weather today', 'latest tech news 2026']);
});

test('parseAnswerSections separates direct answer from subsequent details', () => {
  const markdown = `The capital of Australia is Canberra.

### Key Details
- It is located in the Australian Capital Territory.
- Sydney and Melbourne are larger cities, but Canberra was chosen as a compromise.`;

  const parsed = parseAnswerSections(markdown);
  assert.equal(parsed.directAnswer, 'The capital of Australia is Canberra.');
  assert.ok(parsed.rest.includes('Key Details'));
  assert.ok(parsed.rest.includes('compromise'));
});
