import { ChatMessage } from '../types';

/**
 * Truncates chat messages for an edit action:
 * Keeps all messages before the edited message index,
 * replaces the message at index with the updated content,
 * and drops all subsequent messages.
 */
export function sliceMessagesForEdit(
  messages: ChatMessage[],
  editMsgId: string,
  newContent: string,
  newTimestamp: number = Date.now()
): { updatedMessages: ChatMessage[]; editedMessage: ChatMessage | null } {
  const index = messages.findIndex((m) => m.id === editMsgId);
  if (index === -1) {
    return { updatedMessages: messages, editedMessage: null };
  }

  const oldMessage = messages[index];
  const editedMessage: ChatMessage = {
    ...oldMessage,
    content: newContent,
    timestamp: newTimestamp,
  };

  const updatedMessages = [...messages.slice(0, index), editedMessage];
  return { updatedMessages, editedMessage };
}

/**
 * Validates whether an edited message can be saved
 */
export function canSaveEdit(newContent: string, originalContent: string, isAiLoading: boolean): boolean {
  if (isAiLoading) return false;
  const trimmedNew = newContent.trim();
  const trimmedOrig = originalContent.trim();
  if (!trimmedNew) return false;
  if (trimmedNew === trimmedOrig) return false;
  return true;
}

/**
 * Copy text to clipboard with fallback for older browsers or restricted permissions
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to execCommand below
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}
