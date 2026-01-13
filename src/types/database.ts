// Database Schema Type Definitions for Tripplanner Tromsø

export type Season = 'summer' | 'winter' | 'polar-night';

export type CategoryId =
  | 'museums'
  | 'galleries'
  | 'activities'
  | 'shopping'
  | 'interior'
  | 'food-drink'
  | 'health-beauty'
  | 'accommodation'
  | 'transport'
  | 'whats-on';

export type PilarType = 'featured' | 'essential';

// Featured Content Pilars (anchor points like Fjellheisen, Ishavskatedralen)
export type FeaturedPilar =
  | 'fjellheisen'
  | 'ishavskatedralen'
  | 'polarmuseet'
  | 'fjordcruise'
  | 'arctic-cathedral';

// Essential Theme Pilars (Tromsø DNA)
export type EssentialTheme =
  | 'nature'
  | 'culture'
  | 'science'
  | 'arctic-wilderness'
  | 'sami-heritage'
  | 'northern-lights';

// Category with Norwegian labels
export interface Category {
  id: CategoryId;
  name: string;
  nameNo: string;
  description: string;
  icon: string;
  sortOrder: number;
}

// Point of Interest
export interface POI {
  id: string;
  name: string;
  nameNo: string;
  category: CategoryId;
  description: string;
  descriptionNo: string;

  // Location
  latitude: number;
  longitude: number;
  address: string;

  // Availability
  seasons: Season[];
  openingHours: OpeningHours;

  // Pricing
  priceLevel: 'free' | 'low' | 'medium' | 'high';
  estimatedCost: number; // NOK

  // External integrations
  checkfrontItemId?: string;
  googlePlaceId?: string;
  bookingUrl?: string;

  // AI weights
  pilarType?: PilarType;
  featuredPilar?: FeaturedPilar;
  essentialThemes: EssentialTheme[];
  aiWeight: number; // 1-10 (higher = more important for AI recommendations)

  // Metadata
  imageUrl?: string;
  website?: string;
  phone?: string;
  email?: string;

  // Activity-specific
  duration?: number; // minutes
  bookingRequired: boolean;
  cancellationPolicy?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Opening Hours structure
export interface OpeningHours {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
  specialDays?: SpecialDay[];
}

export interface TimeRange {
  open: string; // HH:MM format
  close: string; // HH:MM format
  closed?: boolean;
}

export interface SpecialDay {
  date: string; // YYYY-MM-DD
  open?: string;
  close?: string;
  closed: boolean;
  reason?: string; // e.g., "Christmas Day"
}

// Checkfront Integration
export interface CheckfrontItem {
  itemId: string;
  poiId: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  availability: CheckfrontAvailability[];
  lastSynced: Date;
}

export interface CheckfrontAvailability {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
  price: number;
  capacity: number;
  booked: number;
}

// Restaurant Booking Integration
export interface RestaurantBooking {
  poiId: string;
  restaurantName: string;
  bookingPlatform: 'opentable' | 'quandoo' | 'resdiary' | 'google-places';
  externalId: string;
  availability: RestaurantAvailability[];
  lastSynced: Date;
}

export interface RestaurantAvailability {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
  partySize: number;
}

// Pilar Configuration (AI weights)
export interface PilarConfig {
  id: string;
  type: PilarType;
  name: string;
  description: string;
  weight: number; // 1-10
  associatedPOIs: string[]; // POI IDs
  essentialTheme?: EssentialTheme;
  featuredPilar?: FeaturedPilar;
}

// Season Configuration
export interface SeasonConfig {
  season: Season;
  name: string;
  nameNo: string;
  startMonth: number; // 1-12
  endMonth: number; // 1-12
  description: string;
  highlights: string[];
  weatherInfo: string;
}

// AI Curator Context (for prompt building)
export interface AICuratorContext {
  season: Season;
  availablePOIs: POI[];
  featuredPilars: PilarConfig[];
  essentialThemes: PilarConfig[];
  checkfrontAvailability: CheckfrontItem[];
  restaurantAvailability: RestaurantBooking[];
  userPreferences: {
    days: number;
    budget: number;
    interests: string[];
    pace: 'relaxed' | 'moderate' | 'active';
    transport: 'car' | 'no-car';
  };
}

// Database Query Filters
export interface POIFilters {
  categories?: CategoryId[];
  seasons?: Season[];
  priceLevel?: ('free' | 'low' | 'medium' | 'high')[];
  essentialThemes?: EssentialTheme[];
  featuredPilars?: FeaturedPilar[];
  bookingRequired?: boolean;
  minAiWeight?: number;
}
