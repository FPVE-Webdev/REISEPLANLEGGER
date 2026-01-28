import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { addBreadcrumb, setRequestContext } from '@/sentry.config';

/**
 * GET /api/trips/[id]
 * Retrieve a previously generated trip plan by ID
 * Note: This endpoint does NOT check expiration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate id format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid trip ID format' },
        { status: 400 }
      );
    }

    addBreadcrumb('Fetching trip plan by ID', { id });

    // Fetch trip plan from database
    let tripPlan;
    try {
      tripPlan = await prisma.tripPlan.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Check if trip exists
    if (!tripPlan) {
      addBreadcrumb('Trip plan not found', { id });
      return NextResponse.json(
        { success: false, error: 'Trip plan not found' },
        { status: 404 }
      );
    }

    addBreadcrumb('Trip plan retrieved successfully', { id });
    setRequestContext('/api/trips/[id]', 'GET', 200);

    // Return trip plan data
    return NextResponse.json(
      {
        success: true,
        id: tripPlan.id,
        shareableId: tripPlan.shareableId,
        plan: tripPlan.plan,
        preferences: tripPlan.preferences,
        createdAt: tripPlan.createdAt.toISOString(),
        expiresAt: tripPlan.expiresAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/trips/[id]',
      method: 'GET',
      errorType: 'database',
      statusCode: 500,
      includeStack: process.env.NODE_ENV === 'development',
    });
  }
}
