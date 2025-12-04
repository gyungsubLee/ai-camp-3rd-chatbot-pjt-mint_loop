import { create } from 'zustand';
import type { Message, ConversationStep, UserPreferences, Destination } from '@/lib/types';

interface ChatState {
  // Messages
  messages: Message[];

  // Conversation State
  currentStep: ConversationStep;
  isLoading: boolean;
  error: string | null;

  // Preferences (accumulated during chat)
  preferences: UserPreferences;

  // Recommendations (populated when complete)
  recommendations: Destination[] | null;

  // Session
  sessionId: string;

  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setCurrentStep: (step: ConversationStep) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setRecommendations: (recommendations: Destination[]) => void;
  resetChat: () => void;
  initSession: () => void;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const initialState = {
  messages: [],
  currentStep: 'init' as ConversationStep,
  isLoading: false,
  error: null,
  preferences: {} as UserPreferences,
  recommendations: null,
  sessionId: '',
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,
  sessionId: generateSessionId(),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        },
      ],
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  updatePreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),

  setRecommendations: (recommendations) => set({ recommendations }),

  resetChat: () =>
    set({
      ...initialState,
      sessionId: generateSessionId(),
    }),

  initSession: () => {
    const state = get();
    if (!state.sessionId) {
      set({ sessionId: generateSessionId() });
    }
  },
}));
