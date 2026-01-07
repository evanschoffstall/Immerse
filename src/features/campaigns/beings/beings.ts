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

export const createBeingSchema = z.object({
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

export const updateBeingSchema = createBeingSchema.partial();

export const listBeingsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateBeing = z.infer<typeof createBeingSchema>;
export type UpdateBeing = z.infer<typeof updateBeingSchema>;
export type ListBeingsQuery = z.infer<typeof listBeingsSchema>;

export const BeingSchemas = {
  create: createBeingSchema,
  update: updateBeingSchema,
};

// ============================================================================
// RESOURCE
// ============================================================================

const beingInclude = {
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
} satisfies Prisma.beingsInclude;

class Beings extends CampaignResource {
  constructor() {
    super("beings", beingInclude);
  }

  async list(campaignId: string, query: ListBeingsQuery) {
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
        beings: items,
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
      beings: result.items,
      pagination: result.pagination,
    };
  }

  async getOne(ctx: CampaignContext, id: string) {
    const being = await this.get(id, ctx.campaign.id);
    return {
      being: await requireResource(being),
    };
  }

  async createOne(ctx: CampaignContext, data: CreateBeing) {
    const being = await this.create(ctx.campaign.id, ctx.session.user.id, data);
    return { being };
  }

  async updateOne(ctx: CampaignContext, id: string, data: UpdateBeing) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    const being = await this.update(
      id,
      ctx.campaign.id,
      data,
      ctx.session.user.id
    );
    return { being };
  }

  async deleteOne(ctx: CampaignContext, id: string) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    await this.delete(id, ctx.campaign.id, ctx.session.user.id);
    return { success: true };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const beings = new Beings();
export const listBeingsQuerySchema = listBeingsSchema;
