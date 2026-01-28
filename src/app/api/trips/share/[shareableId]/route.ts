import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/utils/api-error-handler';
import { addBreadcrumb, setRequestContext } from '@/sentry.config';

/**
 * GET /api/trips/share/[shareableId]
 * Retrieve a trip plan via shareable link
 * Checks expiration and returns plan if valid
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareableId: string }> }
) {
  try {
    const { shareableId } = await params;

    // Validate shareableId format
    if (!shareableId || typeof shareableId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid shareable ID format' },
        { status: 400 }
      );
    }

    addBreadcrumb('Retrieving trip plan via share link', { shareableId });

    // Fetch trip plan from database
    let tripPlan;
    try {
      tripPlan = await prisma.tripPlan.findUnique({
        where: { shareableId },
      });
    } catch (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Check if trip exists
    if (!tripPlan) {
      addBreadcrumb('Shared trip plan not found', { shareableId });
      return NextResponse.json(
        { success: false, error: 'Trip plan not found' },
        { status: 404 }
      );
    }

    // Check if trip has expired
    if (tripPlan.expiresAt < new Date()) {
      addBreadcrumb('Shared trip plan expired', { shareableId, expiresAt: tripPlan.expiresAt });
      return NextResponse.json(
        { success: false, error: 'Shared link has expired (7 days)' },
        { status: 410 } // 410 Gone - resource no longer available
      );
    }

    addBreadcrumb('Shared trip plan retrieved successfully', { shareableId });
    setRequestContext('/api/trips/share/[shareableId]', 'GET', 200);

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
      endpoint: '/api/trips/share/[shareableId]',
      method: 'GET',
      errorType: 'database',
      statusCode: 500,
      includeStack: process.env.NODE_ENV === 'development',
    });
  }
}
