import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AiSuggestionState {
    suggestions: Record<string, string>; // Key: "YYYY-MM", Value: Suggestion Text
    lastGeneratedAt: number; // Timestamp of last generation

    saveSuggestion: (year: number, month: number, text: string) => void;
    getSuggestion: (year: number, month: number) => string | undefined;
    checkRateLimit: () => boolean; // Returns true if allowed to generate
    updateLastGeneratedAt: () => void;
}

export const useAiSuggestionStore = create<AiSuggestionState>()(
    persist(
        (set, get) => ({
            suggestions: {},
            lastGeneratedAt: 0,

            saveSuggestion: (year, month, text) => {
                const key = `${year}-${month}`;
                set((state) => ({
                    suggestions: {
                        ...state.suggestions,
                        [key]: text,
                    },
                }));
            },

            getSuggestion: (year, month) => {
                const key = `${year}-${month}`;
                return get().suggestions[key];
            },

            checkRateLimit: () => {
                const now = Date.now();
                const last = get().lastGeneratedAt;
                const cooldown = 10 * 60 * 1000; // 10 minutes
                return now - last >= cooldown;
            },

            updateLastGeneratedAt: () => {
                set({ lastGeneratedAt: Date.now() });
            },
        }),
        {
            name: 'life-pwa-ai-suggestions',
        }
    )
);
