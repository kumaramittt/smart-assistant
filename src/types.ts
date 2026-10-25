import { GroundingSource } from './utils/chatUtils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: GroundingSource[];
  searchQueries?: string[];
  language?: string;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
}

export type SupportedLanguage = 'auto' | 'english' | 'hindi' | 'hinglish';
