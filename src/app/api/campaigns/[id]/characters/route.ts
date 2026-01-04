import { campaignRoute } from "@/lib/api/route-helpers";
import {
  CharacterSchemas,
  characterService,
  listCharactersQuerySchema,
} from "@/lib/features/characters";

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
