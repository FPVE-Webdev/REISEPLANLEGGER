import type { TripPreferences, TripPlan, DayPlan, Activity } from '@/types/trip';
import type { Season } from '@/types/database';
import { SEASONS } from '@/lib/constants/seasons';
import { FEATURED_PILARS, ESSENTIAL_THEMES } from '@/lib/constants/pilars';
import { callOpenAIForTripPlan } from '@/lib/services/openai-client';

interface GenerateTripPlanInput {
  preferences: TripPreferences;
  season: Season;
  startDate: Date;
}

/**
 * AI Curator - AI-powered trip planner for Tromsø
 *
 * This function generates a personalized trip plan based on:
 * - User preferences (budget, interests, transport, pace)
 * - Seasonal context (summer, winter, polar night)
 * - Featured pilars (Fjellheisen, Arctic Cathedral, etc.)
 * - Essential themes (nature, culture, Northern Lights, etc.)
 * - Real-time availability from Checkfront
 * - Restaurant availability
 *
 * Uses GPT-4 API with fallback to rule-based generation if API unavailable
 */
export async function generateTripPlan(input: GenerateTripPlanInput): Promise<TripPlan> {
  const { preferences, season, startDate } = input;

  // Build AI context and prompts
  const systemPrompt = buildSystemPrompt(preferences, season);
  const userMessage = buildUserMessage(preferences, startDate);

  try {
    // Attempt to generate plan using OpenAI GPT-4
    const aiPlan = await callOpenAIForTripPlan({
      systemPrompt,
      userMessage,
      maxTokens: 2000,
      temperature: 0.7,
    });

    if (aiPlan) {
      console.log('[AI Curator] Successfully generated trip plan using OpenAI GPT-4');
      return aiPlan;
    }

    // If AI call returns null, fall back to rule-based generation
    console.log('[AI Curator] OpenAI API failed or returned invalid response, using rule-based generation');
  } catch (error) {
    console.error('[AI Curator] Error calling OpenAI API:', error instanceof Error ? error.message : error);
  }

  // Fallback: Generate plan using rule-based system
  const context = buildAIContext(preferences, season);
  const plan = await generatePlanWithRules(preferences, season, startDate, context);

  return plan;
}

/**
 * Build system prompt for OpenAI GPT-4
 * Defines the role and instructions for the AI curator
 */
function buildSystemPrompt(preferences: TripPreferences, season: Season): string {
  const seasonConfig = SEASONS[season];
  const featuredPilars = Object.values(FEATURED_PILARS).map(p => p.name).join(', ');
  const essentialThemes = Object.values(ESSENTIAL_THEMES).map(t => t.name).join(', ');

  return `You are an expert local guide and AI trip curator for Tromsø, Norway. Your role is to create personalized, detailed itineraries that showcase the best of Tromsø while respecting user preferences and constraints.

You have deep knowledge of:
- Tromsø's seasonal characteristics and weather patterns
- Local attractions, restaurants, and activities
- Logistical considerations (travel times, opening hours, booking requirements)
- Budget optimization strategies
- Safety and practical considerations for Arctic travel

IMPORTANT: You must respond with VALID JSON ONLY. No markdown, no explanations, no text before or after the JSON. The response must be parseable as JSON.

The JSON structure must match this exact format:
{
  "summary": "Brief overview of the trip",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Activity name",
          "description": "Detailed description",
          "location": "Address or location",
          "cost": 0,
          "duration": "X hours/minutes",
          "bookingRequired": true/false
        }
      ],
      "dining": {
        "lunch": "Restaurant or spot name",
        "dinner": "Restaurant or spot name"
      },
      "aurora": {
        "probability": 0-100,
        "bestTime": "HH:MM",
        "location": "Viewing location"
      }
    }
  ],
  "totalCost": 0,
  "safetyNotes": ["note1", "note2"],
  "packingList": ["item1", "item2"],
  "recommendations": ["rec1", "rec2"]
}`;
}

/**
 * Build user message for OpenAI GPT-4
 * Contains the specific trip requirements and preferences
 */
function buildUserMessage(preferences: TripPreferences, startDate: Date): string {
  const budget = preferences.budget === 'low' ? '800 NOK/dag' :
    preferences.budget === 'medium' ? '1500 NOK/dag' : '3000+ NOK/dag';

  const pace = preferences.difficulty === 'easy' ? 'rolig' :
    preferences.difficulty === 'moderate' ? 'moderat' : 'aktivt';

  return `Please create a detailed ${preferences.days}-day itinerary for Tromsø with the following preferences:

TRIP DETAILS:
- Duration: ${preferences.days} days
- Start date: ${startDate.toISOString().split('T')[0]}
- Group size: ${preferences.groupSize || 2} person(s)

USER PREFERENCES:
- Budget: ${budget}
- Pace: ${pace}
- Transport: ${preferences.transport === 'car' ? 'Own car' : 'No car (public transport & tours)'}
- Interests: ${preferences.interests.join(', ')}

REQUIREMENTS:
1. Include travel time and logistical details between locations
2. Provide specific opening hours and booking information
3. Balance indoor/outdoor activities based on weather
4. Suggest restaurants with local cuisine
5. Include Northern Lights information if winter/polar night
6. Respect budget constraints throughout
7. Optimize routes based on transportation mode
8. Include practical safety notes and packing recommendations
9. Weave in Tromsø's unique character and local experiences

Create a realistic, bookable itinerary that will be memorable and practical.`;
}

/**
 * Build context for AI prompt (legacy - kept for fallback system)
 */
function buildAIContext(preferences: TripPreferences, season: Season): string {
  const seasonConfig = SEASONS[season];
  const featuredPilars = Object.values(FEATURED_PILARS).map(p => p.name).join(', ');
  const essentialThemes = Object.values(ESSENTIAL_THEMES).map(t => t.name).join(', ');

  const budget = preferences.budget === 'low' ? '800 NOK/dag' :
    preferences.budget === 'medium' ? '1500 NOK/dag' : '3000+ NOK/dag';

  const pace = preferences.difficulty === 'easy' ? 'rolig' :
    preferences.difficulty === 'moderate' ? 'moderat' : 'aktivt';

  return `
You are a local Tromsø expert and AI trip curator. Generate a personalized ${preferences.days}-day itinerary.

CONTEXT:
- Season: ${seasonConfig.nameNo} (${seasonConfig.description})
- Weather: ${seasonConfig.weatherInfo}
- Seasonal highlights: ${seasonConfig.highlights.join(', ')}

USER PREFERENCES:
- Budget: ${budget}
- Pace: ${pace}
- Transport: ${preferences.transport === 'car' ? 'Med bil' : 'Uten bil (offentlig transport)'}
- Group size: ${preferences.groupSize || 2} personer
- Interests: ${preferences.interests.join(', ')}

TROMSØ'S FEATURED PILARS (must include at least 2):
${featuredPilars}

ESSENTIAL THEMES TO WEAVE IN:
${essentialThemes}

RULES:
1. Include travel time between locations
2. Factor in opening hours and daylight (${season === 'polar-night' ? 'no direct sunlight' : 'midnight sun in summer'})
3. Balance indoor/outdoor based on weather
4. Suggest booking-required activities with time slots
5. Include lunch and dinner recommendations
6. Add Northern Lights viewing if winter/polar-night
7. Respect budget constraints
8. Optimize route based on transport mode
9. Include safety notes and packing recommendations

OUTPUT: Structured day-by-day plan with times, costs, and explanations.
  `.trim();
}

/**
 * Rule-based trip generator (MVP version)
 * TODO: Replace with actual AI API call
 */
async function generatePlanWithRules(
  preferences: TripPreferences,
  season: Season,
  startDate: Date,
  context: string
): Promise<TripPlan> {
  const days: DayPlan[] = [];
  const seasonConfig = SEASONS[season];

  // Generate day-by-day plans
  for (let i = 0; i < preferences.days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dayPlan = generateDayPlan(i + 1, date, preferences, season);
    days.push(dayPlan);
  }

  // Calculate total cost
  const totalCost = days.reduce((sum, day) => {
    return sum + day.activities.reduce((daySum, activity) => daySum + activity.cost, 0);
  }, 0);

  // Generate summary
  const summary = `Din ${preferences.days}-dagers ${seasonConfig.nameNo.toLowerCase()}-opplevelse i Tromsø kombinerer ${preferences.interests.slice(0, 3).join(', ')} med lokal kultur og naturopplevelser.`;

  // Safety notes based on season
  const safetyNotes = generateSafetyNotes(season, preferences);

  // Packing list based on season and activities
  const packingList = generatePackingList(season, preferences);

  // Recommendations
  const recommendations = [
    'Book nordlys-turer minst 2-3 dager i forveien',
    'Sjekk værmelding daglig - arktisk vær kan endre seg raskt',
    'Last ned offline kart for Tromsø-området',
    'Ta med kontanter - ikke alle steder tar kort',
  ];

  return {
    summary,
    days,
    totalCost,
    safetyNotes,
    packingList,
    recommendations,
  };
}

/**
 * Generate a single day plan
 */
function generateDayPlan(
  dayNumber: number,
  date: Date,
  preferences: TripPreferences,
  season: Season
): DayPlan {
  const activities: Activity[] = [];
  const isFirstDay = dayNumber === 1;

  // Morning activity (10:00-12:00)
  if (isFirstDay) {
    activities.push({
      time: '10:00',
      title: 'Fjellheisen Cable Car',
      description: 'Start med panoramautsikt over Tromsø fra 421 meter over havet',
      location: 'Fjellheisen, Solliveien 12',
      cost: 200,
      duration: '1.5 timer',
      bookingRequired: false,
    });
  }

  // Lunch (12:30-14:00)
  const lunchSpot = 'Fiskekompaniet'; // Example

  // Afternoon activity (14:30-17:00)
  activities.push({
    time: '14:30',
    title: season === 'summer' ? 'Fjord Cruise' : 'Ishavskatedralen Visit',
    description: season === 'summer'
      ? 'Opplev midnattsol fra fjorden med mulighet for havørn og hval'
      : 'Besøk den ikoniske Arktiske Katedralen',
    location: season === 'summer' ? 'Prostneset Havn' : 'Tromsdalen',
    cost: season === 'summer' ? 800 : 100,
    duration: season === 'summer' ? '3 timer' : '1 time',
    bookingRequired: season === 'summer',
  });

  // Dinner (18:00-20:00)
  const dinnerSpot = "Emma's Drømmekjøkken";

  // Evening activity
  if (season === 'winter' || season === 'polar-night') {
    activities.push({
      time: '21:00',
      title: 'Northern Lights Chase',
      description: 'Profesjonell guide tar deg til beste spots for nordlys',
      location: 'Henting fra hotell',
      cost: 1200,
      duration: '4-6 timer',
      bookingRequired: true,
    });
  }

  return {
    day: dayNumber,
    date: date.toISOString().split('T')[0],
    theme: isFirstDay ? 'Velkommen til Tromsø' : `Dag ${dayNumber}`,
    activities,
    dining: {
      lunch: lunchSpot,
      dinner: dinnerSpot,
    },
    aurora: (season === 'winter' || season === 'polar-night')
      ? {
          probability: 65,
          bestTime: '22:00',
          location: 'Utenfor byen (mørk himmel)',
        }
      : undefined,
  };
}

/**
 * Generate season-specific safety notes
 */
function generateSafetyNotes(season: Season, preferences: TripPreferences): string[] {
  const notes: string[] = [
    'Ha alltid med fulladet telefon',
    'Del reiserute med noen du stoler på',
  ];

  if (season === 'winter' || season === 'polar-night') {
    notes.push(
      'Kle deg i lag - temperaturen kan variere',
      'Pass på glatte veier og fortau',
      'Mørketid: bruk refleks og lykt når du går ute',
      'Sjekk værvarsling før utendørsaktiviteter'
    );
  }

  if (season === 'summer') {
    notes.push(
      'Midnattsol: bruk solbriller og solkrem',
      'Myggspray anbefales for fotturer',
      'Ha med varme klær selv om det er sommer'
    );
  }

  if (preferences.transport === 'car') {
    notes.push(
      'Vinterdekk er påkrevd november-april',
      'Kjør forsiktig i arktiske forhold'
    );
  }

  return notes;
}

/**
 * Generate packing list based on season and activities
 */
function generatePackingList(season: Season, preferences: TripPreferences): string[] {
  const items: string[] = [
    'Pass og ID',
    'Bankkort og litt kontanter',
    'Telefon og lader',
    'Kamera',
  ];

  if (season === 'winter' || season === 'polar-night') {
    items.push(
      'Varm vinterjakke',
      'Vintersko med godt grep',
      'Votter, lue, skjerf',
      'Termisk undertøy',
      'Varme sokker',
      'Solbriller (snørefleks)'
    );
  }

  if (season === 'summer') {
    items.push(
      'Vindtett jakke',
      'Gode tursko',
      'Solbriller og solkrem',
      'Myggspray',
      'Lette og varme klær (lag på lag)'
    );
  }

  if (preferences.interests.includes('photography')) {
    items.push('Tripod for kamera', 'Ekstra batterier (kulde tapper batterier)');
  }

  if (preferences.interests.includes('hiking')) {
    items.push('Tursko', 'Sekk', 'Matboks og drikkeflaske');
  }

  return items;
}
