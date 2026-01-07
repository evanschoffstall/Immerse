import { ApiErrors, apiRoute } from "@/lib/utils/api-proxy";
import { NextRequest } from "next/server";

/**
 * Root API proxy - handles all /api/* requests
 *
 * This catch-all route provides:
 * - Centralized authentication (except /api/auth)
 * - Standardized error handling (404, 401, 403, 500)
 * - Request/response formatting
 * - Routing to specific handlers
 *
 * Special routes (excluded from this proxy):
 * - /api/auth/[...nextauth] - NextAuth handler (has its own route)
 *
 * All other routes are proxied through here and can use the apiRoute wrapper.
 */

// Auth routes are handled separately by NextAuth
// They have their own route.ts in /api/auth/[...nextauth]/
// This proxy will not intercept them due to Next.js routing priority

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ segments }) => {
    // Root /api request
    if (segments.length === 0) {
      return {
        status: "ok",
        message: "Immerse API",
        version: "1.0",
      };
    }

    // All specific routes should have their own handlers
    // If we reach here, the route doesn't exist
    return ApiErrors.notFound(
      `API endpoint not found: /api/${segments.join("/")}`
    );
  })(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ segments }) => {
    return ApiErrors.notFound(
      `API endpoint not found: /api/${segments.join("/")}`
    );
  })(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ segments }) => {
    return ApiErrors.notFound(
      `API endpoint not found: /api/${segments.join("/")}`
    );
  })(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ segments }) => {
    return ApiErrors.notFound(
      `API endpoint not found: /api/${segments.join("/")}`
    );
  })(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ segments }) => {
    return ApiErrors.notFound(
      `API endpoint not found: /api/${segments.join("/")}`
    );
  })(request, context);
}
