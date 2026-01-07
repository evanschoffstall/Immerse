import type { CampaignContext } from "@/features/campaigns";
import { CampaignResource, requireResource } from "@/features/campaigns/base/resource";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

export const createOrganisationSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export const updateOrganisationSchema = createOrganisationSchema.partial();

export const listOrganisationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  location: z.string().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateOrganisation = z.infer<typeof createOrganisationSchema>;
export type UpdateOrganisation = z.infer<typeof updateOrganisationSchema>;
export type ListOrganisationsQuery = z.infer<typeof listOrganisationsSchema>;

export const OrganisationSchemas = {
  create: createOrganisationSchema,
  update: updateOrganisationSchema,
};

// ============================================================================
// RESOURCE
// ============================================================================

const organisationInclude = {
  users: { select: { id: true, name: true, email: true } },
} satisfies Prisma.organisationsInclude;

class Organisations extends CampaignResource {
  constructor() {
    super("organisations", organisationInclude);
  }

  async list(campaignId: string, query: ListOrganisationsQuery) {
    const { type, isPrivate, location, ...baseQuery } = query;
    const where: any = {};
    if (type) where.type = type;
    if (isPrivate !== undefined) where.isPrivate = isPrivate;
    if (location) where.location = location;

    const result = await super.list(campaignId, { ...baseQuery, where });
    return { organisations: result.items, pagination: result.pagination };
  }

  async getOne(ctx: CampaignContext, id: string) {
    const organisation = await this.get(id, ctx.campaign.id);
    return { organisation: await requireResource(organisation) };
  }

  async createOne(ctx: CampaignContext, data: CreateOrganisation) {
    const organisation = await this.create(ctx.campaign.id, ctx.session.user.id, data);
    return { organisation };
  }

  async updateOne(ctx: CampaignContext, id: string, data: UpdateOrganisation) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    const organisation = await this.update(id, ctx.campaign.id, data);
    return { organisation };
  }

  async deleteOne(ctx: CampaignContext, id: string) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    await this.delete(id, ctx.campaign.id);
    return { success: true };
  }
}

export const organisations = new Organisations();
export const organisationService = organisations;
export const listOrganisationsQuerySchema = listOrganisationsSchema;
