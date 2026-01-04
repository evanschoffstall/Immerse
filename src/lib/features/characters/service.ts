import type { CampaignContext } from "@/lib/features/campaigns/context";
import { characterRepo } from "./repo";
import type {
  CreateCharacterInput,
  ListCharactersQuery,
  UpdateCharacterInput,
} from "./schemas";

/**
 * Character service - business logic layer
 * This sits between the API routes and the repository
 */
export const characterService = {
  /**
   * List characters with pagination and filters
   */
  async list(ctx: CampaignContext, query: ListCharactersQuery) {
    const { characters, total } = await characterRepo.findMany(
      ctx.campaign.id,
      query
    );

    return {
      characters,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNext: query.page * query.limit < total,
        hasPrev: query.page > 1,
      },
    };
  },

  /**
   * Get a single character by ID
   */
  async get(ctx: CampaignContext, characterId: string) {
    const character = await characterRepo.findById(
      characterId,
      ctx.campaign.id
    );

    if (!character) {
      throw new Error("NOT_FOUND");
    }

    return { character };
  },

  /**
   * Get a character by slug
   */
  async getBySlug(ctx: CampaignContext, slug: string) {
    const character = await characterRepo.findBySlug(slug, ctx.campaign.id);

    if (!character) {
      throw new Error("NOT_FOUND");
    }

    return { character };
  },

  /**
   * Create a new character
   */
  async create(ctx: CampaignContext, data: CreateCharacterInput) {
    // Validate calendar exists if provided
    if (data.birthCalendarId) {
      // You could add calendar validation here if needed
    }

    // Validate image exists if provided
    if (data.imageId) {
      // You could add image validation here if needed
    }

    const character = await characterRepo.create(
      ctx.campaign.id,
      ctx.userId,
      data
    );

    return { character };
  },

  /**
   * Update an existing character
   */
  async update(
    ctx: CampaignContext,
    characterId: string,
    data: UpdateCharacterInput
  ) {
    // Verify character exists and belongs to this campaign
    const existing = await characterRepo.findById(characterId, ctx.campaign.id);

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    // Validate calendar exists if provided
    if (data.birthCalendarId) {
      // You could add calendar validation here if needed
    }

    // Validate image exists if provided
    if (data.imageId) {
      // You could add image validation here if needed
    }

    const character = await characterRepo.update(
      characterId,
      ctx.campaign.id,
      data
    );

    return { character };
  },

  /**
   * Delete a character
   */
  async delete(ctx: CampaignContext, characterId: string) {
    // Verify character exists and belongs to this campaign
    const existing = await characterRepo.findById(characterId, ctx.campaign.id);

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    await characterRepo.delete(characterId);

    return { success: true };
  },

  /**
   * Get campaign stats
   */
  async getStats(ctx: CampaignContext) {
    const total = await characterRepo.count(ctx.campaign.id);
    const recent = await characterRepo.findRecent(ctx.campaign.id, 5);

    return {
      total,
      recent,
    };
  },
};
