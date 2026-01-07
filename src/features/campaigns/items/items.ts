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

export const createItemSchema = z.object({
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

export const updateItemSchema = createItemSchema.partial();

export const listItemsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  character: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateItem = z.infer<typeof createItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsSchema>;

export const ItemSchemas = {
  create: createItemSchema,
  update: updateItemSchema,
};

// ============================================================================
// RESOURCE
// ============================================================================

const itemInclude = {
  users: { select: { id: true, name: true, email: true } },
} satisfies Prisma.itemsInclude;

class Items extends CampaignResource {
  constructor() {
    super("items", itemInclude);
  }

  async list(campaignId: string, query: ListItemsQuery) {
    const { type, isPrivate, character, location, ...baseQuery } = query;
    const where: any = {};
    if (type) where.type = type;
    if (isPrivate !== undefined) where.isPrivate = isPrivate;
    if (character) where.character = character;
    if (location) where.location = location;

    const result = await super.list(campaignId, { ...baseQuery, where });
    return { items: result.items, pagination: result.pagination };
  }

  async getOne(ctx: CampaignContext, id: string) {
    const item = await this.get(id, ctx.campaign.id);
    return { item: await requireResource(item) };
  }

  async createOne(ctx: CampaignContext, data: CreateItem) {
    const item = await this.create(ctx.campaign.id, ctx.session.user.id, data);
    return { item };
  }

  async updateOne(ctx: CampaignContext, id: string, data: UpdateItem) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    const item = await this.update(id, ctx.campaign.id, data);
    return { item };
  }

  async deleteOne(ctx: CampaignContext, id: string) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    await this.delete(id, ctx.campaign.id);
    return { success: true };
  }
}

export const items = new Items();
export const itemService = items;
export const listItemsQuerySchema = listItemsSchema;
