import {
  charactersOptionalDefaultsSchema,
  charactersPartialSchema,
} from "@/lib/generated/zod/modelSchema/charactersSchema";
import {
  listResourceQuerySchema,
  makeNamedResourceSchemas,
} from "@/lib/validation/resourceSchemas";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { CampaignResourceRepository } from "./base/CampaignResourceRepository";
import { CampaignResourceService } from "./base/CampaignResourceService";
import type { CampaignContext } from "./campaigns";

// ============================================================================
// SCHEMAS
// ============================================================================

export const CharacterSchemas = makeNamedResourceSchemas({
  optionalDefaults: charactersOptionalDefaultsSchema,
  partial: charactersPartialSchema,
});

export const listCharactersQuerySchema = listResourceQuerySchema.extend({
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
});

export type CreateCharacterInput = z.infer<typeof CharacterSchemas.create>;
export type UpdateCharacterInput = z.infer<typeof CharacterSchemas.update>;
export type ListCharactersQuery = z.infer<typeof listCharactersQuerySchema>;

// ============================================================================
// REPOSITORY
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

class CharacterRepository extends CampaignResourceRepository<
  any,
  typeof characterInclude,
  CreateCharacterInput,
  UpdateCharacterInput,
  ListCharactersQuery
> {
  constructor() {
    super("characters" as Prisma.ModelName, characterInclude);
  }

  protected buildSearchFilters(search: string): any[] {
    return [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
    ];
  }

  protected buildCustomFilters(query: ListCharactersQuery): any {
    const filters: any = {};
    if (query.type) filters.type = query.type;
    if (query.isPrivate !== undefined) filters.isPrivate = query.isPrivate;
    return filters;
  }

  async findMany(campaignId: string, query: ListCharactersQuery) {
    const { items, total } = await super.findMany(campaignId, query);
    return { characters: items, total };
  }
}

// ============================================================================
// SERVICE
// ============================================================================

class CharacterService extends CampaignResourceService<
  any,
  CharacterRepository,
  CreateCharacterInput,
  UpdateCharacterInput,
  ListCharactersQuery
> {
  constructor(repo: CharacterRepository) {
    super(repo, "character");
  }

  protected async validateCreate(
    ctx: CampaignContext,
    data: CreateCharacterInput
  ): Promise<void> {
    // Validate calendar exists if provided
    if (data.birthCalendarId) {
      // Add calendar validation here if needed
    }
    // Validate image exists if provided
    if (data.imageId) {
      // Add image validation here if needed
    }
  }

  protected async validateUpdate(
    ctx: CampaignContext,
    id: string,
    data: UpdateCharacterInput
  ): Promise<void> {
    // Validate calendar exists if provided
    if (data.birthCalendarId) {
      // Add calendar validation here if needed
    }
    // Validate image exists if provided
    if (data.imageId) {
      // Add image validation here if needed
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const characterRepo = new CharacterRepository();
export const characterService = new CharacterService(characterRepo);
export { characterRepo };
