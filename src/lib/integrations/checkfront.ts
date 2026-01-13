/**
 * Checkfront API Integration
 * Handles real-time pricing and availability for activities
 *
 * API Documentation: https://www.checkfront.com/developers/api/
 */

import type { CheckfrontItem, CheckfrontAvailability } from '@/types/database';

const CHECKFRONT_HOST = process.env.CHECKFRONT_HOST || '';
const CHECKFRONT_API_KEY = process.env.CHECKFRONT_API_KEY || '';
const CHECKFRONT_API_SECRET = process.env.CHECKFRONT_API_SECRET || '';

interface CheckfrontAPIResponse {
  request: {
    status: string;
    host_id: string;
  };
  items?: {
    [itemId: string]: {
      item_id: string;
      name: string;
      category_id: string;
      price: number;
      availability?: {
        date: string;
        time: string;
        available: number;
        capacity: number;
        status: string;
      }[];
    };
  };
}

/**
 * Fetch item details from Checkfront
 */
export async function getCheckfrontItem(itemId: string): Promise<CheckfrontItem | null> {
  if (!CHECKFRONT_HOST || !CHECKFRONT_API_KEY) {
    console.warn('Checkfront credentials not configured');
    return null;
  }

  try {
    const url = `https://${CHECKFRONT_HOST}/api/3.0/item/${itemId}`;
    const auth = Buffer.from(`${CHECKFRONT_API_KEY}:${CHECKFRONT_API_SECRET}`).toString('base64');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Checkfront API error: ${response.status} ${response.statusText}`);
    }

    const data: CheckfrontAPIResponse = await response.json();

    if (!data.items || !data.items[itemId]) {
      return null;
    }

    const item = data.items[itemId];

    return {
      itemId: item.item_id,
      poiId: '', // Will be mapped from database
      name: item.name,
      category: item.category_id,
      price: item.price,
      currency: 'NOK',
      availability: [], // Fetched separately
      lastSynced: new Date(),
    };
  } catch (error) {
    console.error('Error fetching Checkfront item:', error);
    return null;
  }
}

/**
 * Fetch availability for a specific item and date range
 */
export async function getCheckfrontAvailability(
  itemId: string,
  startDate: string,
  endDate: string
): Promise<CheckfrontAvailability[]> {
  if (!CHECKFRONT_HOST || !CHECKFRONT_API_KEY) {
    console.warn('Checkfront credentials not configured');
    return [];
  }

  try {
    const url = `https://${CHECKFRONT_HOST}/api/3.0/booking/availability`;
    const auth = Buffer.from(`${CHECKFRONT_API_KEY}:${CHECKFRONT_API_SECRET}`).toString('base64');

    const params = new URLSearchParams({
      item_id: itemId,
      start_date: startDate,
      end_date: endDate,
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Checkfront API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse availability from response
    const availability: CheckfrontAvailability[] = [];

    // TODO: Parse actual Checkfront response format
    // This is a placeholder structure

    return availability;
  } catch (error) {
    console.error('Error fetching Checkfront availability:', error);
    return [];
  }
}

/**
 * Webhook handler for Checkfront status changes
 * Call this from /api/webhooks/checkfront
 */
export async function handleCheckfrontWebhook(payload: any): Promise<void> {
  try {
    // Checkfront sends webhooks for:
    // - booking.created
    // - booking.updated
    // - booking.cancelled
    // - item.updated

    const eventType = payload.event;
    const data = payload.data;

    switch (eventType) {
      case 'booking.created':
        console.log('New Checkfront booking:', data.booking_id);
        // Update availability cache
        break;

      case 'booking.cancelled':
        console.log('Checkfront booking cancelled:', data.booking_id);
        // Update availability cache
        break;

      case 'item.updated':
        console.log('Checkfront item updated:', data.item_id);
        // Invalidate item cache
        break;

      default:
        console.log('Unknown Checkfront webhook event:', eventType);
    }
  } catch (error) {
    console.error('Error handling Checkfront webhook:', error);
    throw error;
  }
}

/**
 * Verify Checkfront webhook signature
 */
export function verifyCheckfrontWebhook(
  signature: string,
  payload: string,
  secret: string
): boolean {
  // TODO: Implement signature verification
  // Checkfront uses HMAC-SHA256 for webhook signatures
  return true;
}

/**
 * Cache helper for Checkfront data (using Redis/Upstash in production)
 */
export async function cacheCheckfrontData(
  key: string,
  data: any,
  ttl: number = 300 // 5 minutes default
): Promise<void> {
  // TODO: Implement Redis caching
  // For now, just log
  console.log(`Cache set: ${key} (TTL: ${ttl}s)`);
}

export async function getCachedCheckfrontData(key: string): Promise<any | null> {
  // TODO: Implement Redis cache retrieval
  return null;
}
