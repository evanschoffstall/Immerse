import { campaignRoute } from "@/lib/api/route-helpers";
import type { CampaignContext } from "@/lib/features/campaigns/context";
import { characterService } from "@/lib/features/characters/service";
import {
  charactersOptionalDefaultsSchema,
  charactersPartialSchema,
} from "@/lib/generated/zod/modelSchema/charactersSchema";
import { makeNamedResourceSchemas } from "@/lib/validation/resourceSchemas";

const CharacterSchemas = makeNamedResourceSchemas({
  optionalDefaults: charactersOptionalDefaultsSchema,
  partial: charactersPartialSchema,
});

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
