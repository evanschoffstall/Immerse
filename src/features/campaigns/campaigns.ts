import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  campaignsOptionalDefaultsSchema,
  campaignsPartialSchema,
} from "@/lib/generated/zod/modelSchema/campaignsSchema";
import { makeNamedResourceSchemas } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

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
 * Load campaign context and verify user access
 * Throws standard errors that can be caught by route wrappers
 */
export async function getCampaignContext(
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

// ============================================================================
// SCHEMAS - For campaign CRUD operations
// ============================================================================

export const CampaignSchemas = makeNamedResourceSchemas(
  {
    optionalDefaults: campaignsOptionalDefaultsSchema,
    partial: campaignsPartialSchema,
  },
  true
); // true = isCampaign, uses different server-managed fields

// Campaigns don't need standard list filters (they're user-scoped, not campaign-scoped)
export const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCampaignInput = z.infer<typeof CampaignSchemas.create>;
export type UpdateCampaignInput = z.infer<typeof CampaignSchemas.update>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;

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
    const slug = this.generateSlug(data.name as unknown as string);

    // Check if slug already exists
    const existing = await this.findBySlug(slug);
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return prisma.campaigns.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        backgroundImage: data.backgroundImage,
        visibility: data.visibility,
        locale: data.locale,
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
export { campaignRepo };
