import { prisma } from "@/lib/data/prisma";
import { Prisma } from "@prisma/client";

/**
 * Campaign Repository - All database operations for campaigns
 * This is the ONLY place that should interact with prisma.campaigns
 */

const campaignInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.campaignsInclude;

export interface ListCampaignsOptions {
  userId: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  skip?: number;
  take?: number;
}

export class CampaignRepository {
  /**
   * Find all campaigns for a user
   */
  async findByUserId(options: ListCampaignsOptions) {
    const {
      userId,
      search,
      sortBy = "updatedAt",
      sortOrder = "desc",
      skip = 0,
      take = 20,
    } = options;

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
        take,
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
   * Check if slug exists (excluding optional campaign id)
   */
  async slugExists(slug: string, excludeId?: string) {
    return prisma.campaigns.findFirst({
      where: {
        slug,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });
  }

  /**
   * Create a new campaign
   */
  async create(data: {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    description?: string | null;
    image?: string | null;
    backgroundImage?: string | null;
    visibility?: string;
    locale?: string;
  }) {
    return prisma.campaigns.create({
      data: {
        ...data,
        updatedAt: new Date(),
      } as Prisma.campaignsUncheckedCreateInput,
      include: campaignInclude,
    });
  }

  /**
   * Update a campaign
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      image: string | null;
      backgroundImage: string | null;
      visibility: string;
      locale: string;
    }>
  ) {
    return prisma.campaigns.update({
      where: { id },
      data: {
        ...data,
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
   * Get stats for a campaign (count of related entities)
   */
  async getStats(campaignId: string) {
    const [beingsCount, questsCount, imagesCount, calendarsCount] =
      await Promise.all([
        prisma.beings.count({
          where: { campaignId, deletedAt: null },
        }),
        prisma.quests.count({
          where: { campaignId, deletedAt: null },
        }),
        prisma.images.count({
          where: { campaignId, deletedAt: null },
        }),
        prisma.calendars.count({
          where: { campaignId, deletedAt: null },
        }),
      ]);

    return {
      beings: beingsCount,
      quests: questsCount,
      images: imagesCount,
      calendars: calendarsCount,
    };
  }
}

export const campaignRepo = new CampaignRepository();
