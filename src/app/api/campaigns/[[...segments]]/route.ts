import {
  CampaignSchemas,
  campaignService,
} from "@/features/campaigns/campaigns";
import {
  campaignSettingsSchema,
  campaignSettingsService,
} from "@/features/campaigns/settings";
import { ApiErrors, apiRoute } from "@/lib/api/proxy";
import { getCampaignContext } from "@/lib/context/campaigns";
import { isValidResource, resourceRegistry } from "@/lib/data/resources";
import { NextRequest } from "next/server";

/**
 * Single proxy for ALL /api/campaigns/* routes
 *
 * Architecture:
 * - Campaign CRUD: Uses campaignService directly
 * - Nested resources: Delegates to registry handlers (which call services internally)
 * - ALL business logic in features/ services
 * - Zero Prisma imports in this layer
 *
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ session, segments, query }) => {
    // No segments: GET /api/campaigns (list all)
    if (segments.length === 0) {
      const result = await campaignService.list(session?.user?.id || "", {
        page: 1,
        limit: 100,
        sortBy: "updatedAt",
        sortOrder: "desc",
      });
      return { campaigns: result.campaigns };
    }

    const [campaignId, resource, resourceId] = segments;

    // One segment: GET /api/campaigns/[id] (single campaign)
    if (segments.length === 1) {
      const result = await campaignService.get(
        campaignId,
        session?.user?.id || ""
      );
      return result;
    }

    // Special read-only endpoints (no full context needed)
    if (resource === "recent") return { entities: [] };

    if (resource === "stats") {
      return await campaignService.getStats(campaignId);
    }

    if (resource === "settings") {
      const ctx = await getCampaignContext(campaignId);
      return await campaignSettingsService.get(ctx.campaign.id);
    }

    // Generic resource handling via unified registry
    if (isValidResource(resource)) {
      const registration = resourceRegistry.get(resource);
      if (!registration) return ApiErrors.notFound();

      // Use the unified API handler
      return await registration.handler.handleGet(request, {
        id: campaignId,
        resourceId,
      });
    }

    return ApiErrors.notFound();
  })(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ session, segments, body }) => {
    // No segments: POST /api/campaigns (create new campaign)
    if (segments.length === 0) {
      const validated = CampaignSchemas.create.parse(body);
      return await campaignService.create(session?.user?.id || "", validated);
    }

    // Nested resources
    const [campaignId, resource] = segments;

    // Generic resource handling via unified registry
    if (isValidResource(resource)) {
      const registration = resourceRegistry.get(resource);
      if (!registration) return ApiErrors.notFound();

      return await registration.handler.handlePost(request, {
        id: campaignId,
      });
    }

    return ApiErrors.notFound();
  })(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ segments, body }) => {
    if (segments.length === 0) {
      return ApiErrors.notFound();
    }

    const [campaignId, resource, resourceId] = segments;
    const ctx = await getCampaignContext(campaignId);

    // One segment: PATCH /api/campaigns/[id]
    if (segments.length === 1) {
      const validated = CampaignSchemas.update.parse(body);
      return await campaignService.update(campaignId, ctx.userId, validated);
    }

    // Special endpoints
    if (resource === "settings") {
      const validated = campaignSettingsSchema.parse(body);
      return await campaignSettingsService.update(campaignId, validated);
    }

    // Generic resource handling via unified registry
    if (isValidResource(resource)) {
      const registration = resourceRegistry.get(resource);
      if (!registration) return ApiErrors.notFound();

      return await registration.handler.handlePatch(request, {
        id: campaignId,
        resourceId,
      });
    }

    return ApiErrors.notFound();
  })(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ segments }) => {
    if (segments.length === 0) {
      return ApiErrors.notFound();
    }

    const [campaignId, resource, resourceId] = segments;

    // One segment: DELETE /api/campaigns/[id]
    if (segments.length === 1) {
      const ctx = await getCampaignContext(campaignId);
      await campaignService.delete(campaignId, ctx.userId);
      return { success: true };
    }

    // Generic resource handling via unified registry
    if (isValidResource(resource)) {
      const registration = resourceRegistry.get(resource);
      if (!registration) return ApiErrors.notFound();

      return await registration.handler.handleDelete(request, {
        id: campaignId,
        resourceId,
      });
    }

    return ApiErrors.notFound();
  })(request, context);
}
