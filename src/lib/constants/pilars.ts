import type { PilarConfig, FeaturedPilar, EssentialTheme } from '@/types/database';

/**
 * Featured Content Pilars - Anchor points (landmarks) that define Tromsø
 * These are weighted heavily in AI recommendations
 */
export const FEATURED_PILARS: Record<FeaturedPilar, PilarConfig> = {
  fjellheisen: {
    id: 'fjellheisen',
    type: 'featured',
    name: 'Fjellheisen Cable Car',
    description: 'Iconic cable car with panoramic city and fjord views',
    weight: 10,
    associatedPOIs: [], // Will be populated from database
    featuredPilar: 'fjellheisen',
  },
  ishavskatedralen: {
    id: 'ishavskatedralen',
    type: 'featured',
    name: 'Arctic Cathedral',
    description: 'Iconic modern church and architectural landmark',
    weight: 9,
    associatedPOIs: [],
    featuredPilar: 'ishavskatedralen',
  },
  polarmuseet: {
    id: 'polarmuseet',
    type: 'featured',
    name: 'Polar Museum',
    description: 'Arctic hunting and expedition history',
    weight: 8,
    associatedPOIs: [],
    featuredPilar: 'polarmuseet',
  },
  fjordcruise: {
    id: 'fjordcruise',
    type: 'featured',
    name: 'Fjord Cruise',
    description: 'Explore Arctic fjords and wildlife',
    weight: 8,
    associatedPOIs: [],
    featuredPilar: 'fjordcruise',
  },
  'arctic-cathedral': {
    id: 'arctic-cathedral',
    type: 'featured',
    name: 'Arctic Cathedral',
    description: 'Midnight sun concerts and Northern Lights backdrop',
    weight: 9,
    associatedPOIs: [],
    featuredPilar: 'arctic-cathedral',
  },
};

/**
 * Essential Theme Pilars - Tromsø's DNA (core identity themes)
 * These ensure the AI captures the essence of Tromsø in recommendations
 */
export const ESSENTIAL_THEMES: Record<EssentialTheme, PilarConfig> = {
  nature: {
    id: 'nature',
    type: 'essential',
    name: 'Nature & Wilderness',
    description: 'Arctic nature, mountains, and fjords',
    weight: 10,
    associatedPOIs: [],
    essentialTheme: 'nature',
  },
  culture: {
    id: 'culture',
    type: 'essential',
    name: 'Culture & Arts',
    description: 'Museums, galleries, and cultural institutions',
    weight: 7,
    associatedPOIs: [],
    essentialTheme: 'culture',
  },
  science: {
    id: 'science',
    type: 'essential',
    name: 'Science & Research',
    description: 'Arctic science, UiT campus, research institutions',
    weight: 6,
    associatedPOIs: [],
    essentialTheme: 'science',
  },
  'arctic-wilderness': {
    id: 'arctic-wilderness',
    type: 'essential',
    name: 'Arctic Wilderness',
    description: 'Dog sledding, snowmobile, wilderness experiences',
    weight: 9,
    associatedPOIs: [],
    essentialTheme: 'arctic-wilderness',
  },
  'sami-heritage': {
    id: 'sami-heritage',
    type: 'essential',
    name: 'Sami Heritage',
    description: 'Indigenous Sami culture and traditions',
    weight: 8,
    associatedPOIs: [],
    essentialTheme: 'sami-heritage',
  },
  'northern-lights': {
    id: 'northern-lights',
    type: 'essential',
    name: 'Northern Lights',
    description: 'Aurora viewing, photography, and tours',
    weight: 10,
    associatedPOIs: [],
    essentialTheme: 'northern-lights',
  },
};

/**
 * Get all pilars (both featured and essential)
 */
export const getAllPilars = (): PilarConfig[] => [
  ...Object.values(FEATURED_PILARS),
  ...Object.values(ESSENTIAL_THEMES),
];

/**
 * Get pilars filtered by type
 */
export const getPilarsByType = (type: 'featured' | 'essential'): PilarConfig[] => {
  if (type === 'featured') {
    return Object.values(FEATURED_PILARS);
  }
  return Object.values(ESSENTIAL_THEMES);
};

/**
 * Calculate AI weight for a POI based on its pilar associations
 */
export const calculatePOIWeight = (
  featuredPilar?: FeaturedPilar,
  essentialThemes: EssentialTheme[] = []
): number => {
  let weight = 1; // Base weight

  // Add featured pilar weight
  if (featuredPilar && FEATURED_PILARS[featuredPilar]) {
    weight += FEATURED_PILARS[featuredPilar].weight;
  }

  // Add essential theme weights (max 3 themes to avoid over-weighting)
  const themesToCount = essentialThemes.slice(0, 3);
  for (const theme of themesToCount) {
    if (ESSENTIAL_THEMES[theme]) {
      weight += ESSENTIAL_THEMES[theme].weight * 0.5; // Half weight for themes
    }
  }

  // Cap at 10
  return Math.min(weight, 10);
};
