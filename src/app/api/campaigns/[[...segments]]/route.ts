import { getCampaignContext } from "@/features/campaigns";
import {
  beings,
  BeingSchemas,
  listBeingsSchema,
} from "@/features/campaigns/beings";
import {
  CampaignSchemas,
  campaignService,
} from "@/features/campaigns/campaigns";
import {
  listQuestsSchema,
  quests,
  QuestSchemas,
} from "@/features/campaigns/quests";
import {
  campaignSettingsSchema,
  campaignSettingsService,
} from "@/features/campaigns/settings";
import { prisma } from "@/lib/db/prisma";
import { ApiErrors, apiRoute } from "@/lib/utils/api-proxy";
import { NextRequest } from "next/server";

/**
 * Single proxy for ALL /api/campaigns/* routes
 * Handles collection, resource, and nested endpoints dynamically
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ segments?: string[] }> }
) {
  return apiRoute(async ({ session, segments, query }) => {
    // No segments: GET /api/campaigns (list all)
    if (segments.length === 0) {
      const campaigns = await prisma.campaigns.findMany({
        where: { ownerId: session?.user?.id || "" },
        orderBy: { updatedAt: "desc" },
      });
      return { campaigns };
    }

    // Load campaign context for all nested routes
    const [campaignId, resource, resourceId] = segments;
    const ctx = await getCampaignContext(campaignId);

    // One segment: GET /api/campaigns/[id]
    if (segments.length === 1) {
      const campaign = await prisma.campaigns.findUnique({
        where: { id: campaignId },
        include: {
          users: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      return { campaign };
    }

    // Two+ segments: nested resources
    switch (resource) {
      case "recent":
        return { entities: [] };

      case "stats":
        const [beingsCount, questsCount, imagesCount, calendarsCount] =
          await Promise.all([
            prisma.beings.count({
              where: { campaignId: ctx.campaign.id, deletedAt: null },
            }),
            prisma.quests.count({
              where: { campaignId: ctx.campaign.id, deletedAt: null },
            }),
            prisma.images.count({
              where: { campaignId: ctx.campaign.id, deletedAt: null },
            }),
            prisma.calendars.count({
              where: { campaignId: ctx.campaign.id, deletedAt: null },
            }),
          ]);
        const stats = {
          beings: beingsCount,
          quests: questsCount,
          images: imagesCount,
          calendars: calendarsCount,
        };
        return {
          hasBeings: stats.beings > 0,
          hasQuests: stats.quests > 0,
          hasImages: stats.images > 0,
          hasCalendars: stats.calendars > 0,
          stats,
        };

      case "settings":
        return await campaignSettingsService.get(ctx.campaign.id);

      case "quests":
        if (resourceId) {
          // GET /api/campaigns/[id]/quests/[questId]
          return await quests.getOne(ctx, resourceId);
        }
        // GET /api/campaigns/[id]/quests (list)
        const questQuery = listQuestsSchema.parse({
          page: query.get("page") || "1",
          limit: query.get("limit") || "20",
          search: query.get("search") || undefined,
          type: query.get("type") || undefined,
          status: query.get("status") || undefined,
          isPrivate: query.get("isPrivate") || undefined,
          sortBy: query.get("sortBy") || "name",
          sortOrder: query.get("sortOrder") || "asc",
        });
        return await quests.list(ctx.campaign.id, questQuery);

      case "beings":
        if (resourceId) {
          // GET /api/campaigns/[id]/beings/[beingId]
          return await beings.getOne(ctx, resourceId);
        }
        // GET /api/campaigns/[id]/beings (list)
        const parsedQuery = listBeingsSchema.parse({
          page: query.get("page") || "1",
          limit: query.get("limit") || "20",
          search: query.get("search") || undefined,
          type: query.get("type") || undefined,
          isPrivate: query.get("isPrivate") || undefined,
          sortBy: query.get("sortBy") || "name",
          sortOrder: query.get("sortOrder") || "asc",
        });
        return await beings.list(ctx.campaign.id, parsedQuery);

      default:
        return ApiErrors.notFound();
    }
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
    const ctx = await getCampaignContext(campaignId);

    switch (resource) {
      case "beings":
        const validated = BeingSchemas.create.parse(body);
        return await beings.createOne(ctx, validated);

      case "quests":
        const validatedQuest = QuestSchemas.create.parse(body);
        return await quests.createOne(ctx, validatedQuest);

      default:
        return ApiErrors.notFound();
    }
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
    const data = body as any;

    // One segment: PATCH /api/campaigns/[id]
    if (segments.length === 1) {
      const validated = CampaignSchemas.update.parse(data);
      return await campaignService.update(campaignId, ctx.userId, validated);
    }

    // Nested resources
    switch (resource) {
      case "settings":
        const validatedSettings = campaignSettingsSchema.parse(data);
        return await campaignSettingsService.update(
          campaignId,
          validatedSettings
        );

      case "beings":
        if (!resourceId) {
          return ApiErrors.notFound();
        }
        const validated = BeingSchemas.update.parse(data);
        return await beings.updateOne(ctx, resourceId, validated);

      case "quests":
        if (!resourceId) {
          return ApiErrors.notFound();
        }
        const validatedQuest = QuestSchemas.update.parse(data);
        return await quests.updateOne(ctx, resourceId, validatedQuest);

      default:
        return ApiErrors.notFound();
    }
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
    const ctx = await getCampaignContext(campaignId);

    // One segment: DELETE /api/campaigns/[id]
    if (segments.length === 1) {
      await prisma.campaigns.delete({
        where: { id: campaignId },
      });
      return { success: true };
    }

    // Nested resources
    switch (resource) {
      case "beings":
        if (!resourceId) {
          return ApiErrors.notFound();
        }
        return await beings.deleteOne(ctx, resourceId);

      case "quests":
        if (!resourceId) {
          return ApiErrors.notFound();
        }
        return await quests.deleteOne(ctx, resourceId);

      default:
        return ApiErrors.notFound();
    }
  })(request, context);
}
