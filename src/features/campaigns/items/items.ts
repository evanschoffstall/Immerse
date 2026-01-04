import type { CampaignContext } from "@/features/campaigns";
import { CampaignResourceRepository } from "@/features/campaigns/base/CampaignResourceRepository";
import { CampaignResourceService } from "@/features/campaigns/base/CampaignResourceService";
import {
  listResourceQuerySchema,
  makeNamedResourceSchemas,
} from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

// In-file Zod schema for items based on Prisma model
const itemsOptionalDefaultsSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  location: z.string().optional(),
  character: z.string().optional(),
  price: z.string().optional(),
  size: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

const itemsPartialSchema = itemsOptionalDefaultsSchema.partial();

export const ItemSchemas = makeNamedResourceSchemas({
  optionalDefaults: itemsOptionalDefaultsSchema,
  partial: itemsPartialSchema,
});

export const listItemsQuerySchema = listResourceQuerySchema.extend({
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  character: z.string().optional(),
  location: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof ItemSchemas.create>;
export type UpdateItemInput = z.infer<typeof ItemSchemas.update>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;

// ============================================================================
// REPOSITORY
// ============================================================================

const itemInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.itemsInclude;

class ItemRepository extends CampaignResourceRepository<
  any,
  typeof itemInclude,
  CreateItemInput,
  UpdateItemInput,
  ListItemsQuery
> {
  constructor() {
    super("items" as Prisma.ModelName, itemInclude);
  }

  protected buildSearchFilters(search: string): any[] {
    return [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { type: { contains: search, mode: "insensitive" } },
    ];
  }

  protected buildCustomFilters(query: ListItemsQuery): any {
    const filters: any = {};
    if (query.type) filters.type = query.type;
    if (query.isPrivate !== undefined) filters.isPrivate = query.isPrivate;
    if (query.character) filters.character = query.character;
    if (query.location) filters.location = query.location;
    return filters;
  }

  async findMany(campaignId: string, query: ListItemsQuery) {
    const { items, total } = await super.findMany(campaignId, query);
    return { items, total };
  }
}

// ============================================================================
// SERVICE
// ============================================================================

class ItemService extends CampaignResourceService<
  any,
  ItemRepository,
  CreateItemInput,
  UpdateItemInput,
  ListItemsQuery
> {
  constructor() {
    super(new ItemRepository(), "item");
  }

  protected get pluralResourceName(): string {
    return "items";
  }

  protected async validateCreate(
    ctx: CampaignContext,
    data: CreateItemInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateUpdate(
    ctx: CampaignContext,
    id: string,
    data: UpdateItemInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateDelete(
    ctx: CampaignContext,
    id: string
  ): Promise<void> {
    // Add custom validation if needed
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const itemRepo = new ItemRepository();
export const itemService = new ItemService();
export { itemRepo };
