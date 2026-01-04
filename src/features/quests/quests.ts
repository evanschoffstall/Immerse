import { CampaignResourceRepository } from "@/features/base/CampaignResourceRepository";
import { CampaignResourceService } from "@/features/base/CampaignResourceService";
import type { CampaignContext } from "@/features/campaigns";
import {
  questsOptionalDefaultsSchema,
  questsPartialSchema,
} from "@/lib/generated/zod/modelSchema/questsSchema";
import {
  listResourceQuerySchema,
  makeNamedResourceSchemas,
} from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

export const QuestSchemas = makeNamedResourceSchemas({
  optionalDefaults: questsOptionalDefaultsSchema,
  partial: questsPartialSchema,
});

export const listQuestsQuerySchema = listResourceQuerySchema.extend({
  type: z.string().optional(),
  status: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
});

export type CreateQuestInput = z.infer<typeof QuestSchemas.create>;
export type UpdateQuestInput = z.infer<typeof QuestSchemas.update>;
export type ListQuestsQuery = z.infer<typeof listQuestsQuerySchema>;

// ============================================================================
// REPOSITORY
// ============================================================================

const questInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.questsInclude;

class QuestRepository extends CampaignResourceRepository<
  any,
  typeof questInclude,
  CreateQuestInput,
  UpdateQuestInput,
  ListQuestsQuery
> {
  constructor() {
    super("quests" as Prisma.ModelName, questInclude);
  }

  protected buildSearchFilters(search: string): any[] {
    return [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { type: { contains: search, mode: "insensitive" } },
    ];
  }

  protected buildCustomFilters(query: ListQuestsQuery): any {
    const filters: any = {};
    if (query.type) filters.type = query.type;
    if (query.status) filters.status = query.status;
    if (query.isPrivate !== undefined) filters.isPrivate = query.isPrivate;
    return filters;
  }

  async findMany(campaignId: string, query: ListQuestsQuery) {
    const { items, total } = await super.findMany(campaignId, query);
    return { items, total };
  }

  /**
   * Find quests by status
   */
  async findByStatus(campaignId: string, status: string) {
    return this.model.findMany({
      where: { campaignId, status },
      include: this.include,
      orderBy: { updatedAt: "desc" },
    });
  }
}

// ============================================================================
// SERVICE
// ============================================================================

class QuestService extends CampaignResourceService<
  any,
  QuestRepository,
  CreateQuestInput,
  UpdateQuestInput,
  ListQuestsQuery
> {
  constructor() {
    super(new QuestRepository(), "quest");
  }

  protected get pluralResourceName(): string {
    return "quests";
  }

  protected async validateCreate(
    ctx: CampaignContext,
    data: CreateQuestInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateUpdate(
    ctx: CampaignContext,
    id: string,
    data: UpdateQuestInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateDelete(
    ctx: CampaignContext,
    id: string
  ): Promise<void> {
    // Add custom validation if needed
  }

  /**
   * Get active quests for a campaign
   */
  async getActiveQuests(ctx: CampaignContext) {
    const quests = await (this.repository as QuestRepository).findByStatus(
      ctx.campaign.id,
      "active"
    );
    return { quests };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const questRepo = new QuestRepository();
export const questService = new QuestService();
export { questRepo };
