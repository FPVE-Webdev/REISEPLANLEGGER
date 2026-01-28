import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Fetch trip plan from database
    const tripPlan = await prisma.tripPlan.findUnique({
      where: { shareableId },
    });

    // Check if trip exists
    if (!tripPlan) {
      return NextResponse.json(
        { success: false, error: 'Trip plan not found' },
        { status: 404 }
      );
    }

    // Check if trip has expired
    if (tripPlan.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Shared link has expired (7 days)' },
        { status: 410 } // 410 Gone - resource no longer available
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
    console.error('Error retrieving trip plan via share link:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve trip plan',
      },
      { status: 500 }
    );
  }
}
