import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Search, Sparkles } from 'lucide-react';
import { detectLanguage, DetectedLanguage } from '../utils/chatUtils';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  enableSearch: boolean;
  onToggleSearch: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  enableSearch,
  onToggleSearch,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [detectedLang, setDetectedLang] = useState<DetectedLanguage>('english');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Real-time language detection as user types
  useEffect(() => {
    if (input.trim().length > 3) {
      setDetectedLang(detectLanguage(input));
    }
  }, [input]);

  // Handle Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Default speech recognition to Hindi/English bilingual

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-3">
      {/* Input Container */}
      <div className="relative flex flex-col bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-950/50 rounded-2xl shadow-sm transition-all overflow-hidden">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Smart Assistance"
          rows={1}
          aria-label="Message Ask Smart Assistant"
          className="w-full resize-none px-4 pt-3 pb-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none min-h-[48px] max-h-[180px] bg-transparent"
        />

        {/* Bottom bar of input box */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-1">
            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-50 text-red-600 animate-pulse'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice input (Hindi/English)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500">
              {input.length > 0 ? `${input.length} chars` : ''}
            </span>

            {/* Submit Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                input.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
        Smart Assistance can make mistakes.
      </p>
    </div>
  );
};
