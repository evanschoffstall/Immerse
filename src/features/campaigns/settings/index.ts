import {
  settingsResource,
  SettingsSchemas,
} from "@/lib/data/resources/settings";
import type { z } from "zod";

// ============================================================================
// SCHEMAS - Re-export from resource
// ============================================================================

export { SettingsSchemas };
export const campaignSettingsSchema = SettingsSchemas.update;

// ============================================================================
// SERVICE - Business logic for campaign settings (upsert behavior)
// ============================================================================

class CampaignSettingsService {
  /**
   * Get settings for a campaign
   * Returns default settings if none exist
   */
  async get(campaignId: string) {
    const settings = await settingsResource.list({
      where: { campaignId },
      limit: 1,
    });

    return { settings: settings.items[0] || null };
  }

  /**
   * Update campaign settings (upsert behavior)
   * This service adds value by handling upsert logic
   */
  async update(
    campaignId: string,
    data: z.infer<typeof SettingsSchemas.update>
  ) {
    // Check if settings exist
    const existing = await settingsResource.list({
      where: { campaignId },
      limit: 1,
    });

    let settings;
    if (existing.items.length > 0) {
      // Update existing
      settings = await settingsResource.update(
        campaignId,
        existing.items[0].id,
        data
      );
    } else {
      // Create new with campaign ID
      settings = await settingsResource.create(campaignId, {
        ...data,
        campaignId,
      } as any);
    }

    return { settings };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const campaignSettingsService = new CampaignSettingsService();
