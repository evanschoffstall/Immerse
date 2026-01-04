import {
  CampaignContext,
  getCampaignContext,
} from "@/lib/features/campaigns/context";
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

interface CampaignRouteContext {
  ctx: CampaignContext;
  query: URLSearchParams;
  body?: unknown;
  params?: Record<string, string>;
}

interface CampaignRouteOptions {
  bodySchema?: ZodSchema;
}

type CampaignRouteHandler = (
  context: CampaignRouteContext
) => Promise<Response | unknown>;

/**
 * Wrapper for campaign-scoped API routes
 * Handles:
 * - Campaign context loading + auth verification
 * - Error handling with standard responses
 * - Optional body validation with Zod
 * - Query param parsing
 */
export function campaignRoute(
  handler: CampaignRouteHandler,
  options: CampaignRouteOptions = {}
) {
  return async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; [key: string]: string }> }
  ) => {
    try {
      const resolvedParams = await params;
      const { id, ...otherParams } = resolvedParams;
      const ctx = await getCampaignContext(id);
      const query = request.nextUrl.searchParams;

      let body: unknown;
      if (request.method !== "GET" && request.method !== "DELETE") {
        const rawBody = await request.json().catch(() => ({}));

        if (options.bodySchema) {
          const result = options.bodySchema.safeParse(rawBody);
          if (!result.success) {
            return NextResponse.json(
              { error: "Validation error", issues: result.error.issues },
              { status: 400 }
            );
          }
          body = result.data;
        } else {
          body = rawBody;
        }
      }

      const result = await handler({
        ctx,
        query,
        body,
        params: otherParams,
      });

      // If handler returns a Response, use it directly
      if (result instanceof Response) {
        return result;
      }

      // Otherwise wrap in JSON response
      return NextResponse.json(result);
    } catch (error) {
      console.error("Campaign route error:", error);

      if (error instanceof Error) {
        switch (error.message) {
          case "UNAUTHORIZED":
            return NextResponse.json(
              { error: "Unauthorized" },
              { status: 401 }
            );
          case "CAMPAIGN_NOT_FOUND":
            return NextResponse.json(
              { error: "Campaign not found" },
              { status: 404 }
            );
          case "FORBIDDEN":
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          case "NOT_FOUND":
            return NextResponse.json(
              { error: "Resource not found" },
              { status: 404 }
            );
        }
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper for parsing pagination query params
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
