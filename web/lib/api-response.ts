import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/nextjs';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  errors: Record<string, string[]> | null;
  timestamp: string;
  traceId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Generate a unique trace ID for request tracking
 */
export function generateTraceId(): string {
  return crypto.randomUUID();
}

/**
 * Create a success response
 */
export function success<T>(
  data: T,
  status: number = 200,
  traceId?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      errors: null,
      timestamp: new Date().toISOString(),
      traceId: traceId || generateTraceId(),
    },
    { status }
  );
}

/**
 * Create a created response (201)
 */
export function created<T>(data: T, traceId?: string): NextResponse<ApiResponse<T>> {
  return success(data, 201, traceId);
}

/**
 * Create a no content response (204)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create a paginated response
 */
export function paginated<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  traceId?: string
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      errors: null,
      timestamp: new Date().toISOString(),
      traceId: traceId || generateTraceId(),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    },
    { status: 200 }
  );
}

/**
 * Create an error response
 */
export function error(
  message: string,
  status: number = 500,
  traceId?: string,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse<null>> {
  const id = traceId || generateTraceId();

  // Log errors to Sentry for 5xx errors
  if (status >= 500) {
    Sentry.captureMessage(message, {
      level: 'error',
      extra: { traceId: id, status },
    });
  }

  return NextResponse.json(
    {
      success: false,
      data: null,
      error: message,
      errors: errors || null,
      timestamp: new Date().toISOString(),
      traceId: id,
    },
    { status }
  );
}

/**
 * Bad request (400)
 */
export function badRequest(
  message: string = 'Bad request',
  traceId?: string,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse<null>> {
  return error(message, 400, traceId, errors);
}

/**
 * Unauthorized (401)
 */
export function unauthorized(traceId?: string): NextResponse<ApiResponse<null>> {
  return error('Unauthorized', 401, traceId);
}

/**
 * Forbidden (403)
 */
export function forbidden(traceId?: string): NextResponse<ApiResponse<null>> {
  return error('Forbidden', 403, traceId);
}

/**
 * Not found (404)
 */
export function notFound(
  message: string = 'Resource not found',
  traceId?: string
): NextResponse<ApiResponse<null>> {
  return error(message, 404, traceId);
}

/**
 * Conflict (409)
 */
export function conflict(
  message: string = 'Resource already exists',
  traceId?: string
): NextResponse<ApiResponse<null>> {
  return error(message, 409, traceId);
}

/**
 * Unprocessable entity (422) - validation errors
 */
export function validationError(
  errors: Record<string, string[]>,
  traceId?: string
): NextResponse<ApiResponse<null>> {
  return error('Validation failed', 422, traceId, errors);
}

/**
 * Rate limited (429)
 */
export function rateLimited(
  resetAt: Date,
  traceId?: string
): NextResponse<ApiResponse<null>> {
  const response = error('Too many requests', 429, traceId);
  response.headers.set('Retry-After', resetAt.toISOString());
  return response;
}

/**
 * Internal server error (500)
 */
export function serverError(
  traceId?: string,
  originalError?: Error
): NextResponse<ApiResponse<null>> {
  if (originalError) {
    Sentry.captureException(originalError, {
      extra: { traceId },
    });
  }
  return error('Internal server error', 500, traceId);
}

/**
 * Service unavailable (503)
 */
export function serviceUnavailable(
  traceId?: string
): NextResponse<ApiResponse<null>> {
  return error('Service temporarily unavailable', 503, traceId);
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(
  zodError: ZodError,
  traceId?: string
): NextResponse<ApiResponse<null>> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of zodError.issues) {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return validationError(fieldErrors, traceId);
}

/**
 * Handle any error and return appropriate response
 */
export function handleError(
  err: unknown,
  traceId?: string
): NextResponse<ApiResponse<null>> {
  if (err instanceof ZodError) {
    return handleZodError(err, traceId);
  }

  if (err instanceof Error) {
    // Known error types
    if (err.message === 'Unauthorized') {
      return unauthorized(traceId);
    }
    if (err.message === 'Forbidden') {
      return forbidden(traceId);
    }
    if (err.message === 'Not found') {
      return notFound(err.message, traceId);
    }

    // Log unexpected errors
    Sentry.captureException(err, {
      extra: { traceId },
    });

    return serverError(traceId, err);
  }

  // Unknown error type
  Sentry.captureMessage('Unknown error type', {
    level: 'error',
    extra: { error: err, traceId },
  });

  return serverError(traceId);
}

/**
 * CORS headers for API responses
 */
export function withCors(
  response: NextResponse,
  origin?: string
): NextResponse {
  const allowedOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || '*';

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleCorsOptions(origin?: string): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return withCors(response, origin);
}
