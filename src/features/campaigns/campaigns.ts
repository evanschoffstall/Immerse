import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { cache } from "react";
import type {
  CreateCampaignInput,
  ListCampaignsQuery,
  UpdateCampaignInput,
} from "./schemas";

// ============================================================================
// CONTEXT - Shared infrastructure for loading campaign context
// ============================================================================

export interface CampaignContext {
  campaign: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    backgroundImage: string | null;
    visibility: string;
    locale: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  };
  userId: string;
  isOwner: boolean;
}

/**
 * Internal function to load campaign context
 */
async function _getCampaignContext(
  campaignId: string
): Promise<CampaignContext> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const campaign = await prisma.campaigns.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  // For now, only owners have access
  // TODO: Extend this to check campaign_roles for members/viewers
  const isOwner = campaign.ownerId === session.user.id;

  if (!isOwner) {
    throw new Error("FORBIDDEN");
  }

  return {
    campaign,
    session: {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || undefined,
      },
    },
    userId: session.user.id,
    isOwner,
  };
}

/**
 * Load campaign context and verify user access
 * Cached per-request to avoid duplicate database queries
 * Throws standard errors that can be caught by route wrappers
 */
export const getCampaignContext = cache(_getCampaignContext);

/**
 * Lightweight campaign access check (cached)
 * Only verifies user owns campaign without loading full context
 * Returns campaignId if authorized, throws error otherwise
 */
async function _verifyCampaignAccess(
  campaignId: string,
  userId: string
): Promise<string> {
  const campaign = await prisma.campaigns.findUnique({
    where: { id: campaignId },
    select: { id: true, ownerId: true },
  });

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  if (campaign.ownerId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return campaignId;
}

/**
 * Cached lightweight access check for read-only operations
 * Use this instead of getCampaignContext when you only need to verify access
 */
export const verifyCampaignAccess = cache(_verifyCampaignAccess);

// ============================================================================
// SCHEMAS - For campaign CRUD operations
// ============================================================================

export {
  CampaignSchemas,
  listCampaignsQuerySchema,
  type CreateCampaignInput,
  type ListCampaignsQuery,
  type UpdateCampaignInput,
} from "./schemas";
export { campaignRepo };

// ============================================================================
// REPOSITORY - Campaign-specific operations
// ============================================================================

const campaignInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.campaignsInclude;

/**
 * Campaign repository - campaigns are user-scoped, not campaign-scoped
 * So we don't extend CampaignResourceRepository
 */
class CampaignRepository {
  /**
   * Find all campaigns for a user
   */
  async findByUserId(userId: string, query: ListCampaignsQuery) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.campaignsWhereInput = {
      ownerId: userId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy = { [sortBy]: sortOrder };

    const [campaigns, total] = await Promise.all([
      prisma.campaigns.findMany({
        where,
        include: campaignInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.campaigns.count({ where }),
    ]);

    return { campaigns, total };
  }

  /**
   * Find a single campaign by ID
   */
  async findById(id: string) {
    return prisma.campaigns.findUnique({
      where: { id },
      include: campaignInclude,
    });
  }

  /**
   * Find a campaign by slug
   */
  async findBySlug(slug: string) {
    return prisma.campaigns.findUnique({
      where: { slug },
      include: campaignInclude,
    });
  }

  /**
   * Create a new campaign
   */
  async create(ownerId: string, data: CreateCampaignInput) {
    const campaignData = data as any;
    const slug = this.generateSlug(campaignData.name);

    // Check if slug already exists
    const existing = await this.findBySlug(slug);
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return prisma.campaigns.create({
      data: {
        name: campaignData.name,
        description: campaignData.description,
        image: campaignData.image,
        backgroundImage: campaignData.backgroundImage,
        visibility: campaignData.visibility,
        locale: campaignData.locale,
        slug: finalSlug,
        ownerId,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      } as unknown as Prisma.campaignsUncheckedCreateInput,
      include: campaignInclude,
    });
  }

  /**
   * Update a campaign
   */
  async update(id: string, data: UpdateCampaignInput) {
    let slug: string | undefined;
    if (data.name) {
      slug = this.generateSlug(data.name as unknown as string);

      // Check if new slug conflicts with another campaign
      const existing = await prisma.campaigns.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    return prisma.campaigns.update({
      where: { id },
      data: {
        ...data,
        ...(slug && { slug }),
        updatedAt: new Date(),
      },
      include: campaignInclude,
    });
  }

  /**
   * Delete a campaign
   */
  async delete(id: string) {
    return prisma.campaigns.delete({
      where: { id },
    });
  }

  /**
   * Generate a URL-friendly slug from a name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

// ============================================================================
// SERVICE - Campaign business logic
// ============================================================================

class CampaignService {
  constructor(private repo: CampaignRepository) {}

  /**
   * List campaigns for the authenticated user
   */
  async list(userId: string, query: ListCampaignsQuery) {
    const { campaigns, total } = await this.repo.findByUserId(userId, query);

    return {
      campaigns,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNext: query.page * query.limit < total,
        hasPrev: query.page > 1,
      },
    };
  }

  /**
   * Get a single campaign by ID
   */
  async get(id: string, userId: string) {
    const campaign = await this.repo.findById(id);

    if (!campaign) {
      throw new Error("NOT_FOUND");
    }

    // Verify ownership
    if (campaign.ownerId !== userId) {
      throw new Error("FORBIDDEN");
    }

    return { campaign };
  }

  /**
   * Create a new campaign
   */
  async create(userId: string, data: CreateCampaignInput) {
    const campaign = await this.repo.create(userId, data);
    return { campaign };
  }

  /**
   * Update a campaign
   */
  async update(id: string, userId: string, data: UpdateCampaignInput) {
    // Verify ownership
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    if (existing.ownerId !== userId) {
      throw new Error("FORBIDDEN");
    }

    const campaign = await this.repo.update(id, data);
    return { campaign };
  }

  /**
   * Delete a campaign
   */
  async delete(id: string, userId: string) {
    // Verify ownership
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    if (existing.ownerId !== userId) {
      throw new Error("FORBIDDEN");
    }

    await this.repo.delete(id);
    return { success: true };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const campaignRepo = new CampaignRepository();
export const campaignService = new CampaignService(campaignRepo);
