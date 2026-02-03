// Trip Planner Type Definitions

export type FormStep = 'basic' | 'interests' | 'details';

export type BudgetLevel = 'low' | 'medium' | 'high';
export type TransportMode = 'car' | 'no-car';
export type DifficultyLevel = 'easy' | 'moderate' | 'active';

export const AVAILABLE_INTERESTS = [
  'aurora',
  'dining',
  'snowmobile',
  'husky',
  'reindeer',
  'fishing',
  'culture',
  'nature',
  'photography',
  'whale-watching',
  'hiking',
  'wellness',
  'shopping',
  'skiing',
] as const;

export type Interest = typeof AVAILABLE_INTERESTS[number];

export interface TripPreferences {
  days: number;                    // 1-14
  budget: BudgetLevel;
  interests: Interest[];
  transport: TransportMode;
  difficulty: DifficultyLevel;
  language?: string;               // 'no' | 'en'
  startDate?: string;              // YYYY-MM-DD
  groupSize?: number;              // default: 2
}

export interface Activity {
  time: string;                    // e.g., "Morning", "14:00"
  title: string;
  description: string;
  location: string;
  cost: number;                    // NOK
  duration: string;                // e.g., "2 hours"
  bookingRequired: boolean;
}

export interface AuroraInfo {
  probability: number;             // 0-100
  bestTime: string;                // e.g., "22:00"
  location: string;
}

export interface DiningInfo {
  lunch?: string;
  dinner?: string;
}

export interface DayPlan {
  day: number;
  date: string;                    // YYYY-MM-DD
  theme: string;
  activities: Activity[];
  dining: DiningInfo;
  aurora?: AuroraInfo;
}

export interface TripPlan {
  summary: string;
  days: DayPlan[];
  totalCost: number;               // NOK
  safetyNotes: string[];
  packingList: string[];
  recommendations: string[];
}

export interface TripPlanResponse {
  plan: TripPlan;
  preferences: TripPreferences;
  generatedAt: string;             // ISO 8601
  metadata: {
    companiesAvailable: number;
    guidesAvailable: number;
  };
}

// UI State
export interface TripPlannerState {
  step: FormStep;
  preferences: Partial<TripPreferences>;
  plan: TripPlan | null;
  loading: boolean;
  error: string | null;
}

// Packing List Categories
export type PackingCategory = 'klær' | 'teknologi' | 'helse' | 'dokumenter' | 'aktiviteter';

export interface PackingItem {
  id: string;
  category: PackingCategory;
  item: string;
  checked: boolean;
}

// Interest Display Metadata
export interface InterestMetadata {
  id: Interest;
  label: string;
  emoji: string;
  description: string;
}

export const INTEREST_METADATA: Record<Interest, Omit<InterestMetadata, 'id'>> = {
  aurora: { label: 'Aurora', emoji: '🌌', description: 'Northern lights viewing' },
  dining: { label: 'Dining', emoji: '🍽️', description: 'Local cuisine' },
  snowmobile: { label: 'Snowmobile', emoji: '🛷', description: 'Snowmobile tours' },
  husky: { label: 'Dog sledding', emoji: '🐕', description: 'Husky sledding' },
  reindeer: { label: 'Reindeer', emoji: '🦌', description: 'Reindeer experiences' },
  fishing: { label: 'Fishing', emoji: '🎣', description: 'Fishing trips' },
  culture: { label: 'Culture', emoji: '🏛️', description: 'Cultural activities' },
  nature: { label: 'Nature', emoji: '🏔️', description: 'Nature exploration' },
  photography: { label: 'Photography', emoji: '📸', description: 'Photography tours' },
  'whale-watching': { label: 'Whale watching', emoji: '🐋', description: 'Whale watching' },
  hiking: { label: 'Hiking', emoji: '🥾', description: 'Hiking trails' },
  wellness: { label: 'Wellness', emoji: '🧘', description: 'Spa & relaxation' },
  shopping: { label: 'Shopping', emoji: '🛍️', description: 'Local shopping' },
  skiing: { label: 'Skiing', emoji: '⛷️', description: 'Skiing activities' },
};

// Budget Display Metadata
export const BUDGET_METADATA: Record<BudgetLevel, { label: string; amount: string; description: string }> = {
  low: { label: 'Budget', amount: '800 NOK/day', description: 'Budget-friendly' },
  medium: { label: 'Moderate', amount: '1500 NOK/day', description: 'Balanced' },
  high: { label: 'Premium', amount: '3000+ NOK/day', description: 'Premium experiences' },
};

// Difficulty Display Metadata
export const DIFFICULTY_METADATA: Record<DifficultyLevel, { label: string; description: string }> = {
  easy: { label: 'Easy', description: 'Relaxed pace, minimal physical activity' },
  moderate: { label: 'Moderate', description: 'Balanced between activity and rest' },
  active: { label: 'Active', description: 'Fast pace, lots of physical activity' },
};

// Transport Display Metadata
export const TRANSPORT_METADATA: Record<TransportMode, { label: string; description: string }> = {
  car: { label: 'With car', description: 'Flexibility to explore' },
  'no-car': { label: 'Without car', description: 'Public transport and tours' },
};
