// User Types
export interface UserPreferences {
  mood?: 'romantic' | 'adventurous' | 'nostalgic' | 'peaceful';
  aesthetic?: 'urban' | 'nature' | 'vintage' | 'modern';
  duration?: 'short' | 'medium' | 'long';
  interests?: Interest[];
  concept?: Concept;
}

export type Interest =
  | 'photography'
  | 'food'
  | 'art'
  | 'history'
  | 'nature'
  | 'architecture';

export type Concept = 'flaneur' | 'filmlog' | 'midnight';

export type ConversationStep =
  | 'init'
  | 'mood'
  | 'aesthetic'
  | 'duration'
  | 'interests'
  | 'complete';

// Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Destination Types
export interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  matchReason: string;
  bestTimeToVisit: string;
  photographyScore: number;
  transportAccessibility: 'easy' | 'moderate' | 'challenging';
  safetyRating: number;
  estimatedBudget?: '$' | '$$' | '$$$';
  tags?: string[];
  image?: string;
  thumbnail?: string;
}

// Hidden Spot Types
export interface HiddenSpot {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  photographyTips: string[];
  bestTimeToVisit: string;
  estimatedDuration: string;
  nearbyAmenities: string[];
  accessibilityNotes: string;
  crowdLevel: 'low' | 'medium' | 'high';
  localTip?: string;
  filmRecommendations: FilmRecommendation[];
  safetyNotes?: string;
  image?: string;
}

export interface FilmRecommendation {
  filmStock: string;
  reason: string;
}

// Styling Types
export interface StylingRecommendation {
  cameraModel: string;
  cameraDescription?: string;
  rentalInfo?: {
    available: boolean;
    estimatedCost: string;
    whereToRent: string;
  };
  filmStock: FilmStock;
  cameraSettings: CameraSettings;
  outfitSuggestions: OutfitSuggestion;
  props: Prop[];
  bestAngles: Angle[];
  locationSpecificTips?: {
    localInsights: string;
    weatherConsiderations: string;
    crowdAvoidance: string;
    seasonalNotes: string;
  };
}

export interface FilmStock {
  name: string;
  iso: number;
  colorProfile: string;
  characteristics: string[];
  sampleImages?: string[];
  priceRange: '$' | '$$' | '$$$';
  exposuresPerRoll?: number;
  bestFor?: string[];
}

export interface CameraSettings {
  aperture: string;
  shutterSpeed: string;
  iso: number;
  focusMode: 'auto' | 'manual';
  meteringMode: string;
  lightingNotes: string;
  advancedTips?: string[];
}

export interface OutfitSuggestion {
  colorPalette: string[];
  colorNames?: string[];
  style: string;
  specificItems: string[];
  seasonalNotes: string;
  avoidItems?: string[];
  shoppingTips?: string;
}

export interface Prop {
  name: string;
  purpose: string;
  whereToFind: string;
  optional: boolean;
  stylingTips?: string;
}

export interface Angle {
  description: string;
  visualExample?: string;
  technique: string;
  bestLighting: string;
  cameraHeight?: string;
  diagramUrl?: string;
}

// API Types
export interface ChatRequest {
  sessionId: string;
  message: string;
  currentStep: ConversationStep;
  preferences: UserPreferences;
}

export interface ChatResponse {
  reply: string;
  nextStep: ConversationStep;
  isComplete: boolean;
  recommendations: Destination[] | null;
  sessionId: string;
}

export interface ImageGenerationRequest {
  locationId: string;
  locationName: string;
  locationDescription: string;
  concept: Concept;
  filmStock: string;
  outfitStyle: string;
  timeOfDay?: 'morning' | 'noon' | 'sunset' | 'night';
  composition?: 'center' | 'left-third' | 'right-third';
  expression?: string;
}

export interface ImageGenerationResponse {
  imageUrl?: string;
  prompt?: string;
  generationTime?: number;
  status: 'success' | 'pending' | 'failed';
  taskId?: string;
  pollUrl?: string;
  errorMessage?: string;
}
