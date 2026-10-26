import test from 'node:test';
import assert from 'node:assert/strict';
import { sliceMessagesForEdit, canSaveEdit } from './messageUtils';
import { ChatMessage } from '../types';

test('sliceMessagesForEdit keeps earlier messages, updates target, and drops later messages', () => {
  const initialMessages: ChatMessage[] = [
    { id: '1', role: 'user', content: 'What is photosynthesis?', timestamp: 100 },
    { id: '2', role: 'assistant', content: 'Photosynthesis is...', timestamp: 101 },
    { id: '3', role: 'user', content: 'Explain cellular respiration', timestamp: 102 },
    { id: '4', role: 'assistant', content: 'Respiration is...', timestamp: 103 },
  ];

  const { updatedMessages, editedMessage } = sliceMessagesForEdit(
    initialMessages,
    '3',
    'Explain cellular respiration in simple terms',
    200
  );

  assert.equal(updatedMessages.length, 3);
  assert.equal(updatedMessages[0].id, '1');
  assert.equal(updatedMessages[1].id, '2');
  assert.equal(updatedMessages[2].id, '3');
  assert.equal(updatedMessages[2].content, 'Explain cellular respiration in simple terms');
  assert.equal(updatedMessages[2].timestamp, 200);
  assert.equal(editedMessage?.content, 'Explain cellular respiration in simple terms');
});

test('sliceMessagesForEdit editing first message drops everything after it', () => {
  const initialMessages: ChatMessage[] = [
    { id: '1', role: 'user', content: 'Hello', timestamp: 100 },
    { id: '2', role: 'assistant', content: 'Hi there!', timestamp: 101 },
  ];

  const { updatedMessages } = sliceMessagesForEdit(initialMessages, '1', 'Hey there friend', 300);
  assert.equal(updatedMessages.length, 1);
  assert.equal(updatedMessages[0].id, '1');
  assert.equal(updatedMessages[0].content, 'Hey there friend');
});

test('canSaveEdit prevents saving if content unchanged or empty or AI is loading', () => {
  assert.equal(canSaveEdit('same', 'same', false), false);
  assert.equal(canSaveEdit('  same  ', 'same', false), false);
  assert.equal(canSaveEdit('', 'old', false), false);
  assert.equal(canSaveEdit('   ', 'old', false), false);
  assert.equal(canSaveEdit('new text', 'old', true), false);
  assert.equal(canSaveEdit('new text', 'old', false), true);
});
