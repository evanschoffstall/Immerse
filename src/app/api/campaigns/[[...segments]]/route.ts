import { getCampaignContext } from "@/features/campaigns";
import {
  characters,
  CharacterSchemas,
  listCharactersSchema,
} from "@/features/campaigns/characters";
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
        const stats = { characters: 0, locations: 0, quests: 0, notes: 0 };
        return {
          hasCharacters: stats.characters > 0,
          hasLocations: stats.locations > 0,
          stats,
        };

      case "style":
        const style = await prisma.campaign_styles.findUnique({
          where: { campaignId: ctx.campaign.id },
        });
        return { style };

      case "quests":
        return { quests: [] };

      case "characters":
        if (resourceId) {
          // GET /api/campaigns/[id]/characters/[characterId]
          return await characters.getOne(ctx, resourceId);
        }
        // GET /api/campaigns/[id]/characters (list)
        const parsedQuery = listCharactersSchema.parse({
          page: query.get("page") || "1",
          limit: query.get("limit") || "20",
          search: query.get("search") || undefined,
          type: query.get("type") || undefined,
          isPrivate: query.get("isPrivate") || undefined,
          sortBy: query.get("sortBy") || "name",
          sortOrder: query.get("sortOrder") || "asc",
        });
        return await characters.list(ctx.campaign.id, parsedQuery);

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
      const { name, description } = body as any;

      if (!name) {
        return ApiErrors.badRequest("Name is required");
      }

      const campaign = await prisma.campaigns.create({
        data: {
          id: crypto.randomUUID(),
          name,
          slug:
            name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "") +
            "-" +
            Date.now(),
          description: description || "",
          ownerId: session?.user?.id || "",
          updatedAt: new Date(),
        },
      });

      return { campaign };
    }

    // Nested resources
    const [campaignId, resource] = segments;
    const ctx = await getCampaignContext(campaignId);

    switch (resource) {
      case "characters":
        const validated = CharacterSchemas.create.parse(body);
        return await characters.createOne(ctx, validated);

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
      const { name, description, image, backgroundImage, visibility, locale } =
        data;

      const updatedCampaign = await prisma.campaigns.update({
        where: { id: campaignId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
          ...(backgroundImage !== undefined && { backgroundImage }),
          ...(visibility !== undefined && { visibility }),
          ...(locale !== undefined && { locale }),
          updatedAt: new Date(),
        },
      });

      return { campaign: updatedCampaign };
    }

    // Nested resources
    switch (resource) {
      case "style":
        const style = await prisma.campaign_styles.upsert({
          where: { campaignId: ctx.campaign.id },
          update: { ...data, updatedAt: new Date() },
          create: {
            id: crypto.randomUUID(),
            campaignId: ctx.campaign.id,
            ...data,
            updatedAt: new Date(),
          },
        });
        return { style };

      case "characters":
        if (!resourceId) {
          return ApiErrors.notFound();
        }
        const validated = CharacterSchemas.update.parse(data);
        return await characters.updateOne(ctx, resourceId, validated);

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
      case "characters":
        if (!resourceId) {
          return ApiErrors.notFound();
        }
        return await characters.deleteOne(ctx, resourceId);

      default:
        return ApiErrors.notFound();
    }
  })(request, context);
}
