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

export const createLocationSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  parentId: z.string().optional(),
  description: z.string().optional(),
  imageId: z.string().optional(),
  mapImage: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

export const listLocationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  parentId: z.string().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateLocation = z.infer<typeof createLocationSchema>;
export type UpdateLocation = z.infer<typeof updateLocationSchema>;
export type ListLocationsQuery = z.infer<typeof listLocationsSchema>;

export const LocationSchemas = {
  create: createLocationSchema,
  update: updateLocationSchema,
};

// ============================================================================
// RESOURCE
// ============================================================================

const locationInclude = {
  users: { select: { id: true, name: true, email: true } },
  images: { select: { id: true, name: true, ext: true } },
  locations: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.locationsInclude;

class Locations extends CampaignResource {
  constructor() {
    super("locations", locationInclude);
  }

  async list(campaignId: string, query: ListLocationsQuery) {
    const { type, isPrivate, parentId, ...baseQuery } = query;
    const where: any = {};
    if (type) where.type = type;
    if (isPrivate !== undefined) where.isPrivate = isPrivate;
    if (parentId) where.parentId = parentId;

    const result = await super.list(campaignId, { ...baseQuery, where });
    return { locations: result.items, pagination: result.pagination };
  }

  async getOne(ctx: CampaignContext, id: string) {
    const location = await this.get(id, ctx.campaign.id);
    return { location: await requireResource(location) };
  }

  async createOne(ctx: CampaignContext, data: CreateLocation) {
    const location = await this.create(
      ctx.campaign.id,
      ctx.session.user.id,
      data
    );
    return { location };
  }

  async updateOne(ctx: CampaignContext, id: string, data: UpdateLocation) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    const location = await this.update(id, ctx.campaign.id, data);
    return { location };
  }

  async deleteOne(ctx: CampaignContext, id: string) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);

    // Check if location has children
    const childCount = await this.count(ctx.campaign.id, { parentId: id });
    if (childCount > 0) {
      throw new Error("LOCATION_HAS_CHILDREN");
    }

    await this.delete(id, ctx.campaign.id);
    return { success: true };
  }
}

export const locations = new Locations();
export const locationService = locations;
export const listLocationsQuerySchema = listLocationsSchema;
