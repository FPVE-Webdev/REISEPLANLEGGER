/**
 * Activity Type Definition
 * Extends company data with family-friendly, transport, and DNA tagging
 */

export type ActivityCategory =
  | 'museums_attractions'
  | 'activities'
  | 'health_beauty'
  | 'whats_on'
  | 'food_drink'
  | 'public_space';

export type BookingMethod = 'CHECKFRONT' | 'EXTERNAL_URL' | 'DROP_IN' | 'NONE';

export type DNATag =
  | 'vitenskap_innovasjon'
  | 'historie_kultur'
  | 'natur_landskap'
  | 'lokal_karakter'
  | 'sosialt'
  | 'sport'
  | 'kunst'
  | 'mat'
  | 'helse'
  | 'vinter';

export interface TransportInfo {
  type: 'walking' | 'bus' | 'car' | 'combined';
  distance_km?: number;
  description: string;
  bus_routes?: string[]; // e.g., ["33", "34"]
  bus_stop?: string; // e.g., "Telegrafbukta"
  walking_minutes?: number;
  drive_minutes?: number;
  svipper_url?: string; // Link to Svipper route
}

export interface Activity {
  // Base company fields
  id: string;
  name: string;
  slug: string;
  category: ActivityCategory;
  description: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image_webp?: string;
  image_jpg?: string;

  // Location
  location_id?: string;
  lat?: number;
  lon?: number;

  // Family & Accessibility
  is_family_friendly: boolean;
  min_age?: number;
  max_age?: number;
  wheelchair_accessible?: boolean;
  indoor?: boolean; // Important for bad weather activities

  // Transport
  transport_info: TransportInfo;

  // Booking
  booking_method: BookingMethod;
  booking_url?: string; // For CHECKFRONT or EXTERNAL_URL
  instant_booking: boolean;

  // Tromsø DNA - Essential themes
  dna_tags: DNATag[];

  // Content
  opening_hours?: Record<string, string>; // { "monday": "10:00-18:00", ... }
  features?: string[]; // ["wifi", "parking", "restaurant", ...]
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  estimated_cost_nok?: number;
  duration_minutes?: number;

  // Metadata
  verified: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Activity with recommendations context
 * Used in chat/trips responses
 */
export interface ActivityRecommendation extends Activity {
  relevance_score?: number; // 0-100, why AI recommends this
  suggested_for?: string[]; // e.g., ["families_with_kids", "bad_weather", "aurora_viewing"]
  best_time?: string; // e.g., "Evening", "Daytime", "Night"
  estimated_total_cost?: number; // Including transport if relevant
}

/**
 * Activity context for AI chatbot
 * Compact version sent to chat Edge Function
 */
export interface ActivityContext {
  name: string;
  category: ActivityCategory;
  description: string;
  transport: string; // e.g., "Bus 33/34 to Telegrafbukta (10 min)"
  is_family_friendly: boolean;
  indoor?: boolean;
  dna_tags: DNATag[];
  booking_url?: string;
  estimated_cost_nok?: number;
}
