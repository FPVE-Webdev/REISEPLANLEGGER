import { NextResponse } from 'next/server';
import {
  captureException,
  setRequestContext,
  tagError,
  addBreadcrumb,
} from '@/sentry.config';

export interface ApiErrorOptions {
  endpoint: string;
  method: string;
  errorType?: 'api' | 'database' | 'external' | 'validation';
  statusCode?: number;
  includeStack?: boolean;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

/**
 * Handle API errors consistently with Sentry integration
 * Captures error context without exposing sensitive information
 */
export function handleApiError(
  error: Error | unknown,
  options: ApiErrorOptions
): NextResponse<ApiErrorResponse> {
  const {
    endpoint,
    method,
    errorType = 'api',
    statusCode = 500,
    includeStack = false,
  } = options;

  // Extract error message safely
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error occurred';

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(
      `[${method} ${endpoint}] Error:`,
      error instanceof Error ? error : String(error)
    );
  }

  // Set request context for Sentry
  setRequestContext(endpoint, method, statusCode);

  // Tag error by type
  tagError(errorType);

  // Add breadcrumb
  addBreadcrumb(`API Error: ${endpoint}`, {
    method,
    status_code: statusCode,
    error_type: errorType,
  });

  // Capture exception with context
  const errorToCapture = error instanceof Error ? error : new Error(String(error));
  captureException(errorToCapture, {
    endpoint,
    method,
    statusCode,
    errorType,
    ...(includeStack && error instanceof Error && { stack: error.stack }),
  });

  // Return error response
  return NextResponse.json(
    {
      success: false,
      error:
        statusCode === 500
          ? 'An error occurred processing your request'
          : errorMessage,
    },
    { status: statusCode }
  );
}

/**
 * Wrap an API handler with error handling
 * Usage: export const POST = withApiErrorHandler(handler, 'POST /api/trips');
 */
export function withApiErrorHandler<
  T extends (...args: any[]) => Promise<NextResponse>
>(
  handler: T,
  methodEndpoint: string,
  errorType: 'api' | 'database' | 'external' | 'validation' = 'api'
): T {
  const [method, endpoint] = methodEndpoint.split(' ');

  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, {
        endpoint,
        method,
        errorType,
      });
    }
  }) as T;
}

/**
 * Validate request body with error handling
 */
export function validateRequestBody(
  body: any,
  requiredFields: string[]
): { valid: boolean; error?: string } {
  for (const field of requiredFields) {
    if (!body || !(field in body) || body[field] === undefined) {
      return {
        valid: false,
        error: `Missing required field: ${field}`,
      };
    }
  }
  return { valid: true };
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(message: string): NextResponse {
  addBreadcrumb(`Validation error: ${message}`, {}, 'validation');
  tagError('validation');

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 400 }
  );
}
