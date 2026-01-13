/**
 * Restaurant Booking Integration Layer
 * Supports multiple platforms: OpenTable, Quandoo, ResDiary, Google Places (fallback)
 */

import type { RestaurantBooking, RestaurantAvailability } from '@/types/database';

type BookingPlatform = 'opentable' | 'quandoo' | 'resdiary' | 'google-places';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

/**
 * Fetch restaurant availability from multiple platforms
 */
export async function getRestaurantAvailability(
  poiId: string,
  platform: BookingPlatform,
  externalId: string,
  date: string,
  partySize: number = 2
): Promise<RestaurantAvailability[]> {
  switch (platform) {
    case 'opentable':
      return getOpenTableAvailability(externalId, date, partySize);
    case 'quandoo':
      return getQuandooAvailability(externalId, date, partySize);
    case 'resdiary':
      return getResDiaryAvailability(externalId, date, partySize);
    case 'google-places':
      return getGooglePlacesInfo(externalId);
    default:
      console.warn(`Unknown booking platform: ${platform}`);
      return [];
  }
}

/**
 * OpenTable API Integration
 * Note: OpenTable's partner API requires approval
 */
async function getOpenTableAvailability(
  restaurantId: string,
  date: string,
  partySize: number
): Promise<RestaurantAvailability[]> {
  // TODO: Implement OpenTable API
  // For MVP, return mock data
  console.log('OpenTable API not yet implemented');

  return [
    { date, time: '18:00', available: true, partySize },
    { date, time: '19:00', available: true, partySize },
    { date, time: '20:00', available: false, partySize },
  ];
}

/**
 * Quandoo API Integration
 * API Docs: https://developers.quandoo.com/
 */
async function getQuandooAvailability(
  merchantId: string,
  date: string,
  partySize: number
): Promise<RestaurantAvailability[]> {
  const QUANDOO_API_KEY = process.env.QUANDOO_API_KEY;

  if (!QUANDOO_API_KEY) {
    console.warn('Quandoo API key not configured');
    return [];
  }

  try {
    const url = `https://api.quandoo.com/v1/merchants/${merchantId}/availabilities`;
    const params = new URLSearchParams({
      date,
      capacity: partySize.toString(),
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'X-Quandoo-AuthToken': QUANDOO_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Quandoo API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse Quandoo response
    return data.availabilities?.map((slot: any) => ({
      date,
      time: slot.time,
      available: slot.available,
      partySize,
    })) || [];
  } catch (error) {
    console.error('Error fetching Quandoo availability:', error);
    return [];
  }
}

/**
 * ResDiary API Integration
 * API Docs: https://www.resdiary.com/global/en/resdiary-api
 */
async function getResDiaryAvailability(
  restaurantId: string,
  date: string,
  partySize: number
): Promise<RestaurantAvailability[]> {
  const RESDIARY_API_KEY = process.env.RESDIARY_API_KEY;

  if (!RESDIARY_API_KEY) {
    console.warn('ResDiary API key not configured');
    return [];
  }

  try {
    // TODO: Implement ResDiary API
    console.log('ResDiary API not yet implemented');
    return [];
  } catch (error) {
    console.error('Error fetching ResDiary availability:', error);
    return [];
  }
}

/**
 * Google Places API (Fallback)
 * Used when no booking platform is integrated
 */
async function getGooglePlacesInfo(placeId: string): Promise<RestaurantAvailability[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured');
    return [];
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'name,opening_hours,formatted_phone_number,website',
      key: GOOGLE_PLACES_API_KEY,
    });

    const response = await fetch(`${url}?${params}`);

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    // Google Places doesn't provide real-time availability
    // Return basic info for manual booking
    console.log('Restaurant info from Google Places:', data.result?.name);

    return [];
  } catch (error) {
    console.error('Error fetching Google Places info:', error);
    return [];
  }
}

/**
 * Get restaurant booking link based on platform
 */
export function getRestaurantBookingLink(
  platform: BookingPlatform,
  externalId: string,
  date?: string,
  partySize?: number
): string {
  switch (platform) {
    case 'opentable':
      return `https://www.opentable.com/r/${externalId}`;
    case 'quandoo':
      return `https://www.quandoo.no/place/${externalId}`;
    case 'resdiary':
      return `https://booking.resdiary.com/widget/${externalId}`;
    case 'google-places':
      return `https://www.google.com/maps/place/?q=place_id:${externalId}`;
    default:
      return '';
  }
}

/**
 * Fetch restaurant details for display in trip plan
 */
export async function getRestaurantDetails(poiId: string): Promise<RestaurantBooking | null> {
  // TODO: Fetch from database based on poiId
  // For now, return null
  return null;
}

/**
 * Cache restaurant availability data
 * Restaurant availability changes frequently, so use shorter TTL
 */
export async function cacheRestaurantAvailability(
  key: string,
  data: RestaurantAvailability[],
  ttl: number = 180 // 3 minutes
): Promise<void> {
  // TODO: Implement Redis caching
  console.log(`Cache restaurant availability: ${key} (TTL: ${ttl}s)`);
}
