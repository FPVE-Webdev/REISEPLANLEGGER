import { NextRequest, NextResponse } from 'next/server';
import type { TripPreferences, TripPlanResponse } from '@/types/trip';
import { generateTripPlan } from '@/lib/services/ai-curator';
import { getSeasonFromDate } from '@/lib/constants/seasons';
import { prisma } from '@/lib/db';
import cuid from 'cuid';

/**
 * POST /api/trips
 * Generate a personalized trip plan and persist to database
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

    // Persist to database
    const tripPlan = await prisma.tripPlan.create({
      data: {
        id: cuid(),
        shareableId: cuid(),
        preferences: preferences as any, // Prisma Json type accepts any
        plan: plan as any, // Prisma Json type accepts any
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const response: TripPlanResponse & { id: string; shareableId: string } = {
      plan,
      preferences,
      generatedAt: new Date().toISOString(),
      metadata: {
        companiesAvailable: 0, // TODO: Count from database
        guidesAvailable: 0, // TODO: Count from database
      },
      id: tripPlan.id,
      shareableId: tripPlan.shareableId,
    };

    return NextResponse.json(response, { status: 201 });
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
