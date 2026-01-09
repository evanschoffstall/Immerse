import { prisma } from "@/lib/data/prisma";

/**
 * Campaign Settings Repository - All database operations for campaign settings
 * This is the ONLY place that should interact with prisma.campaign_settings
 */

export interface CampaignSettingsData {
  bgOpacity?: number;
  bgBlur?: number;
  bgExpandToSidebar?: boolean;
  bgExpandToHeader?: boolean;
  headerBgOpacity?: number;
  headerBlur?: number;
  sidebarBgOpacity?: number;
  sidebarBlur?: number;
  cardBgOpacity?: number;
  cardBlur?: number;
}

export class CampaignSettingsRepository {
  /**
   * Get settings for a campaign (or return null if not exists)
   */
  async findByCampaignId(campaignId: string) {
    return prisma.campaign_settings.findUnique({
      where: { campaignId },
    });
  }

  /**
   * Upsert campaign settings
   */
  async upsert(campaignId: string, data: CampaignSettingsData) {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete campaign settings
   */
  async delete(campaignId: string) {
    return prisma.campaign_settings.delete({
      where: { campaignId },
    });
  }
}

export const campaignSettingsRepo = new CampaignSettingsRepository();
