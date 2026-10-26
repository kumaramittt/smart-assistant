import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatConversationAsMarkdown,
  formatConversationAsPlainText,
  sanitizeFilename,
} from './exportUtils';
import { Conversation } from '../types';

test('sanitizeFilename removes illegal characters and spaces', () => {
  assert.equal(sanitizeFilename('What is Quantum Computing?'), 'what-is-quantum-computing');
  assert.equal(sanitizeFilename('Special!@#$%^&*()_+Characters'), 'special-characters');
  assert.equal(sanitizeFilename(''), 'chat');
});

test('formatConversationAsMarkdown structures user and assistant messages with sources', () => {
  const mockConv: Conversation = {
    id: 'test-1',
    title: 'Testing Export',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Explain gravity',
        timestamp: 1700000001000,
      },
      {
        id: 'm2',
        role: 'assistant',
        content: 'Gravity is the curvature of spacetime.',
        timestamp: 1700000002000,
        sources: [
          {
            title: 'NASA Gravity',
            url: 'https://nasa.gov/gravity',
            hostname: 'nasa.gov',
            faviconUrl: '',
          },
        ],
      },
      {
        id: 'm3',
        role: 'assistant',
        content: '',
        timestamp: 1700000003000,
        isLoading: true, // Should be omitted
      },
    ],
  };

  const md = formatConversationAsMarkdown(mockConv);
  assert.ok(md.includes('# Testing Export'));
  assert.ok(md.includes('### User'));
  assert.ok(md.includes('Explain gravity'));
  assert.ok(md.includes('### Smart Assistant'));
  assert.ok(md.includes('Gravity is the curvature of spacetime.'));
  assert.ok(md.includes('[NASA Gravity](https://nasa.gov/gravity)'));
});

test('formatConversationAsPlainText outputs clean text format', () => {
  const mockConv: Conversation = {
    id: 'test-2',
    title: 'Plain Text Test',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Hello world',
        timestamp: 1700000001000,
      },
    ],
  };

  const txt = formatConversationAsPlainText(mockConv);
  assert.ok(txt.includes('SMART ASSISTANT CONVERSATION: Plain Text Test'));
  assert.ok(txt.includes('[USER'));
  assert.ok(txt.includes('Hello world'));
});
