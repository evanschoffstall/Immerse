import { campaignRepo } from "@/lib/data/repositories";
import { buildPaginationMeta } from "@/lib/utils/pagination";
import { makeNamedResourceSchemas } from "@/lib/validation";
import { z } from "zod";

// Re-export context utilities from lib (for backward compatibility)
export {
  getCampaignContext,
  verifyCampaignAccess,
} from "@/lib/context/campaigns";
export type { CampaignContext } from "@/lib/context/campaigns";

// ============================================================================
// SCHEMAS - For campaign CRUD operations
// ============================================================================

const campaignsOptionalDefaultsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  backgroundImage: z.string().optional(),
  visibility: z.string().optional(),
  locale: z.string().optional(),
});

const campaignsPartialSchema = campaignsOptionalDefaultsSchema.partial();

export const CampaignSchemas = makeNamedResourceSchemas(
  {
    optionalDefaults: campaignsOptionalDefaultsSchema,
    partial: campaignsPartialSchema,
  },
  true
); // true = isCampaign, uses different server-managed fields

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
