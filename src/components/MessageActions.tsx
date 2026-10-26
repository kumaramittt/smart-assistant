import React, { useState } from 'react';
import { Copy, Check, Pencil } from 'lucide-react';
import { copyTextToClipboard } from '../utils/messageUtils';

interface MessageActionsProps {
  content: string;
  isUser: boolean;
  onEdit?: () => void;
  canEdit?: boolean;
  className?: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  isUser,
  onEdit,
  canEdit = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(content);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="toolbar"
      aria-label={isUser ? 'User message actions' : 'Message actions'}
      className={`flex flex-wrap items-center gap-1 max-w-full min-w-0 select-none ${
        /* Always visible on mobile, hover-only on desktop */
        'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150'
      } ${className}`}
    >
      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? 'Copied to clipboard' : 'Copy text'}
        aria-label={copied ? 'Copied' : isUser ? 'Copy message to clipboard' : 'Copy response to clipboard'}
        className={`flex items-center gap-1.5 min-h-[40px] min-w-[40px] sm:min-h-[30px] sm:min-w-0 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
          isUser
            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 active:bg-slate-800'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        } ${copied ? 'text-emerald-500 dark:text-emerald-400' : ''}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span className="text-[11px]">Copy</span>
          </>
        )}
      </button>

      {/* Edit Button (for user messages) */}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={!canEdit}
          title={!canEdit ? 'AI is currently replying' : 'Edit message'}
          aria-label="Edit message"
          className={`flex items-center gap-1.5 min-h-[40px] min-w-[40px] sm:min-h-[30px] sm:min-w-0 px-2 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
            !canEdit
              ? 'opacity-40 cursor-not-allowed text-slate-500'
              : isUser
              ? 'cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 active:bg-slate-800'
              : 'cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Pencil className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span className="text-[11px]">Edit</span>
        </button>
      )}
    </div>
  );
};
