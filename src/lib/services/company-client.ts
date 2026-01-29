/**
 * Company Data Client
 * Fetches companies from centralized Supabase database
 * Used by trip planner for generating itineraries with real venue data
 */

import type { Company } from '@/types/company';

const SUPABASE_URL = 'https://byvcabgcjkykwptzmwsl.supabase.co';
const COMPANIES_EDGE_FUNCTION = `${SUPABASE_URL}/functions/v1/companies`;

interface CompanyQueryParams {
  category?: string;
  verified?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

interface CompaniesResponse {
  success: boolean;
  data: Company[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Fetch companies from Supabase Edge Function
 * Returns filtered and paginated results
 */
export async function fetchCompanies(params?: CompanyQueryParams): Promise<Company[]> {
  try {
    const url = new URL(COMPANIES_EDGE_FUNCTION);

    // Add query parameters
    if (params?.category) {
      url.searchParams.append('category', params.category);
    }
    if (params?.verified !== undefined) {
      url.searchParams.append('verified', String(params.verified));
    }
    if (params?.limit) {
      url.searchParams.append('limit', String(Math.min(params.limit, 200)));
    }
    if (params?.offset !== undefined) {
      url.searchParams.append('offset', String(params.offset));
    }
    if (params?.search) {
      url.searchParams.append('search', params.search);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch companies: ${response.status} ${response.statusText}`);
    }

    const data: CompaniesResponse = await response.json();

    if (!data.success) {
      throw new Error(data.success ? 'Unknown error' : 'Failed to fetch companies from database');
    }

    return data.data || [];
  } catch (error) {
    console.error('[Company Client] Error fetching companies:', error);
    // Return empty array instead of throwing to prevent blocking trip generation
    return [];
  }
}

/**
 * Fetch all companies in a specific category
 * Used by trip planner to get relevant venues for itineraries
 */
export async function fetchCompaniesByCategory(category: string): Promise<Company[]> {
  return fetchCompanies({ category, limit: 200 });
}

/**
 * Fetch companies for trip planning
 * Returns experiences, accommodation, and dining venues
 */
export async function fetchTripPlanningCompanies(): Promise<Record<string, Company[]>> {
  const categories = ['experiences', 'accommodation', 'dining'];
  const result: Record<string, Company[]> = {};

  try {
    // Fetch all categories in parallel
    const promises = categories.map((category) =>
      fetchCompaniesByCategory(category).then((companies) => ({
        category,
        companies,
      }))
    );

    const results = await Promise.allSettled(promises);

    // Process results, handling failures gracefully
    for (const settledResult of results) {
      if (settledResult.status === 'fulfilled') {
        const { category, companies } = settledResult.value;
        result[category] = companies;
      } else {
        console.warn(`Failed to fetch ${settledResult.reason?.toString()}`);
      }
    }

    return result;
  } catch (error) {
    console.error('[Company Client] Error fetching trip planning companies:', error);
    return {};
  }
}

/**
 * Find company by slug/ID
 * Used to get specific venue details during trip planning
 */
export async function findCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    const companies = await fetchCompanies({ search: slug, limit: 10 });
    return companies.find((c) => c.id === slug || c.slug === slug) || null;
  } catch (error) {
    console.error(`[Company Client] Error finding company ${slug}:`, error);
    return null;
  }
}

/**
 * Get all available categories
 * Returns unique categories from companies data
 */
export async function getAvailableCategories(): Promise<string[]> {
  const categories = ['experiences', 'accommodation', 'dining', 'transport'];
  return categories;
}

/**
 * Cache for companies data (in-memory)
 * Prevents redundant API calls within same session
 */
const companiesCache: Map<string, { data: Company[]; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch companies with caching
 * Returns cached data if available and not expired
 */
export async function fetchCompaniesCached(params?: CompanyQueryParams): Promise<Company[]> {
  const cacheKey = JSON.stringify(params || {});

  // Check cache
  const cached = companiesCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Company Client] Returning cached companies');
    }
    return cached.data;
  }

  // Fetch fresh data
  const data = await fetchCompanies(params);

  // Update cache
  companiesCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

/**
 * Clear companies cache
 * Useful when data is known to be stale
 */
export function clearCompaniesCache(): void {
  companiesCache.clear();
  if (process.env.NODE_ENV === 'development') {
    console.log('[Company Client] Cache cleared');
  }
}
