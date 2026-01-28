import { NextRequest, NextResponse } from 'next/server';
import type { TripPreferences, TripPlanResponse } from '@/types/trip';
import { generateTripPlan } from '@/lib/services/ai-curator';
import { getSeasonFromDate } from '@/lib/constants/seasons';
import { prisma } from '@/lib/db';
import cuid from 'cuid';
import {
  handleApiError,
  validateRequestBody,
  validationErrorResponse,
} from '@/lib/utils/api-error-handler';
import { addBreadcrumb, setRequestContext, tagError } from '@/sentry.config';

/**
 * POST /api/trips
 * Generate a personalized trip plan and persist to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences } = body as { preferences: TripPreferences };

    // Validate required fields
    const validation = validateRequestBody(
      { preferences },
      ['preferences']
    );
    if (!validation.valid) {
      return validationErrorResponse(validation.error || 'Invalid request body');
    }

    // Validate preferences structure
    if (!preferences.days || !preferences.budget || !preferences.interests) {
      return validationErrorResponse('Missing required fields: days, budget, interests');
    }

    // Validate days range
    if (preferences.days < 1 || preferences.days > 14) {
      return validationErrorResponse('Days must be between 1 and 14');
    }

    // Validate interests
    if (!Array.isArray(preferences.interests) || preferences.interests.length === 0) {
      return validationErrorResponse('At least one interest must be selected');
    }

    // Add breadcrumb for tracking
    addBreadcrumb('Trip plan generation started', {
      days: preferences.days,
      budget: preferences.budget,
      interests: preferences.interests.length,
    });

    // Determine season from start date or current date
    const startDate = preferences.startDate ? new Date(preferences.startDate) : new Date();
    const season = getSeasonFromDate(startDate);

    // Generate trip plan using AI curator
    let plan;
    try {
      plan = await generateTripPlan({
        preferences,
        season,
        startDate,
      });
      addBreadcrumb('Trip plan generated successfully', { season });
    } catch (error) {
      tagError('external');
      throw error;
    }

    // Persist to database (optional - if it fails, we still return the plan)
    let tripPlan;
    let persistenceError: Error | null = null;
    try {
      tripPlan = await prisma.tripPlan.create({
        data: {
          id: cuid(),
          shareableId: cuid(),
          preferences: preferences as any, // Prisma Json type accepts any
          plan: plan as any, // Prisma Json type accepts any
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
      addBreadcrumb('Trip plan persisted to database', { id: tripPlan.id });
    } catch (error) {
      tagError('database');
      persistenceError = error instanceof Error ? error : new Error(String(error));
      console.error('[Trip Plan API] Database persistence failed, but returning plan:', persistenceError.message);
      // Create a temporary response object without database persistence
      tripPlan = {
        id: cuid(),
        shareableId: cuid(),
        preferences: preferences as any,
        plan: plan as any,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

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

    setRequestContext('/api/trips', 'POST', 201);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/trips',
      method: 'POST',
      errorType: 'api',
      statusCode: 500,
      includeStack: process.env.NODE_ENV === 'development',
    });
  }
}
