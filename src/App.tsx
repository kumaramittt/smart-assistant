import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessageItem } from './components/ChatMessageItem';
import { EmptyState } from './components/EmptyState';
import { ChatInput } from './components/ChatInput';
import { SettingsModal, ThemeMode } from './components/SettingsModal';
import { InstallPrompt } from './components/InstallPrompt';
import { GoogleUser } from './components/GoogleAuth';
import { ChatMessage, Conversation, SupportedLanguage } from './types';
import { detectLanguage, formatGroundingSources } from './utils/chatUtils';

const STORAGE_KEY = 'smart_assistant_conversations_v1';
const THEME_KEY = 'smart_assistant_theme';
const USER_STORAGE_KEY = 'smart_assistant_user_v1';

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleLogin = (newUser: GoogleUser) => {
    setUser(newUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
  };
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
    return [];
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return null;
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {}
    return 'light';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [enableSearch, setEnableSearch] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('auto');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to persist conversations:', e);
    }
  }, [conversations]);

  // Handle Theme application (White / Black)
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Current active conversation
  const currentConversation = conversations.find((c) => c.id === activeId);
  const messages = currentConversation?.messages || [];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Start new conversation
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newId);
  };

  // Delete specific conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Clear all conversations
  const handleClearAll = () => {
    setConversations([]);
    setActiveId(null);
  };

  // Send a user prompt
  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    let targetConvId = activeId;
    let isBrandNew = false;

    if (!targetConvId || !currentConversation) {
      targetConvId = `conv-${Date.now()}`;
      isBrandNew = true;
    }

    const detectedLang = detectLanguage(userPrompt);
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
      language: detectedLang,
    };

    const assistantPlaceholderId = `msg-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isLoading: true,
      language: detectedLang,
    };

    if (isBrandNew) {
      const newConv: Conversation = {
        id: targetConvId,
        title: userPrompt.slice(0, 35) + (userPrompt.length > 35 ? '...' : ''),
        messages: [userMessage, assistantPlaceholder],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(targetConvId);
    } else {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            const isFirst = c.messages.length === 0;
            return {
              ...c,
              title: isFirst
                ? userPrompt.slice(0, 35) + (userPrompt.length > 35 ? '...' : '')
                : c.title,
              updatedAt: Date.now(),
              messages: [...c.messages, userMessage, assistantPlaceholder],
            };
          }
          return c;
        })
      );
    }

    setIsLoading(true);

    try {
      const historyToSend = (
        isBrandNew
          ? [userMessage]
          : [...(currentConversation?.messages || []), userMessage]
      ).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          enableSearch,
          languagePreference: currentLanguage,
        }),
      });

      if (!res.ok) {
        let serverMsg = '';
        try {
          const errData = await res.json();
          serverMsg = errData.error || errData.message || '';
        } catch {
          try {
            const rawText = await res.text();
            if (rawText && rawText.length < 200) {
              serverMsg = rawText;
            }
          } catch {}
        }
        throw new Error(
          `HTTP ${res.status}: ${
            serverMsg ||
            (res.status === 404
              ? 'Endpoint /api/chat not found (Verify Vercel Serverless Function /api/chat.js & vercel.json)'
              : 'Failed to reach Smart Assistant')
          }`
        );
      }

      const data = await res.json();
      const cleanedSources = formatGroundingSources(data.groundingChunks || []);
      const assistantText = data.text || 'Unable to generate response. Please try again.';

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      isLoading: false,
                      content: assistantText,
                      sources: cleanedSources,
                      searchQueries: data.searchQueries || [],
                      isGrounded: !!data.grounded,
                      language: detectedLang,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage =
        err.message || 'Smart Assistant could not complete the request. Please verify your connection.';

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      isLoading: false,
                      content: `**Notice:** ${errorMessage}\n\nPlease try again or verify network settings.`,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate an assistant response like Gemini
  const handleRegenerate = async (assistantMsgId: string) => {
    if (!activeId || !currentConversation || isLoading) return;

    const msgIndex = currentConversation.messages.findIndex((m) => m.id === assistantMsgId);
    if (msgIndex === -1) return;

    const previousUserMsg = currentConversation.messages[msgIndex - 1];
    if (!previousUserMsg || previousUserMsg.role !== 'user') return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, isLoading: true, content: '' } : m
            ),
          };
        }
        return c;
      })
    );

    setIsLoading(true);

    try {
      const historySlice = currentConversation.messages
        .slice(0, msgIndex)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historySlice,
          enableSearch,
          languagePreference: currentLanguage,
        }),
      });

      if (!res.ok) {
        let serverMsg = '';
        try {
          const errData = await res.json();
          serverMsg = errData.error || errData.message || '';
        } catch {
          try {
            const rawText = await res.text();
            if (rawText && rawText.length < 200) {
              serverMsg = rawText;
            }
          } catch {}
        }
        throw new Error(`Failed to regenerate answer: HTTP ${res.status}${serverMsg ? `: ${serverMsg}` : ''}`);
      }

      const data = await res.json();
      const cleanedSources = formatGroundingSources(data.groundingChunks || []);
      const assistantText = data.text || 'Unable to regenerate answer. Please try again.';

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      isLoading: false,
                      content: assistantText,
                      sources: cleanedSources,
                      searchQueries: data.searchQueries || [],
                      isGrounded: !!data.grounded,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('Regenerate error:', err);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      isLoading: false,
                      content: `**Error while regenerating:** ${err.message || 'Please try again.'}`,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-200">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* History Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={setActiveId}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onClearAll={handleClearAll}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chat Area: FIXED center on home page without vertical movement, scrollable when messages exist */}
      {messages.length === 0 ? (
        <main className="flex-1 flex flex-col items-center justify-center overflow-hidden overflow-x-hidden w-full max-w-4xl mx-auto px-3 sm:px-4 select-none">
          <EmptyState onSelectPrompt={handleSendMessage} />
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
          <div className="w-full max-w-full space-y-4 overflow-hidden">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onRegenerate={msg.role === 'assistant' ? handleRegenerate : undefined}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>
      )}

      {/* Fixed Bottom Chat Input */}
      <footer className="shrink-0 w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 pt-2 pb-1 z-20 transition-colors duration-200">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          enableSearch={enableSearch}
          onToggleSearch={() => setEnableSearch(!enableSearch)}
        />
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        enableSearch={enableSearch}
        onToggleSearch={() => setEnableSearch(!enableSearch)}
        languagePreference={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onClearAllConversations={handleClearAll}
        conversationCount={conversations.length}
      />

      {/* PWA Install Prompt Banner */}
      <InstallPrompt />
    </div>
  );
}
