import type { Category, CategoryId } from '@/types/database';

export const CATEGORIES: Record<CategoryId, Category> = {
  museums: {
    id: 'museums',
    name: 'Museums',
    nameNo: 'Museer',
    description: 'Cultural and historical museums',
    icon: '🏛️',
    sortOrder: 1,
  },
  galleries: {
    id: 'galleries',
    name: 'Galleries',
    nameNo: 'Gallerier',
    description: 'Art galleries and exhibitions',
    icon: '🎨',
    sortOrder: 2,
  },
  activities: {
    id: 'activities',
    name: 'Activities',
    nameNo: 'Aktiviteter',
    description: 'Outdoor activities and experiences',
    icon: '⛷️',
    sortOrder: 3,
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    nameNo: 'Shopping',
    description: 'Local shops and boutiques',
    icon: '🛍️',
    sortOrder: 4,
  },
  interior: {
    id: 'interior',
    name: 'Interior',
    nameNo: 'Interiør',
    description: 'Interior design and home decor',
    icon: '🪑',
    sortOrder: 5,
  },
  'food-drink': {
    id: 'food-drink',
    name: 'Food & Drink',
    nameNo: 'Mat & Drikke',
    description: 'Restaurants, cafes, and bars',
    icon: '🍽️',
    sortOrder: 6,
  },
  'health-beauty': {
    id: 'health-beauty',
    name: 'Health & Beauty',
    nameNo: 'Helse & Skjønnhet',
    description: 'Spas, wellness, and beauty',
    icon: '💆',
    sortOrder: 7,
  },
  accommodation: {
    id: 'accommodation',
    name: 'Accommodation',
    nameNo: 'Overnatting',
    description: 'Hotels, cabins, and lodging',
    icon: '🏨',
    sortOrder: 8,
  },
  transport: {
    id: 'transport',
    name: 'Transport',
    nameNo: 'Transport',
    description: 'Getting around Tromsø',
    icon: '🚌',
    sortOrder: 9,
  },
  'whats-on': {
    id: 'whats-on',
    name: "What's On",
    nameNo: 'Hva skjer',
    description: 'Events and happenings',
    icon: '🎭',
    sortOrder: 10,
  },
};

export const getCategoryById = (id: CategoryId): Category => CATEGORIES[id];

export const getAllCategories = (): Category[] =>
  Object.values(CATEGORIES).sort((a, b) => a.sortOrder - b.sortOrder);
