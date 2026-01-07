import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

export const campaignSettingsSchema = z.object({
  bgOpacity: z.number().min(0).max(1).optional(),
  bgBlur: z.number().int().min(0).max(50).optional(),
  bgExpandToSidebar: z.boolean().optional(),
  bgExpandToHeader: z.boolean().optional(),
  headerBgOpacity: z.number().min(0).max(1).optional(),
  headerBlur: z.number().int().min(0).max(50).optional(),
  sidebarBgOpacity: z.number().min(0).max(1).optional(),
  sidebarBlur: z.number().int().min(0).max(50).optional(),
  cardBgOpacity: z.number().min(0).max(1).optional(),
  cardBlur: z.number().int().min(0).max(50).optional(),
});

export type CampaignSettingsInput = z.infer<typeof campaignSettingsSchema>;

// ============================================================================
// REPOSITORY
// ============================================================================

class CampaignSettingsRepository {
  /**
   * Get settings for a campaign (or return defaults if not exists)
   */
  async findByCampaignId(campaignId: string) {
    return prisma.campaign_settings.findUnique({
      where: { campaignId },
    });
  }

  /**
   * Upsert campaign settings
   */
  async upsert(campaignId: string, data: CampaignSettingsInput) {
    return prisma.campaign_settings.upsert({
      where: { campaignId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        campaignId,
        ...data,
        updatedAt: new Date(),
      },
    });
  }
}

// ============================================================================
// SERVICE
// ============================================================================

class CampaignSettingsService {
  constructor(private repo: CampaignSettingsRepository) {}

  /**
   * Get settings for a campaign
   */
  async get(campaignId: string) {
    const settings = await this.repo.findByCampaignId(campaignId);
    return { settings };
  }

  /**
   * Update campaign settings
   */
  async update(campaignId: string, data: CampaignSettingsInput) {
    const settings = await this.repo.upsert(campaignId, data);
    return { settings };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const settingsRepo = new CampaignSettingsRepository();
export const campaignSettingsService = new CampaignSettingsService(
  settingsRepo
);
export { settingsRepo };
