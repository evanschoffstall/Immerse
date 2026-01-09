import { beingsResource } from "@/lib/data/resources/beings";
import type { z } from "zod";

// ============================================================================
// SCHEMAS - Re-export from lib for convenience
// ============================================================================

export { beingSchemas } from "@/lib/data/resources/beings";

// Infer types from schemas
import { beingSchemas } from "@/lib/data/resources/beings";
export type CreateBeingInput = z.infer<typeof beingSchemas.create>;
export type UpdateBeingInput = z.infer<typeof beingSchemas.update>;

// ============================================================================
// SERVICE - Being business logic
// ============================================================================

class BeingService {
  /**
   * Create a new being in a campaign
   */
  async create(campaignId: string, data: CreateBeingInput) {
    // Business logic: Ensure being belongs to campaign
    const result = await beingsResource.create(campaignId, data);
    return result;
  }

  /**
   * Get a single being
   */
  async get(campaignId: string, beingId: string) {
    const result = await beingsResource.getOne(beingId);
    return result;
  }

  /**
   * List all beings in a campaign
   */
  async list(campaignId: string, query: any) {
    const result = await beingsResource.list({
      where: { campaignId },
      ...query,
    });
    return result;
  }

  /**
   * Update an existing being
   */
  async update(campaignId: string, beingId: string, data: UpdateBeingInput) {
    const result = await beingsResource.update(campaignId, beingId, data);
    return result;
  }

  /**
   * Delete a being
   */
  async delete(campaignId: string, beingId: string) {
    await beingsResource.delete(beingId, { campaignId });
    return { success: true };
  }
}

// Export singleton instance
export const beingService = new BeingService();
