import { questsResource } from "@/lib/data/resources/quests";
import type { z } from "zod";

// ============================================================================
// SCHEMAS - Re-export from lib for convenience
// ============================================================================

export { questSchemas } from "@/lib/data/resources/quests";

// Infer types from schemas
import { questSchemas } from "@/lib/data/resources/quests";
export type CreateQuestInput = z.infer<typeof questSchemas.create>;
export type UpdateQuestInput = z.infer<typeof questSchemas.update>;

// ============================================================================
// SERVICE - Quest business logic
// ============================================================================

class QuestService {
  /**
   * Create a new quest in a campaign
   */
  async create(campaignId: string, data: CreateQuestInput) {
    // Business logic: Ensure quest belongs to campaign
    const result = await questsResource.create(campaignId, data);
    return result;
  }

  /**
   * Get a single quest
   */
  async get(campaignId: string, questId: string) {
    const result = await questsResource.getOne(questId);
    return result;
  }

  /**
   * List all quests in a campaign
   */
  async list(campaignId: string, query: any) {
    const result = await questsResource.list({
      where: { campaignId },
      ...query,
    });
    return result;
  }

  /**
   * Update an existing quest
   */
  async update(campaignId: string, questId: string, data: UpdateQuestInput) {
    const result = await questsResource.update(campaignId, questId, data);
    return result;
  }

  /**
   * Delete a quest
   */
  async delete(campaignId: string, questId: string) {
    await questsResource.delete(questId, { campaignId });
    return { success: true };
  }
}

// Export singleton instance
export const questService = new QuestService();
