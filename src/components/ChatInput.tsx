import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Mic,
  MicOff,
  ImagePlus,
  X,
  AlertCircle,
  Volume2,
  Check,
  Globe
} from 'lucide-react';
import { detectLanguage, DetectedLanguage } from '../utils/chatUtils';
import { fileToOptimizedDataUrl, formatFileSize } from '../utils/imageUtils';
import {
  isSpeechRecognitionSupported,
  getSpeechRecognitionLang,
  getSpeechErrorMessage,
  formatSpeechTranscript,
  SPEECH_LANGUAGES,
} from '../utils/speechUtils';
import { SupportedLanguage } from '../types';

export interface PendingImage {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
}

interface ChatInputProps {
  onSendMessage: (content: string, images?: string[]) => void;
  isLoading: boolean;
  enableSearch: boolean;
  onToggleSearch: () => void;
  languagePreference?: SupportedLanguage;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  enableSearch,
  onToggleSearch,
  languagePreference = 'auto',
}) => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<PendingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Voice-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<string>(() =>
    getSpeechRecognitionLang(languagePreference)
  );

  const [detectedLang, setDetectedLang] = useState<DetectedLanguage>('english');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputBeforeVoiceRef = useRef<string>('');

  // Keep speech recognition language in sync when languagePreference changes
  useEffect(() => {
    setSpeechLang(getSpeechRecognitionLang(languagePreference));
  }, [languagePreference]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input, interimTranscript]);

  // Real-time language detection as user types
  useEffect(() => {
    if (input.trim().length > 3) {
      setDetectedLang(detectLanguage(input));
    }
  }, [input]);

  // Handle Speech Recognition setup (Web Speech API)
  const startVoiceDictation = () => {
    setSpeechError(null);

    if (!isSpeechRecognitionSupported()) {
      setSpeechError(
        'Voice-to-Text is not supported by your browser. Please use Chrome, Edge, or Safari.'
      );
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    try {
      // Stop previous instance if running
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      baseInputBeforeVoiceRef.current = input;
      setInterimTranscript('');

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcriptPart;
          } else {
            interimChunk += transcriptPart;
          }
        }

        if (finalChunk) {
          setInput((prev) => {
            const updated = formatSpeechTranscript(prev, finalChunk);
            baseInputBeforeVoiceRef.current = updated;
            return updated;
          });
        }

        setInterimTranscript(interimChunk);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
          const userFriendlyMsg = getSpeechErrorMessage(event.error);
          setSpeechError(userFriendlyMsg);
          setTimeout(() => setSpeechError(null), 5000);
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError('Could not start microphone. Please check permissions.');
      setIsListening(false);
      setTimeout(() => setSpeechError(null), 5000);
    }
  };

  const stopVoiceDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const handleToggleVoice = () => {
    if (isListening) {
      stopVoiceDictation();
    } else {
      startVoiceDictation();
    }
  };

  // Process files selected via input, drag-and-drop, or clipboard paste
  const processFiles = async (fileList: FileList | File[]) => {
    setUploadError(null);
    const filesArray = Array.from(fileList);
    const imageFiles = filesArray.filter((f) => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setUploadError('Please select valid image files (PNG, JPG, WebP, GIF)');
      setTimeout(() => setUploadError(null), 3500);
      return;
    }

    if (images.length + imageFiles.length > 5) {
      setUploadError('Maximum 5 images per message');
      setTimeout(() => setUploadError(null), 3500);
      return;
    }

    try {
      const newImages: PendingImage[] = [];
      for (const file of imageFiles) {
        if (file.size > 15 * 1024 * 1024) {
          setUploadError(`"${file.name}" exceeds 15MB limit`);
          continue;
        }

        const dataUrl = await fileToOptimizedDataUrl(file);
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          dataUrl,
        });
      }

      setImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error('Error processing uploaded image:', err);
      setUploadError('Failed to process image. Please try again.');
      setTimeout(() => setUploadError(null), 3500);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Paste handler for clipboard screenshots
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const hasImages = Array.from(e.clipboardData.files).some((f) => f.type.startsWith('image/'));
      if (hasImages) {
        processFiles(e.clipboardData.files);
      }
    }
  };

  const canSubmit = (input.trim().length > 0 || images.length > 0) && !isLoading;

  const handleSubmit = () => {
    if (isListening) {
      stopVoiceDictation();
    }

    if (!canSubmit) return;

    const promptText = input.trim();
    const imageDataUrls = images.map((img) => img.dataUrl);

    onSendMessage(promptText, imageDataUrls.length > 0 ? imageDataUrls : undefined);

    setInput('');
    setInterimTranscript('');
    setImages([]);
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
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        aria-label="Upload image file"
        className="hidden"
      />

      {/* Speech or Upload Error Alert */}
      {(uploadError || speechError) && (
        <div className="mb-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{uploadError || speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setSpeechError(null);
            }}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Voice Dictation Banner */}
      {isListening && (
        <div
          role="status"
          aria-live="polite"
          className="mb-2.5 p-2.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/80 shadow-xs flex flex-wrap items-center justify-between gap-2 animate-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Animated Audio Wave bars */}
            <div className="flex items-center gap-1 h-5 px-1">
              <span className="w-1 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-4 bg-sky-500 dark:bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>

            <div>
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <span>Listening with Web Speech...</span>
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 truncate max-w-xs sm:max-w-md">
                {interimTranscript ? `"${interimTranscript}"` : 'Speak into your microphone now'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Dictation Language Quick Selector */}
            <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 rounded-xl px-2 py-1 border border-blue-200/80 dark:border-blue-800/80 text-[11px]">
              <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
              <select
                value={speechLang}
                onChange={(e) => {
                  setSpeechLang(e.target.value);
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.lang = e.target.value;
                  }
                }}
                aria-label="Dictation language"
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {SPEECH_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="dark:bg-slate-900 dark:text-white">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stop Dictation Button */}
            <button
              type="button"
              onClick={stopVoiceDictation}
              aria-label="Stop voice dictation"
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Container with Drag and Drop Support */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col bg-white dark:bg-slate-900 border rounded-2xl shadow-xs transition-all overflow-hidden ${
          isDragging
            ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20'
            : isListening
            ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
            : 'border-slate-300 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-950/50'
        }`}
      >
        {/* Uploaded Images Preview Strip */}
        {images.length > 0 && (
          <div className="px-3 pt-3 pb-1 flex flex-wrap items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group/thumb rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs shrink-0"
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  aria-label={`Remove image ${img.name}`}
                  title="Remove image"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 backdrop-blur-xs text-[9px] text-slate-200 text-center py-0.5 truncate px-1">
                  {formatFileSize(img.size)}
                </div>
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add more images"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-500 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px] font-medium">Add more</span>
              </button>
            )}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input + (interimTranscript ? (input ? ` ${interimTranscript}` : interimTranscript) : '')}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            isListening
              ? 'Listening to speech...'
              : images.length > 0
              ? 'Ask a question about the image(s)...'
              : 'Ask Smart Assistance (Type or click the microphone to dictate)'
          }
          rows={1}
          aria-label="Message Ask Smart Assistant"
          className="w-full resize-none px-4 pt-3 pb-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none min-h-[48px] max-h-[180px] bg-transparent"
        />

        {/* Bottom bar of input box */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-1">
            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload image"
              title="Upload image (JPG, PNG, WebP)"
              className="p-2 min-h-[40px] min-w-[40px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
            >
              <ImagePlus className="w-4 h-4" />
            </button>

            {/* Voice-to-Text Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              aria-label={isListening ? 'Stop voice dictation' : 'Start voice-to-text dictation'}
              aria-pressed={isListening}
              className={`p-2 min-h-[40px] min-w-[40px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isListening
                  ? 'bg-red-500 text-white ring-2 ring-red-400 animate-pulse shadow-md shadow-red-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isListening ? 'Click to stop voice-to-text' : 'Dictate with Voice-to-Text (Web Speech API)'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-white" />
                  <span className="text-[11px] font-bold pr-0.5">REC</span>
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {images.length > 0 && (
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
            )}

            <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500">
              {input.length > 0 ? `${input.length} chars` : ''}
            </span>

            {/* Submit Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-label="Send message"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                canSubmit
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
        Smart Assistance can make mistakes. Verify important facts.
      </p>
    </div>
  );
};
