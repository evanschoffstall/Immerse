import { campaignRepo } from "@/lib/data/repositories";
import { buildPaginationMeta } from "@/lib/utils/pagination";
import type {
  CreateCampaignInput,
  ListCampaignsQuery,
  UpdateCampaignInput,
} from "./schemas";

// Re-export context utilities from lib (for backward compatibility)
export {
  getCampaignContext,
  verifyCampaignAccess,
} from "@/lib/context/campaigns";
export type { CampaignContext } from "@/lib/context/campaigns";

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================================
// SERVICE - Campaign business logic
// ============================================================================

class CampaignService {
  /**
   * List campaigns for the authenticated user
   */
  async list(userId: string, query: ListCampaignsQuery) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const { campaigns, total } = await campaignRepo.findByUserId({
      userId,
      search,
      sortBy,
      sortOrder,
      skip,
      take: limit,
    });

    return {
      campaigns,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get a single campaign by ID
   */
  async get(id: string, userId: string) {
    const campaign = await campaignRepo.findById(id);

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
    const campaignData = data as any;
    const slug = generateSlug(campaignData.name);

    // Check if slug already exists
    const existing = await campaignRepo.slugExists(slug);
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const campaign = await campaignRepo.create({
      id: crypto.randomUUID(),
      name: campaignData.name,
      slug: finalSlug,
      ownerId: userId,
      description: campaignData.description,
      image: campaignData.image,
      backgroundImage: campaignData.backgroundImage,
      visibility: campaignData.visibility,
      locale: campaignData.locale,
    });

    return { campaign };
  }

  /**
   * Update a campaign
   */
  async update(id: string, userId: string, data: UpdateCampaignInput) {
    // Verify ownership
    const existing = await campaignRepo.findById(id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    if (existing.ownerId !== userId) {
      throw new Error("FORBIDDEN");
    }

    // Generate new slug if name changed
    let slug: string | undefined;
    if (data.name) {
      slug = generateSlug(data.name as unknown as string);

      // Check if new slug conflicts with another campaign
      const slugConflict = await campaignRepo.slugExists(slug, id);
      if (slugConflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const campaign = await campaignRepo.update(id, {
      ...data,
      ...(slug && { slug }),
    });

    return { campaign };
  }

  /**
   * Delete a campaign
   */
  async delete(id: string, userId: string) {
    // Verify ownership
    const existing = await campaignRepo.findById(id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    if (existing.ownerId !== userId) {
      throw new Error("FORBIDDEN");
    }

    await campaignRepo.delete(id);
    return { success: true };
  }

  /**
   * Get campaign stats (counts of related entities)
   */
  async getStats(campaignId: string) {
    const stats = await campaignRepo.getStats(campaignId);
    return {
      hasBeings: stats.beings > 0,
      hasQuests: stats.quests > 0,
      hasImages: stats.images > 0,
      hasCalendars: stats.calendars > 0,
      stats,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const campaignService = new CampaignService();
