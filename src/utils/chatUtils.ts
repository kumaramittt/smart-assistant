/**
 * Pure utility functions for Smart Assistant
 * Decoupled for unit testing and fast feedback.
 */

export interface GroundingSource {
  title: string;
  url: string;
  hostname: string;
  faviconUrl: string;
}

export type DetectedLanguage = 'hindi' | 'hinglish' | 'english' | 'other';

const HINGLISH_KEYWORDS = new Set([
  'aaj', 'kya', 'hai', 'kaise', 'karo', 'batao', 'samjhao', 'mera', 'meri',
  'hum', 'nahi', 'hota', 'karna', 'kripya', 'chahiye', 'kar', 'mein', 'pe',
  'se', 'ko', 'yeh', 'woh', 'sab', 'kuch', 'kitna', 'kitne', 'kyun', 'kaha',
  'kaun', 'acha', 'theek', 'thik', 'bhai', 'yaar', 'bolo', 'sunao', 'chal'
]);

/**
 * Detect language heuristics for prompt guidance
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim().length === 0) return 'english';

  // Devanagari Unicode range: \u0900 - \u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) {
    return 'hindi';
  }

  // Tokenize roman words and check for common Hinglish words
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let hinglishCount = 0;
  for (const word of words) {
    if (HINGLISH_KEYWORDS.has(word)) {
      hinglishCount++;
    }
  }

  // If 2 or more Hinglish keywords or >20% of words are Hinglish
  if (hinglishCount >= 2 || (words.length > 0 && hinglishCount / words.length >= 0.25)) {
    return 'hinglish';
  }

  return 'english';
}

/**
 * Clean and normalize Grounding Chunks from Gemini API
 */
export function formatGroundingSources(chunks: any[] | undefined): GroundingSource[] {
  if (!chunks || !Array.isArray(chunks)) return [];

  const seenUrls = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const chunk of chunks) {
    if (!chunk) continue;
    const web = chunk.web || chunk;
    const uri = web.uri || web.url;
    if (!uri || typeof uri !== 'string' || !uri.startsWith('http')) continue;

    if (seenUrls.has(uri)) continue;
    seenUrls.add(uri);

    let hostname = '';
    try {
      const parsed = new URL(uri);
      hostname = parsed.hostname.replace(/^www\./, '');
    } catch {
      hostname = 'web';
    }

    const title = (web.title && typeof web.title === 'string' && web.title.trim().length > 0)
      ? web.title.trim()
      : hostname;

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

    sources.push({
      title,
      url: uri,
      hostname,
      faviconUrl,
    });
  }

  return sources;
}

/**
 * Extract clean search queries from Gemini Grounding metadata
 */
export function extractSearchQueries(metadata: any): string[] {
  if (!metadata) return [];
  const queries = metadata.webSearchQueries || metadata.searchQueries || [];
  if (!Array.isArray(queries)) return [];

  return queries
    .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    .map(q => q.trim());
}

/**
 * Split text to highlight first 1-2 lines (Google Search direct answer style)
 */
export function parseAnswerSections(markdown: string): { directAnswer: string; rest: string } {
  if (!markdown) return { directAnswer: '', rest: '' };

  const trimmed = markdown.trim();
  // Split into paragraphs (separated by double newlines)
  const paragraphs = trimmed.split(/\n\s*\n/);

  if (paragraphs.length <= 1) {
    // If only one short paragraph, treat as direct answer
    return { directAnswer: trimmed, rest: '' };
  }

  const directAnswer = paragraphs[0].trim();
  const rest = paragraphs.slice(1).join('\n\n').trim();

  return { directAnswer, rest };
}

/**
 * Format relative timestamp for chat bubbles
 */
export function formatTime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
