import type { CampaignContext } from "@/features/campaigns";
import { CharacterSchemas, characterService } from "@/features/characters";
import { campaignRoute } from "@/lib/utils/route-helpers";

/**
 * GET /api/campaigns/[id]/characters/[characterId]
 * Get a single character by ID
 */
export const GET = campaignRoute(
  async (context: {
    ctx: CampaignContext;
    params?: Record<string, string>;
  }) => {
    const { ctx, params } = context;
    const characterId = params?.characterId;
    if (!characterId) {
      throw new Error("NOT_FOUND");
    }
    return await characterService.get(ctx, characterId);
  }
);

/**
 * PATCH /api/campaigns/[id]/characters/[characterId]
 * Update a character
 */
export const PATCH = campaignRoute(
  async (context: {
    ctx: CampaignContext;
    body?: unknown;
    params?: Record<string, string>;
  }) => {
    const { ctx, body, params } = context;
    const characterId = params?.characterId;
    if (!characterId) {
      throw new Error("NOT_FOUND");
    }
    return await characterService.update(ctx, characterId, body as any);
  },
  { bodySchema: CharacterSchemas.update }
);

/**
 * DELETE /api/campaigns/[id]/characters/[characterId]
 * Delete a character
 */
export const DELETE = campaignRoute(
  async (context: {
    ctx: CampaignContext;
    params?: Record<string, string>;
  }) => {
    const { ctx, params } = context;
    const characterId = params?.characterId;
    if (!characterId) {
      throw new Error("NOT_FOUND");
    }
    return await characterService.delete(ctx, characterId);
  }
);
