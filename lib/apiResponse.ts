import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMIT: "RATE_LIMIT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

/**
 * Send a successful API response
 */
export function apiSuccess<T = any>(
  message: string,
  data?: T,
  status: number = HTTP_STATUS.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * Send an error API response
 */
export function apiError(
  message: string,
  status: number = HTTP_STATUS.BAD_REQUEST,
  code: string = ERROR_CODES.INVALID_INPUT,
  error?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
      error: error || message,
    },
    { status }
  );
}

/**
 * Legacy response function for backward compatibility
 */
export function response(
  success: boolean,
  status: number,
  message: string,
  data?: any
) {
  return NextResponse.json(
    {
      success,
      message,
      data,
    },
    { status }
  );
}
