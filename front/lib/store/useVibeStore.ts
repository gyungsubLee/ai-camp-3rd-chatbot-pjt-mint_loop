import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserPreferences,
  Destination,
  HiddenSpot,
  StylingRecommendation,
  Concept,
} from '@/lib/types';

interface GeneratedImage {
  spotId: string;
  imageUrl: string;
  timestamp: number;
}

interface VibeState {
  // Session
  sessionId: string | null;

  // User Preferences
  preferences: UserPreferences;

  // Selected Items
  selectedConcept: Concept | null;
  selectedDestination: Destination | null;
  selectedSpots: HiddenSpot[];

  // Recommendations
  destinations: Destination[];
  hiddenSpots: HiddenSpot[];
  styling: StylingRecommendation | null;

  // Generated Images
  generatedImages: GeneratedImage[];

  // Actions
  setSessionId: (id: string) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setConcept: (concept: Concept) => void;
  setDestinations: (destinations: Destination[]) => void;
  selectDestination: (destination: Destination) => void;
  setHiddenSpots: (spots: HiddenSpot[]) => void;
  toggleSpotSelection: (spot: HiddenSpot) => void;
  setStyling: (styling: StylingRecommendation) => void;
  addGeneratedImage: (spotId: string, imageUrl: string) => void;
  getGeneratedImage: (spotId: string) => string | undefined;
  resetSession: () => void;
}

const initialState = {
  sessionId: null,
  preferences: {} as UserPreferences,
  selectedConcept: null,
  selectedDestination: null,
  selectedSpots: [],
  destinations: [],
  hiddenSpots: [],
  styling: null,
  generatedImages: [],
};

export const useVibeStore = create<VibeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSessionId: (id) => set({ sessionId: id }),

      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setConcept: (concept) =>
        set((state) => ({
          selectedConcept: concept,
          preferences: { ...state.preferences, concept },
        })),

      setDestinations: (destinations) => set({ destinations }),

      selectDestination: (destination) =>
        set({
          selectedDestination: destination,
          hiddenSpots: [],
          selectedSpots: [],
        }),

      setHiddenSpots: (spots) => set({ hiddenSpots: spots }),

      toggleSpotSelection: (spot) =>
        set((state) => {
          const isSelected = state.selectedSpots.some((s) => s.id === spot.id);
          return {
            selectedSpots: isSelected
              ? state.selectedSpots.filter((s) => s.id !== spot.id)
              : [...state.selectedSpots, spot],
          };
        }),

      setStyling: (styling) => set({ styling }),

      addGeneratedImage: (spotId, imageUrl) =>
        set((state) => ({
          generatedImages: [
            ...state.generatedImages.filter((img) => img.spotId !== spotId),
            { spotId, imageUrl, timestamp: Date.now() },
          ],
        })),

      getGeneratedImage: (spotId) => {
        const state = get();
        return state.generatedImages.find((img) => img.spotId === spotId)
          ?.imageUrl;
      },

      resetSession: () => set(initialState),
    }),
    {
      name: 'tripkit-vibe-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        preferences: state.preferences,
        selectedConcept: state.selectedConcept,
        selectedDestination: state.selectedDestination,
        // generatedImages: state.generatedImages,
      }),
    }
  )
);
