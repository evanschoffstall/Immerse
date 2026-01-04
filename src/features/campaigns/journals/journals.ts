import { CampaignResourceRepository } from "@/features/base/CampaignResourceRepository";
import { CampaignResourceService } from "@/features/base/CampaignResourceService";
import type { CampaignContext } from "@/features/campaigns";
import {
  journalsOptionalDefaultsSchema,
  journalsPartialSchema,
} from "@/lib/generated/zod/modelSchema/journalsSchema";
import {
  listResourceQuerySchema,
  makeNamedResourceSchemas,
} from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// SCHEMAS
// ============================================================================

export const JournalsSchemas = makeNamedResourceSchemas({
  optionalDefaults: journalsOptionalDefaultsSchema,
  partial: journalsPartialSchema,
});

export const listJournalssQuerySchema = listResourceQuerySchema.extend({
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  // Add resource-specific filters here
});

export type CreateJournalsInput = z.infer<typeof JournalsSchemas.create>;
export type UpdateJournalsInput = z.infer<typeof JournalsSchemas.update>;
export type ListJournalssQuery = z.infer<typeof listJournalssQuerySchema>;

// ============================================================================
// REPOSITORY
// ============================================================================

const journalsInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  // Add additional relations here
} satisfies Prisma.journalsInclude;

class JournalsRepository extends CampaignResourceRepository<
  any,
  typeof journalsInclude,
  CreateJournalsInput,
  UpdateJournalsInput,
  ListJournalssQuery
> {
  constructor() {
    super("journals" as Prisma.ModelName, journalsInclude);
  }

  protected buildSearchFilters(search: string): any[] {
    return [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { type: { contains: search, mode: "insensitive" } },
    ];
  }

  protected buildCustomFilters(query: ListJournalssQuery): any {
    const filters: any = {};
    if (query.type) filters.type = query.type;
    if (query.isPrivate !== undefined) filters.isPrivate = query.isPrivate;
    // Add resource-specific filters here
    return filters;
  }

  async findMany(campaignId: string, query: ListJournalssQuery) {
    const { items, total } = await super.findMany(campaignId, query);
    return { items, total };
  }

  // Add resource-specific repository methods here
}

// ============================================================================
// SERVICE
// ============================================================================

class JournalsService extends CampaignResourceService<
  any,
  JournalsRepository,
  CreateJournalsInput,
  UpdateJournalsInput,
  ListJournalssQuery
> {
  constructor() {
    super(new JournalsRepository(), "journals");
  }

  protected get pluralResourceName(): string {
    return "journalss";
  }

  protected async validateCreate(
    ctx: CampaignContext,
    data: CreateJournalsInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateUpdate(
    ctx: CampaignContext,
    id: string,
    data: UpdateJournalsInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateDelete(
    ctx: CampaignContext,
    id: string
  ): Promise<void> {
    // Add custom validation if needed
  }

  // Add resource-specific service methods here
}

// ============================================================================
// EXPORTS
// ============================================================================

const journalsRepo = new JournalsRepository();
export const journalsService = new JournalsService();
export { journalsRepo };
