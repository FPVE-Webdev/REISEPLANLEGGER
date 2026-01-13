import { NextRequest, NextResponse } from 'next/server';
import type { TripPreferences, TripPlanResponse } from '@/types/trip';
import { generateTripPlan } from '@/lib/services/ai-curator';
import { getSeasonFromDate } from '@/lib/constants/seasons';

/**
 * POST /api/trips
 * Generate a personalized trip plan based on user preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences } = body as { preferences: TripPreferences };

    // Validate required fields
    if (!preferences || !preferences.days || !preferences.budget || !preferences.interests) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: days, budget, interests' },
        { status: 400 }
      );
    }

    // Validate days range
    if (preferences.days < 1 || preferences.days > 14) {
      return NextResponse.json(
        { success: false, error: 'Days must be between 1 and 14' },
        { status: 400 }
      );
    }

    // Validate interests
    if (!Array.isArray(preferences.interests) || preferences.interests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one interest must be selected' },
        { status: 400 }
      );
    }

    // Determine season from start date or current date
    const startDate = preferences.startDate ? new Date(preferences.startDate) : new Date();
    const season = getSeasonFromDate(startDate);

    // Generate trip plan using AI curator
    const plan = await generateTripPlan({
      preferences,
      season,
      startDate,
    });

    const response: TripPlanResponse = {
      plan,
      preferences,
      generatedAt: new Date().toISOString(),
      metadata: {
        companiesAvailable: 0, // TODO: Count from database
        guidesAvailable: 0, // TODO: Count from database
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating trip plan:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate trip plan',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[id]
 * Retrieve a previously generated trip plan (future: save to database)
 */
export async function GET(request: NextRequest) {
  // TODO: Implement trip plan retrieval from database
  return NextResponse.json(
    { success: false, error: 'Not implemented yet' },
    { status: 501 }
  );
}
