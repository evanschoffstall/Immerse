import { getCampaignContext } from "@/features/campaigns";
import {
  CharacterSchemas,
  characterService,
  listCharactersQuerySchema,
} from "@/features/campaigns/characters";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

/**
 * Single proxy for ALL /api/campaigns/* routes
 * Handles collection, resource, and nested endpoints dynamically
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params;
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // No segments: GET /api/campaigns (list all)
  if (segments.length === 0) {
    const campaigns = await prisma.campaigns.findMany({
      where: { ownerId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ campaigns });
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
    return NextResponse.json({ campaign });
  }

  // Two+ segments: nested resources
  const query = request.nextUrl.searchParams;

  switch (resource) {
    case "recent":
      return NextResponse.json({ entities: [] });

    case "stats":
      const stats = { characters: 0, locations: 0, quests: 0, notes: 0 };
      return NextResponse.json({
        hasCharacters: stats.characters > 0,
        hasLocations: stats.locations > 0,
        stats,
      });

    case "style":
      const style = await prisma.campaign_styles.findUnique({
        where: { campaignId: ctx.campaign.id },
      });
      return NextResponse.json({ style });

    case "quests":
      return NextResponse.json({ quests: [] });

    case "characters":
      if (resourceId) {
        // GET /api/campaigns/[id]/characters/[characterId]
        const character = await characterService.get(ctx, resourceId);
        return NextResponse.json(character);
      }
      // GET /api/campaigns/[id]/characters (list)
      const parsedQuery = listCharactersQuerySchema.parse({
        page: query.get("page") || "1",
        limit: query.get("limit") || "20",
        search: query.get("search") || undefined,
        type: query.get("type") || undefined,
        isPrivate: query.get("isPrivate") || undefined,
        sortBy: query.get("sortBy") || "name",
        sortOrder: query.get("sortOrder") || "asc",
      });
      const characters = await characterService.list(ctx, parsedQuery);
      return NextResponse.json(characters);

    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params;
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // No segments: POST /api/campaigns (create new campaign)
  if (segments.length === 0) {
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
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
        ownerId: session.user.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  }

  // Nested resources
  const [campaignId, resource] = segments;
  const ctx = await getCampaignContext(campaignId);

  switch (resource) {
    case "characters":
      const validated = CharacterSchemas.create.parse(body);
      const character = await characterService.create(ctx, validated);
      return NextResponse.json(character);

    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params;
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (segments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [campaignId, resource, resourceId] = segments;
  const ctx = await getCampaignContext(campaignId);
  const body = await request.json();

  // One segment: PATCH /api/campaigns/[id]
  if (segments.length === 1) {
    const { name, description, image, backgroundImage, visibility, locale } =
      body;

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

    return NextResponse.json({ campaign: updatedCampaign });
  }

  // Nested resources
  switch (resource) {
    case "style":
      const style = await prisma.campaign_styles.upsert({
        where: { campaignId: ctx.campaign.id },
        update: { ...body, updatedAt: new Date() },
        create: {
          id: crypto.randomUUID(),
          campaignId: ctx.campaign.id,
          ...body,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ style });

    case "characters":
      if (!resourceId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const validated = CharacterSchemas.update.parse(body);
      const character = await characterService.update(
        ctx,
        resourceId,
        validated
      );
      return NextResponse.json(character);

    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params;
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (segments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [campaignId, resource, resourceId] = segments;
  const ctx = await getCampaignContext(campaignId);

  // One segment: DELETE /api/campaigns/[id]
  if (segments.length === 1) {
    await prisma.campaigns.delete({
      where: { id: campaignId },
    });
    return NextResponse.json({ success: true });
  }

  // Nested resources
  switch (resource) {
    case "characters":
      if (!resourceId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const result = await characterService.delete(ctx, resourceId);
      return NextResponse.json(result);

    default:
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
