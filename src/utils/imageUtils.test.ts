import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDataUrl, formatFileSize } from './imageUtils';

test('parseDataUrl extracts valid mimeType and base64 string from data URL', () => {
  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const parsed = parseDataUrl(dataUrl);
  assert.ok(parsed);
  assert.equal(parsed.mimeType, 'image/png');
  assert.equal(parsed.base64Data, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
});

test('parseDataUrl handles JPEG and WebP data URLs', () => {
  const jpegUrl = 'data:image/jpeg;base64,12345';
  const parsedJpeg = parseDataUrl(jpegUrl);
  assert.equal(parsedJpeg?.mimeType, 'image/jpeg');
  assert.equal(parsedJpeg?.base64Data, '12345');

  const webpUrl = 'data:image/webp;base64,abcdef';
  const parsedWebp = parseDataUrl(webpUrl);
  assert.equal(parsedWebp?.mimeType, 'image/webp');
  assert.equal(parsedWebp?.base64Data, 'abcdef');
});

test('parseDataUrl returns null for invalid input', () => {
  assert.equal(parseDataUrl(''), null);
  // @ts-ignore
  assert.equal(parseDataUrl(null), null);
});

test('formatFileSize formats bytes correctly', () => {
  assert.equal(formatFileSize(500), '500 B');
  assert.equal(formatFileSize(1024), '1.0 KB');
  assert.equal(formatFileSize(1024 * 1024 * 2.5), '2.5 MB');
});
