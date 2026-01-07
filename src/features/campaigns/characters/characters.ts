import type { CampaignContext } from "@/features/campaigns";
import {
  CampaignResource,
  requireResource,
} from "@/features/campaigns/base/resource";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

export const createCharacterSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  type: z.string().optional(),
  age: z.string().optional(),
  sex: z.string().optional(),
  pronouns: z.string().optional(),
  location: z.string().optional(),
  family: z.string().optional(),
  description: z.string().optional(),
  imageId: z.string().optional(),
  isPrivate: z.boolean().optional(),
  birthCalendarId: z.string().optional(),
  birthDate: z.string().optional(),
});

export const updateCharacterSchema = createCharacterSchema.partial();

export const listCharactersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateCharacter = z.infer<typeof createCharacterSchema>;
export type UpdateCharacter = z.infer<typeof updateCharacterSchema>;
export type ListCharactersQuery = z.infer<typeof listCharactersSchema>;

// For backward compatibility
export const CharacterSchemas = {
  create: createCharacterSchema,
  update: updateCharacterSchema,
};

// ============================================================================
// RESOURCE
// ============================================================================

const characterInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  images: {
    select: {
      id: true,
      name: true,
      ext: true,
    },
  },
  calendars: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.charactersInclude;

class Characters extends CampaignResource {
  constructor() {
    super("characters", characterInclude);
  }

  async list(campaignId: string, query: ListCharactersQuery) {
    const { type, isPrivate, ...baseQuery } = query;

    const where: any = {};
    if (type) where.type = type;
    if (isPrivate !== undefined) where.isPrivate = isPrivate;

    const result = await super.list(campaignId, {
      ...baseQuery,
      where,
    });

    // Custom search for characters (include title field)
    if (query.search) {
      const where: any = { campaignId };
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { title: { contains: query.search, mode: "insensitive" } },
      ];
      if (type) where.type = type;
      if (isPrivate !== undefined) where.isPrivate = isPrivate;

      const [items, total] = await Promise.all([
        this.db.findMany({
          where,
          include: this.include,
          orderBy: { [query.sortBy]: query.sortOrder },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        this.db.count({ where }),
      ]);

      return {
        characters: items,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
          hasNext: query.page * query.limit < total,
          hasPrev: query.page > 1,
        },
      };
    }

    return {
      characters: result.items,
      pagination: result.pagination,
    };
  }

  async getOne(ctx: CampaignContext, id: string) {
    const character = await this.get(id, ctx.campaign.id);
    return { character: await requireResource(character) };
  }

  async createOne(ctx: CampaignContext, data: CreateCharacter) {
    const character = await this.create(
      ctx.campaign.id,
      ctx.session.user.id,
      data
    );
    return { character };
  }

  async updateOne(ctx: CampaignContext, id: string, data: UpdateCharacter) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    const character = await this.update(id, ctx.campaign.id, data);
    return { character };
  }

  async deleteOne(ctx: CampaignContext, id: string) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    await this.delete(id, ctx.campaign.id);
    return { success: true };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const characters = new Characters();

// Backward compatibility
export const characterService = characters;
export const listCharactersQuerySchema = listCharactersSchema;
