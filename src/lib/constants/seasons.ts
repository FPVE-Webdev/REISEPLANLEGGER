import type { Season, SeasonConfig } from '@/types/database';

export const SEASONS: Record<Season, SeasonConfig> = {
  summer: {
    season: 'summer',
    name: 'Summer',
    nameNo: 'Sommer',
    startMonth: 5, // May
    endMonth: 8, // August
    description: 'Midnight sun season with 24-hour daylight',
    highlights: [
      'Midnight sun',
      'Hiking and nature walks',
      'Fjord cruises',
      'Wildlife watching',
      'Outdoor cafes',
    ],
    weatherInfo: 'Average 8-15°C, long days with midnight sun from May-July',
  },
  winter: {
    season: 'winter',
    name: 'Winter',
    nameNo: 'Vinter',
    startMonth: 12, // December
    endMonth: 2, // February
    description: 'Winter wonderland with Northern Lights',
    highlights: [
      'Northern Lights viewing',
      'Dog sledding',
      'Snowmobile tours',
      'Cross-country skiing',
      'Winter festivals',
    ],
    weatherInfo: 'Average -4 to 0°C, snowy conditions, Northern Lights season',
  },
  'polar-night': {
    season: 'polar-night',
    name: 'Polar Night',
    nameNo: 'Mørketid',
    startMonth: 11, // November
    endMonth: 1, // January
    description: 'Magical twilight period without direct sunlight',
    highlights: [
      'Blue hour photography',
      'Northern Lights (peak season)',
      'Cozy cafes and restaurants',
      'Cultural experiences',
      'Christmas markets',
    ],
    weatherInfo: 'Average -5 to 2°C, no direct sunlight but beautiful twilight',
  },
};

/**
 * Determine the current season based on a date
 */
export function getSeasonFromDate(date: Date): Season {
  const month = date.getMonth() + 1; // 1-12

  if (month >= 5 && month <= 8) {
    return 'summer';
  }

  if (month === 11 || month === 1) {
    return 'polar-night';
  }

  // December, February (winter without polar night)
  if (month === 12 || month === 2) {
    return 'winter';
  }

  // Default to winter for shoulder months (March, April, September, October)
  return 'winter';
}

/**
 * Get the next season transition date
 */
export function getNextSeasonTransition(date: Date): { date: Date; season: Season } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const transitions = [
    { month: 5, season: 'summer' as Season },
    { month: 9, season: 'winter' as Season },
    { month: 11, season: 'polar-night' as Season },
    { month: 2, season: 'winter' as Season },
  ];

  for (const transition of transitions) {
    if (month < transition.month) {
      return {
        date: new Date(year, transition.month - 1, 1),
        season: transition.season,
      };
    }
  }

  // Wrap to next year
  return {
    date: new Date(year + 1, 4, 1), // May 1st next year
    season: 'summer',
  };
}

export const getAllSeasons = (): SeasonConfig[] => Object.values(SEASONS);
