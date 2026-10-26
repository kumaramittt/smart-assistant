import React, { useState } from 'react';
import { marked } from 'marked';
import {
  Volume2,
  VolumeX,
  ExternalLink,
  Globe,
  Search,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { ChatMessage } from '../types';
import { formatTime, parseAnswerSections } from '../utils/chatUtils';
import { BrandLogo } from './BrandLogo';
import { MessageActions } from './MessageActions';
import { EditableMessage } from './EditableMessage';

// Configure marked for clean, safe output
marked.setOptions({
  gfm: true,
  breaks: true,
});

interface ChatMessageItemProps {
  message: ChatMessage;
  onRegenerate?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  isAiLoading?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRegenerate,
  onEditMessage,
  isAiLoading = false,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isUser = message.role === 'user';

  // Handle Text-to-Speech playback
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);

    // Auto-select matching voice for Hindi/English if available
    const voices = window.speechSynthesis.getVoices();
    if (message.language === 'hindi') {
      const hiVoice = voices.find((v) => v.lang.startsWith('hi'));
      if (hiVoice) utterance.voice = hiVoice;
    }

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 1. User Message Rendering
  if (isUser) {
    return (
      <div className="flex flex-col items-end mb-4 group max-w-full overflow-hidden">
        {isEditing ? (
          <div className="w-full max-w-[95%] sm:max-w-[85%]">
            <EditableMessage
              initialContent={message.content}
              onSave={(newContent) => {
                setIsEditing(false);
                onEditMessage?.(message.id, newContent);
              }}
              onCancel={() => setIsEditing(false)}
              isSaving={isAiLoading}
            />
          </div>
        ) : (
          <>
            <div className="max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-blue-600 dark:bg-blue-600 text-white px-4 py-3 shadow-xs [overflow-wrap:anywhere] [word-break:break-word] relative">
              <p className="text-sm leading-relaxed whitespace-pre-wrap selectable-message-text [overflow-wrap:anywhere] [word-break:break-word]">
                {message.content}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-blue-100 select-none">
                <span>{formatTime(message.timestamp)}</span>
              </div>
            </div>

            {/* User Message Action Toolbar: Copy & Edit */}
            <div className="mt-1 flex items-center justify-end">
              <MessageActions
                content={message.content}
                isUser={true}
                onEdit={() => setIsEditing(true)}
                canEdit={!isAiLoading}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // 2. Assistant Message rendering
  const { directAnswer, rest } = parseAnswerSections(message.content);
  const sources = message.sources || [];
  const searchQueries = message.searchQueries || [];
  const displayedSources = showAllSources ? sources : sources.slice(0, 3);

  // Parse HTML
  const directAnswerHtml = marked.parse(directAnswer) as string;
  const restHtml = rest ? (marked.parse(rest) as string) : '';

  return (
    <div className="flex gap-2.5 sm:gap-3 mb-6 group max-w-full overflow-hidden">
      {/* Assistant Avatar */}
      <BrandLogo size="sm" className="mt-0.5 shrink-0" />

      <div className="flex-1 min-w-0 max-w-full overflow-hidden">
        {/* Assistant Header & Badges */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap select-none">
          <span className="font-semibold text-slate-900 dark:text-white text-xs">Smart Assistant</span>

          {message.language && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Globe className="w-2.5 h-2.5" />
              <span className="capitalize">{message.language}</span>
            </span>
          )}

          {sources.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <Search className="w-2.5 h-2.5" />
              <span>Grounded with Google Search</span>
            </span>
          )}

          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message Bubble Body */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3.5 sm:p-5 shadow-xs space-y-3.5 text-slate-900 dark:text-slate-100 transition-colors w-full max-w-full min-w-0 overflow-hidden [overflow-wrap:anywhere] [word-break:break-word]">
          {/* Loading indicator */}
          {message.isLoading ? (
            <div className="flex items-center gap-2.5 py-2 text-slate-500 dark:text-slate-400 text-xs">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="italic">Smart Assistant is thinking and searching...</span>
            </div>
          ) : (
            <>
              {/* Direct Answer Highlight */}
              {directAnswer && (
                <div className="bg-slate-50/90 dark:bg-slate-800/70 border-l-3 border-blue-500 rounded-r-xl p-3 sm:p-3.5 text-slate-900 dark:text-slate-100 max-w-full overflow-hidden [overflow-wrap:anywhere] [word-break:break-word]">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1 select-none">
                    <Sparkles className="w-3 h-3" />
                    <span>Direct Answer</span>
                  </div>
                  <div
                    className="prose-assistant text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-snug selectable-message-text"
                    dangerouslySetInnerHTML={{ __html: directAnswerHtml }}
                  />
                </div>
              )}

              {/* Elaboration / Key Points / Steps / Tables / Code */}
              {rest && (
                <div
                  className="prose-assistant text-slate-800 dark:text-slate-200 text-sm leading-relaxed selectable-message-text"
                  dangerouslySetInnerHTML={{ __html: restHtml }}
                />
              )}

              {/* Google Search Queries */}
              {searchQueries.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 select-none">
                  <span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Search className="w-3 h-3 text-slate-400" />
                    Searched:
                  </span>
                  {searchQueries.map((query, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200/70 dark:border-slate-700 selectable-message-text"
                    >
                      "{query}"
                    </span>
                  ))}
                </div>
              )}

              {/* Grounding Sources (Google Search Citations) */}
              {sources.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      Sources ({sources.length})
                    </span>
                    {sources.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllSources(!showAllSources)}
                        className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {showAllSources ? 'Show less' : `View all ${sources.length}`}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-w-full overflow-hidden">
                    {displayedSources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors text-left group/card cursor-pointer min-w-0 max-w-full overflow-hidden"
                      >
                        <img
                          src={source.faviconUrl}
                          alt=""
                          className="w-4 h-4 rounded-xs mt-0.5 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400">
                            {source.title}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <span className="truncate">{source.hostname}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Toolbar: flex-wrap to prevent horizontal overflow on mobile */}
          {!message.isLoading && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 max-w-full min-w-0 text-slate-400 dark:text-slate-500 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-full">
                {/* Unified MessageActions for Copy */}
                <MessageActions content={message.content} isUser={false} />

                {/* Regenerate Button */}
                {onRegenerate && (
                  <button
                    type="button"
                    onClick={() => onRegenerate(message.id)}
                    disabled={isAiLoading}
                    title="Regenerate answer"
                    aria-label="Regenerate response like Gemini"
                    className="flex items-center gap-1.5 min-h-[40px] min-w-[40px] sm:min-h-[30px] sm:min-w-0 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer min-w-0 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px]">Regenerate</span>
                  </button>
                )}

                {/* Text to Speech Voice Audio playback */}
                <button
                  type="button"
                  onClick={handleToggleSpeak}
                  title={speaking ? 'Stop speaking' : 'Read aloud'}
                  aria-label={speaking ? 'Stop reading response' : 'Read answer aloud'}
                  className={`flex items-center gap-1.5 min-h-[40px] min-w-[40px] sm:min-h-[30px] sm:min-w-0 px-2 py-1 rounded-lg transition-colors cursor-pointer min-w-0 shrink-0 ${
                    speaking
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {speaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse shrink-0" />
                      <span className="text-[11px]">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px]">Listen</span>
                    </>
                  )}
                </button>
              </div>

              {/* Grounded AI answer label */}
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 min-w-0 shrink-0 ml-auto sm:ml-0 select-none">
                <span>Grounded AI answer</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
