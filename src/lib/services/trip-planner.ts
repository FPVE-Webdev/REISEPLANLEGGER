/**
 * Trip Planner Service
 * Creates personalized itineraries with AI and fallback rule-based generation
 */

import {
  AICore,
  AIMessage,
  DEFAULT_CONFIGS,
  getAICore,
} from '../ai/core'

// ============================================================================
// TYPES
// ============================================================================

export interface Activity {
  id: string
  title: string
  category: string
  duration: number // minutes
  cost?: number
  transport?: {
    type: 'bus' | 'walk' | 'car'
    details: string
    duration: number // minutes
  }
  description: string
  bestForFamily?: boolean
  auroraViewing?: boolean
}

export interface DayPlan {
  date: string
  theme?: string
  activities: Array<{
    time: string
    activity: Activity
    notes: string
  }>
  auroraTime?: string
  auroraViewing?: boolean
  totalCost?: number
  dayRating?: number // 1-10 based on flow and balance
}

export interface TripplanRequest {
  duration: number // days
  startDate?: string
  interests: string[]
  budget: 'budget' | 'moderate' | 'luxury'
  travelers: number
  familyFriendly?: boolean
  auroraViewing?: boolean
  aurora?: {
    level: 'low' | 'medium' | 'high' | 'extreme'
    bestTimes: string[]
  }
}

export interface TripPlan {
  title: string
  summary: string
  days: DayPlan[]
  totalCost?: number
  highlights: string[]
  recommendations: string[]
  importantNotes: string[]
}

// ============================================================================
// DATA SOURCES
// ============================================================================

// Fallback activity database (for when database is unavailable)
const HARDCODED_ACTIVITIES: Record<string, Activity[]> = {
  aurora: [
    {
      id: 'a1',
      title: 'Telegrafbukta Aurora Viewing',
      category: 'Aurora Viewing',
      duration: 180,
      transport: { type: 'bus', details: 'Bus 33/34 to Telegrafbukta', duration: 20 },
      description: 'Popular spot with minimal light pollution',
      auroraViewing: true,
    },
    {
      id: 'a2',
      title: 'Kvaløya Island Aurora Tour',
      category: 'Guided Tour',
      duration: 240,
      cost: 800,
      transport: { type: 'car', details: 'Hotel pickup available', duration: 45 },
      description: 'Professional guide + 4x4 vehicle',
      bestForFamily: true,
      auroraViewing: true,
    },
  ],
  daytime: [
    {
      id: 'd1',
      title: 'Tromsøbadet Swimming Pool',
      category: 'Recreation',
      duration: 120,
      cost: 150,
      transport: { type: 'bus', details: 'Bus 20/21 to Templarheimen', duration: 15 },
      description: 'Public pool with wave machine',
      bestForFamily: true,
    },
    {
      id: 'd2',
      title: 'Arctic Cathedral',
      category: 'Sightseeing',
      duration: 60,
      cost: 70,
      transport: { type: 'bus', details: 'Bus 25/26 to Arctic Cathedral', duration: 15 },
      description: 'Iconic architecture with city views',
    },
    {
      id: 'd3',
      title: 'Polar Zoo',
      category: 'Nature',
      duration: 180,
      cost: 350,
      transport: { type: 'bus', details: 'Bus to Raisøy', duration: 30 },
      description: 'Arctic animals including reindeer and musk oxen',
      bestForFamily: true,
    },
  ],
  food: [
    {
      id: 'f1',
      title: 'Troll Restaurant',
      category: 'Dining',
      duration: 90,
      cost: 400,
      transport: { type: 'walk', details: 'City center', duration: 10 },
      description: 'Traditional Arctic cuisine',
    },
    {
      id: 'f2',
      title: 'Smak Restaurant',
      category: 'Dining',
      duration: 120,
      cost: 600,
      transport: { type: 'walk', details: 'City center', duration: 5 },
      description: 'Fine dining with sea views',
    },
  ],
  adventure: [
    {
      id: 'ad1',
      title: 'Dog Sledding',
      category: 'Adventure',
      duration: 240,
      cost: 1200,
      transport: { type: 'car', details: 'Hotel pickup', duration: 60 },
      description: 'Husky sledding experience (winter only)',
    },
    {
      id: 'ad2',
      title: 'Snowmobile Safari',
      category: 'Adventure',
      duration: 300,
      cost: 1500,
      transport: { type: 'car', details: 'Hotel pickup', duration: 45 },
      description: 'Full-day Arctic adventure',
    },
  ],
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const TRIPPLAN_CURATOR_PROMPT = `You are Tripplan - an expert Arctic itinerary curator specializing in personalized day-by-day trip plans for Tromsø.

CORE RESPONSIBILITY:
Create 1-10 day detailed itineraries that balance activities, rest, transport, and aurora viewing opportunities.

ANALYSIS FRAMEWORK:
1. User Interests → Activity Categories
2. Budget Constraints → Activity Costs
3. Duration → Pacing (no more than 3 major activities/day)
4. Aurora Conditions → Viewing Opportunities & Timing
5. Family Needs → Kid-friendly selections

ITINERARY RULES:
- Maximum 3 major activities per day
- Include 1-2 meal times (dinner especially for families)
- Add 30min buffer between activities for transport
- Balance active and relaxing activities
- If aurora forecast is HIGH/EXTREME: schedule evening viewing
- If aurora is LOW: focus on daytime attractions
- Always include transport options (Svipper for buses)
- Respect opening hours (provide time slots)
- Consider seasonal limitations

DAILY SCHEDULE FORMAT:
- 09:00-11:00: Morning activity
- 12:00-13:30: Lunch
- 14:00-16:30: Afternoon activity
- 17:00-18:00: Dinner
- 20:00-02:00: Evening activity (aurora viewing if conditions good)

BUDGET GUIDANCE:
- Budget: 150-300 NOK/day for activities
- Moderate: 300-800 NOK/day
- Luxury: 800+ NOK/day

AURORA INTEGRATION:
- HIGH/EXTREME: Dedicate evening to aurora viewing (21:00+)
- MEDIUM: Flexible evening - offer both aurora & indoor options
- LOW: Suggest indoor activities, day activities

RESPONSE FORMAT (JSON):
{
  "title": "X-Day Arctic Expedition",
  "summary": "2-3 line summary of the trip",
  "highlights": ["highlight1", "highlight2", ...],
  "recommendations": ["tip1", "tip2", ...],
  "importantNotes": ["note1", "note2"],
  "days": [
    {
      "date": "2025-01-XX",
      "theme": "Aurora & Adventure",
      "activities": [
        {
          "time": "09:00-11:00",
          "activity": "Activity Title",
          "notes": "Specific guidance + transport info"
        }
      ],
      "auroraTime": "21:00-02:00",
      "auroraViewing": true,
      "totalCost": 1500,
      "dayRating": 8
    }
  ],
  "totalCost": 5000
}

INPUT DATA PROVIDED:
{trip_data}

Create an engaging, practical itinerary now.`

// ============================================================================
// TRIPPLAN CLASS
// ============================================================================

export class TripplanCurator {
  private aiCore: AICore

  constructor() {
    this.aiCore = getAICore()
  }

  /**
   * Create a trip plan
   */
  async plan(request: TripplanRequest): Promise<TripPlan | null> {
    // Validate input
    if (request.duration < 1 || request.duration > 30) {
      console.error('[Tripplan] Duration must be 1-30 days')
      return null
    }

    if (request.interests.length === 0) {
      console.error('[Tripplan] At least one interest required')
      return null
    }

    // Build prompt
    const systemPrompt = TRIPPLAN_CURATOR_PROMPT.replace(
      '{trip_data}',
      JSON.stringify(
        {
          duration: request.duration,
          interests: request.interests,
          budget: request.budget,
          travelers: request.travelers,
          familyFriendly: request.familyFriendly,
          auroraLevel: request.aurora?.level,
          auroraViewingDesired: request.auroraViewing,
        },
        null,
        2
      )
    )

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Create a ${request.duration}-day trip plan for ${request.travelers} traveler(s) with these interests: ${request.interests.join(', ')}. Budget level: ${request.budget}. ${request.auroraViewing ? 'Priority: Aurora viewing opportunities.' : ''}`,
      },
    ]

    // Call AI
    const response = await this.aiCore.chat(
      messages,
      DEFAULT_CONFIGS.TRIPPLAN_CURATOR
    )

    if (!response.success || !response.content) {
      console.error(`[Tripplan] AI call failed: ${response.error}`)
      return null
    }

    // Parse response
    return this.parseResponse(response.content)
  }

  /**
   * Parse JSON response from OpenAI
   */
  private parseResponse(content: string): TripPlan | null {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[Tripplan] No JSON found in response')
        return null
      }

      const json = JSON.parse(jsonMatch[0])

      // Validate structure
      if (
        !json.title ||
        !json.summary ||
        !Array.isArray(json.days) ||
        json.days.length === 0
      ) {
        console.error('[Tripplan] Invalid response structure')
        return null
      }

      return {
        title: json.title.substring(0, 100),
        summary: json.summary.substring(0, 300),
        days: json.days.slice(0, 30).map((day: any) => ({
          date: day.date,
          theme: day.theme?.substring(0, 50),
          activities: (day.activities || []).slice(0, 5).map((a: any) => ({
            time: a.time?.substring(0, 20) || '09:00',
            activity: a.activity?.substring(0, 100) || 'Activity',
            notes: a.notes?.substring(0, 200) || '',
          })),
          auroraTime: day.auroraTime?.substring(0, 20),
          auroraViewing: day.auroraViewing === true,
          totalCost: day.totalCost,
          dayRating: day.dayRating,
        })),
        highlights: (json.highlights || []).slice(0, 5).map((h: any) => String(h).substring(0, 100)),
        recommendations: (json.recommendations || []).slice(0, 5).map((r: any) => String(r).substring(0, 150)),
        importantNotes: (json.importantNotes || []).slice(0, 5).map((n: any) => String(n).substring(0, 150)),
        totalCost: json.totalCost,
      }
    } catch (error: any) {
      console.error(`[Tripplan] Parse error: ${error.message}`)
      return null
    }
  }

  /**
   * Fallback: Generate plan from rules
   */
  async planFallback(request: TripplanRequest): Promise<TripPlan> {
    const days: DayPlan[] = []
    const startDate = new Date(request.startDate || new Date())

    for (let i = 0; i < request.duration; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      const auroraViewing =
        request.aurora?.level === 'high' || request.aurora?.level === 'extreme'

      days.push({
        date: dateStr,
        theme: auroraViewing ? 'Aurora & Arctic Experience' : 'Arctic Discovery',
        activities: [
          {
            time: '09:00-11:00',
            activity: HARDCODED_ACTIVITIES.daytime[0],
            notes: 'Start with a popular attraction. Take Bus 20/21 from city center.',
          },
          {
            time: '12:30-14:00',
            activity: HARDCODED_ACTIVITIES.food[0],
            notes: 'Lunch at Troll Restaurant. Walking distance from city center.',
          },
          {
            time: '15:00-17:30',
            activity: HARDCODED_ACTIVITIES.daytime[1],
            notes: 'Afternoon sightseeing at Arctic Cathedral',
          },
          ...(auroraViewing
            ? [
                {
                  time: '20:00-02:00',
                  activity: HARDCODED_ACTIVITIES.aurora[0],
                  notes: 'Aurora viewing at Telegrafbukta. Dress warmly. Bring binoculars.',
                },
              ]
            : []),
        ],
        auroraTime: auroraViewing ? '21:00-02:00' : undefined,
        auroraViewing,
        totalCost: 600,
        dayRating: 8,
      })
    }

    return {
      title: `${request.duration}-Day Tromsø Arctic Adventure`,
      summary: `An ${request.duration}-day journey through Arctic Tromsø featuring ${request.interests.join(', ')}. ${request.auroraViewing ? 'Evening aurora viewing opportunities included.' : ''}`,
      days,
      totalCost: 600 * request.duration,
      highlights: [
        'Aurora viewing (weather dependent)',
        'Arctic attractions and culture',
        'Local experiences',
        'Customized for your interests',
        'Includes transport guidance',
      ],
      recommendations: [
        'Download Svipper app for real-time bus schedules',
        'Book tours 1-2 days in advance',
        'Wear layers - Arctic weather is unpredictable',
        'Bring a camera for aurora photos',
        'Check weather forecasts daily',
      ],
      importantNotes: [
        'Aurora viewing subject to weather conditions',
        'Some attractions may have seasonal closures',
        'Prices are estimates and may vary',
        'Book accommodations early for peak season',
      ],
    }
  }
}

// ============================================================================
// EXPORTED FUNCTION
// ============================================================================

export async function createTripplan(
  request: TripplanRequest,
  options?: { useFallback?: boolean }
): Promise<TripPlan> {
  const curator = new TripplanCurator()

  try {
    const plan = await curator.plan(request)
    if (plan) return plan

    // Fallback to rule-based
    if (options?.useFallback !== false) {
      console.log('[Tripplan] AI plan generation failed, using fallback')
      return curator.planFallback(request)
    }

    throw new Error('Tripplan generation failed')
  } catch (error) {
    console.error(`[Tripplan] Error: ${error}`)
    return curator.planFallback(request)
  }
}
