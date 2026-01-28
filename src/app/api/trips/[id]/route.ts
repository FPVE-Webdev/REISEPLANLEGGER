import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Fetch trip plan from database
    const tripPlan = await prisma.tripPlan.findUnique({
      where: { id },
    });

    // Check if trip exists
    if (!tripPlan) {
      return NextResponse.json(
        { success: false, error: 'Trip plan not found' },
        { status: 404 }
      );
    }

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
    console.error('Error retrieving trip plan by ID:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve trip plan',
      },
      { status: 500 }
    );
  }
}
