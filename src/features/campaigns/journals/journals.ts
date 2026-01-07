import type { CampaignContext } from "@/features/campaigns";
import { CampaignResource, requireResource } from "@/features/campaigns/base/resource";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

export const createJournalSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export const updateJournalSchema = createJournalSchema.partial();

export const listJournalsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateJournal = z.infer<typeof createJournalSchema>;
export type UpdateJournal = z.infer<typeof updateJournalSchema>;
export type ListJournalsQuery = z.infer<typeof listJournalsSchema>;

export const JournalsSchemas = {
  create: createJournalSchema,
  update: updateJournalSchema,
};

// ============================================================================
// RESOURCE
// ============================================================================

const journalsInclude = {
  users: { select: { id: true, name: true, email: true } },
} satisfies Prisma.journalsInclude;

class Journals extends CampaignResource {
  constructor() {
    super("journals", journalsInclude);
  }

  async list(campaignId: string, query: ListJournalsQuery) {
    const { type, isPrivate, ...baseQuery } = query;
    const where: any = {};
    if (type) where.type = type;
    if (isPrivate !== undefined) where.isPrivate = isPrivate;

    const result = await super.list(campaignId, { ...baseQuery, where });
    return { journals: result.items, pagination: result.pagination };
  }

  async getOne(ctx: CampaignContext, id: string) {
    const journal = await this.get(id, ctx.campaign.id);
    return { journal: await requireResource(journal) };
  }

  async createOne(ctx: CampaignContext, data: CreateJournal) {
    const journal = await this.create(ctx.campaign.id, ctx.session.user.id, data);
    return { journal };
  }

  async updateOne(ctx: CampaignContext, id: string, data: UpdateJournal) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    const journal = await this.update(id, ctx.campaign.id, data);
    return { journal };
  }

  async deleteOne(ctx: CampaignContext, id: string) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    await this.delete(id, ctx.campaign.id);
    return { success: true };
  }
}

export const journals = new Journals();
export const journalsService = journals;
export const listJournalssQuerySchema = listJournalsSchema;
