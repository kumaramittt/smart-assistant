import { Conversation } from '../types';

/**
 * Format a conversation into structured, readable Markdown
 */
export function formatConversationAsMarkdown(conversation: Conversation): string {
  const dateStr = new Date(conversation.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const lines: string[] = [
    `# ${conversation.title || 'Smart Assistant Conversation'}`,
    `_Exported from Smart Assistant on ${dateStr}_\n`,
    '---\n',
  ];

  for (const msg of conversation.messages) {
    if (msg.isLoading) continue;

    const time = msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    const sender = msg.role === 'user' ? 'User' : 'Smart Assistant';

    lines.push(`### ${sender}${time ? ` (${time})` : ''}\n`);
    if (msg.images && msg.images.length > 0) {
      lines.push(`*[Attached: ${msg.images.length} image${msg.images.length > 1 ? 's' : ''}]*\n`);
    }
    if (msg.content) {
      lines.push(msg.content.trim() + '\n');
    }

    if (msg.sources && msg.sources.length > 0) {
      lines.push('**Sources:**');
      for (const s of msg.sources) {
        lines.push(`- [${s.title || s.hostname || s.url}](${s.url})`);
      }
      lines.push('\n');
    }

    lines.push('---\n');
  }

  return lines.join('\n');
}

/**
 * Format a conversation into simple, readable plain text
 */
export function formatConversationAsPlainText(conversation: Conversation): string {
  const dateStr = new Date(conversation.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const lines: string[] = [
    `SMART ASSISTANT CONVERSATION: ${conversation.title || 'Chat'}`,
    `Exported on: ${dateStr}`,
    '='.repeat(40),
    '',
  ];

  for (const msg of conversation.messages) {
    if (msg.isLoading) continue;

    const time = msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    const sender = msg.role === 'user' ? 'USER' : 'SMART ASSISTANT';

    lines.push(`[${sender}${time ? ` - ${time}` : ''}]`);
    if (msg.images && msg.images.length > 0) {
      lines.push(`[Attached: ${msg.images.length} image(s)]`);
    }
    if (msg.content) {
      lines.push(msg.content.trim());
    }

    if (msg.sources && msg.sources.length > 0) {
      lines.push('Sources:');
      for (const s of msg.sources) {
        lines.push(`  * ${s.title || s.hostname}: ${s.url}`);
      }
    }

    lines.push('');
    lines.push('-'.repeat(30));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Clean title to form a valid file name
 */
export function sanitizeFilename(title: string): string {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return clean || 'chat';
}

/**
 * Trigger client-side file download via a Blob
 */
export function downloadFile(content: string, filename: string, mimeType: string): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('File download failed:', err);
    return false;
  }
}
