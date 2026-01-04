import { campaignRoute } from "@/lib/api/route-helpers";
import { characterService } from "@/lib/features/characters/service";
import {
  charactersOptionalDefaultsSchema,
  charactersPartialSchema,
} from "@/lib/generated/zod/modelSchema/charactersSchema";
import {
  listResourceQuerySchema,
  makeNamedResourceSchemas,
} from "@/lib/validation/resourceSchemas";
import { z } from "zod";

const CharacterSchemas = makeNamedResourceSchemas({
  optionalDefaults: charactersOptionalDefaultsSchema,
  partial: charactersPartialSchema,
});

const listCharactersQuerySchema = listResourceQuerySchema.extend({
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
});

/**
 * GET /api/campaigns/[id]/characters
 * List characters for a campaign with pagination and filters
 */
export const GET = campaignRoute(async ({ ctx, query }) => {
  // Parse and validate query params
  const parsedQuery = listCharactersQuerySchema.parse({
    page: query.get("page") || "1",
    limit: query.get("limit") || "20",
    search: query.get("search") || undefined,
    type: query.get("type") || undefined,
    isPrivate: query.get("isPrivate") || undefined,
    sortBy: query.get("sortBy") || "name",
    sortOrder: query.get("sortOrder") || "asc",
  });

  return await characterService.list(ctx, parsedQuery);
});

/**
 * POST /api/campaigns/[id]/characters
 * Create a new character
 */
export const POST = campaignRoute(
  async ({ ctx, body }) => {
    return await characterService.create(ctx, body as any);
  },
  { bodySchema: CharacterSchemas.create }
);
