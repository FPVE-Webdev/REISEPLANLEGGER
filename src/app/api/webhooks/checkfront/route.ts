import { NextRequest, NextResponse } from 'next/server';
import {
  handleCheckfrontWebhook,
  verifyCheckfrontWebhook,
} from '@/lib/integrations/checkfront';

/**
 * POST /api/webhooks/checkfront
 * Handle Checkfront webhook events for real-time availability updates
 *
 * Events:
 * - booking.created
 * - booking.updated
 * - booking.cancelled
 * - item.updated
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-checkfront-signature') || '';
    const rawBody = await request.text();

    // Verify webhook signature
    const secret = process.env.CHECKFRONT_WEBHOOK_SECRET || '';
    const isValid = verifyCheckfrontWebhook(signature, rawBody, secret);

    if (!isValid) {
      console.warn('Invalid Checkfront webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = JSON.parse(rawBody);

    // Handle webhook
    await handleCheckfrontWebhook(payload);

    return NextResponse.json(
      { success: true, message: 'Webhook processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing Checkfront webhook:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/checkfront
 * Health check endpoint for webhook setup verification
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Checkfront webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
