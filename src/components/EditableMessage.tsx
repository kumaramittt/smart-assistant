import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { canSaveEdit } from '../utils/messageUtils';

interface EditableMessageProps {
  initialContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const EditableMessage: React.FC<EditableMessageProps> = ({
  initialContent,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [text, setText] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit text content
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  };

  useEffect(() => {
    adjustHeight();
    // Auto-focus and place cursor at end
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustHeight();
  };

  const isSaveDisabled = !canSaveEdit(text, initialContent, isSaving);

  const handleSave = () => {
    if (isSaveDisabled) return;
    onSave(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isSaveDisabled) {
        handleSave();
      }
    }
  };

  return (
    <div className="w-full max-w-full rounded-2xl bg-slate-800/95 dark:bg-slate-900 border border-slate-700 p-3 sm:p-4 shadow-lg text-white box-border overflow-hidden">
      <div className="relative">
        <label htmlFor="edit-message-textarea" className="sr-only">
          Edit message
        </label>
        <textarea
          id="edit-message-textarea"
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Edit your message..."
          disabled={isSaving}
          className="w-full max-w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed transition-all selectable-message-text"
        />
      </div>

      {/* Button Row */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 max-w-full min-w-0">
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          <kbd className="px-1.5 py-0.5 bg-slate-700/70 rounded text-[10px] text-slate-300 border border-slate-600/50">
            Esc
          </kbd>{' '}
          to cancel,{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-700/70 rounded text-[10px] text-slate-300 border border-slate-600/50">
            Ctrl+Enter
          </kbd>{' '}
          to save
        </span>

        <div className="flex flex-wrap items-center gap-2 ml-auto w-full sm:w-auto justify-end">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Cancel editing"
            className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 active:bg-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          {/* Save & Send Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            aria-label="Save and send edited message"
            className={`flex-1 sm:flex-initial min-h-[40px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-white transition-all flex items-center justify-center gap-1.5 ${
              isSaveDisabled
                ? 'bg-blue-600/40 text-blue-200/50 cursor-not-allowed border border-blue-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] shadow-md shadow-blue-600/25 cursor-pointer'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Save & Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
