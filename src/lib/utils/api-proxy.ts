import { authConfig } from "@/lib/auth";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

/**
 * Standard API error responses
 */
export const ApiErrors = {
  unauthorized: () =>
    NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  forbidden: (message = "Forbidden") =>
    NextResponse.json({ error: message }, { status: 403 }),
  notFound: (message = "Not found") =>
    NextResponse.json({ error: message }, { status: 404 }),
  badRequest: (message: string, details?: unknown) =>
    NextResponse.json({ error: message, details }, { status: 400 }),
  serverError: (message = "Internal server error") =>
    NextResponse.json({ error: message }, { status: 500 }),
};

/**
 * Parsed API request context
 */
export interface ApiContext {
  session: Session | null;
  segments: string[];
  query: URLSearchParams;
  body?: unknown;
  request: NextRequest;
}

/**
 * Options for API route handler
 */
export interface ApiRouteOptions {
  /** Require authentication (default: true) */
  requireAuth?: boolean;
  /** Validate request body with Zod schema (for POST/PATCH/PUT) */
  bodySchema?: ZodSchema;
  /** Custom authentication check */
  authCheck?: (session: ApiContext["session"]) => boolean;
}

/**
 * API route handler function
 */
export type ApiHandler = (context: ApiContext) => Promise<Response | unknown>;

/**
 * Centralized API route wrapper
 * Handles:
 * - Authentication (configurable)
 * - Error handling with standard responses
 * - Request body parsing & validation
 * - Query param parsing
 * - Consistent response formatting
 */
export function apiRoute(handler: ApiHandler, options: ApiRouteOptions = {}) {
  const { requireAuth = true, bodySchema, authCheck } = options;

  return async (
    request: NextRequest,
    context?: { params: Promise<{ segments?: string[] }> }
  ) => {
    try {
      // Parse segments
      const segments = context?.params
        ? (await context.params).segments || []
        : [];

      // Get session
      const session = await getServerSession(authConfig);

      // Check authentication
      if (requireAuth) {
        if (!session?.user?.id) {
          return ApiErrors.unauthorized();
        }

        // Custom auth check
        if (authCheck && !authCheck(session)) {
          return ApiErrors.forbidden();
        }
      }

      // Parse body for mutating requests
      let body: unknown;
      const method = request.method;
      const contentType = request.headers.get("content-type") || "";

      // Skip body parsing for multipart/form-data (e.g., file uploads)
      // The handler will access request.formData() directly
      if (
        (method === "POST" || method === "PATCH" || method === "PUT") &&
        !contentType.includes("multipart/form-data")
      ) {
        const rawBody = await request.json().catch(() => ({}));

        if (bodySchema) {
          const result = bodySchema.safeParse(rawBody);
          if (!result.success) {
            return ApiErrors.badRequest(
              "Validation error",
              result.error.issues
            );
          }
          body = result.data;
        } else {
          body = rawBody;
        }
      }

      // Build context
      const apiContext: ApiContext = {
        session,
        segments,
        query: request.nextUrl.searchParams,
        body,
        request,
      };

      // Execute handler
      const result = await handler(apiContext);

      // Return Response directly or wrap in JSON
      if (result instanceof Response) {
        return result;
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error("API route error:", error);

      // Handle known errors
      if (error instanceof Error) {
        switch (error.message) {
          case "UNAUTHORIZED":
            return ApiErrors.unauthorized();
          case "FORBIDDEN":
            return ApiErrors.forbidden();
          case "NOT_FOUND":
          case "CAMPAIGN_NOT_FOUND":
            return ApiErrors.notFound(error.message);
          case "BAD_REQUEST":
            return ApiErrors.badRequest(error.message);
        }

        // Return error message for other known errors
        if (process.env.NODE_ENV === "development") {
          return ApiErrors.serverError(error.message);
        }
      }

      return ApiErrors.serverError();
    }
  };
}

/**
 * Create a route dispatcher for handling multiple resource types
 */
export function createRouteDispatcher<T extends string>(
  routes: Record<T, ApiHandler>
): ApiHandler {
  return async (context) => {
    const [resource] = context.segments;
    const handler = routes[resource as T];

    if (!handler) {
      return ApiErrors.notFound(`Resource '${resource}' not found`);
    }

    return handler(context);
  };
}

/**
 * Helper for pagination query params
 */
export function getPagination(query: URLSearchParams) {
  const page = Math.max(1, parseInt(query.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.get("limit") || "20", 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Helper for building paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
