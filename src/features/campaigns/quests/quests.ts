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

export const createQuestSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export const updateQuestSchema = createQuestSchema.partial();

export const listQuestsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateQuest = z.infer<typeof createQuestSchema>;
export type UpdateQuest = z.infer<typeof updateQuestSchema>;
export type ListQuestsQuery = z.infer<typeof listQuestsSchema>;

export const QuestSchemas = {
  create: createQuestSchema,
  update: updateQuestSchema,
};

// ============================================================================
// RESOURCE
// ============================================================================

const questInclude = {} satisfies Prisma.questsInclude;

class Quests extends CampaignResource {
  constructor() {
    super("quests", questInclude);
  }

  async list(campaignId: string, query: ListQuestsQuery) {
    const { type, status, isPrivate, ...baseQuery } = query;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (isPrivate !== undefined) where.isPrivate = isPrivate;

    const result = await super.list(campaignId, { ...baseQuery, where });
    return { quests: result.items, pagination: result.pagination };
  }

  async getOne(ctx: CampaignContext, id: string) {
    const quest = await this.get(id, ctx.campaign.id);
    return { quest: await requireResource(quest) };
  }

  async createOne(ctx: CampaignContext, data: CreateQuest) {
    const quest = await this.create(ctx.campaign.id, ctx.session.user.id, data);
    return { quest };
  }

  async updateOne(ctx: CampaignContext, id: string, data: UpdateQuest) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    const quest = await this.update(id, ctx.campaign.id, data);
    return { quest };
  }

  async deleteOne(ctx: CampaignContext, id: string) {
    const existing = await this.get(id, ctx.campaign.id);
    await requireResource(existing);
    await this.delete(id, ctx.campaign.id);
    return { success: true };
  }

  async getByStatus(campaignId: string, status: string) {
    return this.db.findMany({
      where: { campaignId, status },
      include: this.include,
      orderBy: { updatedAt: "desc" },
    });
  }
}

export const quests = new Quests();
export const questService = quests;
export const listQuestsQuerySchema = listQuestsSchema;
