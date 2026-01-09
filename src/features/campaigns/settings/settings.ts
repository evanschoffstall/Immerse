import { campaignSettingsRepo } from "@/lib/data/repositories";
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
// SERVICE - Business logic for campaign settings
// ============================================================================

class CampaignSettingsService {
  /**
   * Get settings for a campaign
   */
  async get(campaignId: string) {
    const settings = await campaignSettingsRepo.findByCampaignId(campaignId);
    return { settings };
  }

  /**
   * Update campaign settings
   */
  async update(campaignId: string, data: CampaignSettingsInput) {
    const settings = await campaignSettingsRepo.upsert(campaignId, data);
    return { settings };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const campaignSettingsService = new CampaignSettingsService();
