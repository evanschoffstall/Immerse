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

// In-file Zod schema for organisations based on Prisma model
const organisationsOptionalDefaultsSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

const organisationsPartialSchema =
  organisationsOptionalDefaultsSchema.partial();

export const OrganisationSchemas = makeNamedResourceSchemas({
  optionalDefaults: organisationsOptionalDefaultsSchema,
  partial: organisationsPartialSchema,
});

export const listOrganisationsQuerySchema = listResourceQuerySchema.extend({
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  location: z.string().optional(),
});

export type CreateOrganisationInput = z.infer<
  typeof OrganisationSchemas.create
>;
export type UpdateOrganisationInput = z.infer<
  typeof OrganisationSchemas.update
>;
export type ListOrganisationsQuery = z.infer<
  typeof listOrganisationsQuerySchema
>;

// ============================================================================
// REPOSITORY
// ============================================================================

const organisationInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.organisationsInclude;

class OrganisationRepository extends CampaignResourceRepository<
  any,
  typeof organisationInclude,
  CreateOrganisationInput,
  UpdateOrganisationInput,
  ListOrganisationsQuery
> {
  constructor() {
    super("organisations" as Prisma.ModelName, organisationInclude);
  }

  protected buildSearchFilters(search: string): any[] {
    return [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { type: { contains: search, mode: "insensitive" } },
    ];
  }

  protected buildCustomFilters(query: ListOrganisationsQuery): any {
    const filters: any = {};
    if (query.type) filters.type = query.type;
    if (query.isPrivate !== undefined) filters.isPrivate = query.isPrivate;
    if (query.location) filters.location = query.location;
    return filters;
  }

  async findMany(campaignId: string, query: ListOrganisationsQuery) {
    const { items, total } = await super.findMany(campaignId, query);
    return { items, total };
  }
}

// ============================================================================
// SERVICE
// ============================================================================

class OrganisationService extends CampaignResourceService<
  any,
  OrganisationRepository,
  CreateOrganisationInput,
  UpdateOrganisationInput,
  ListOrganisationsQuery
> {
  constructor() {
    super(new OrganisationRepository(), "organisation");
  }

  protected get pluralResourceName(): string {
    return "organisations";
  }

  protected async validateCreate(
    ctx: CampaignContext,
    data: CreateOrganisationInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateUpdate(
    ctx: CampaignContext,
    id: string,
    data: UpdateOrganisationInput
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

const organisationRepo = new OrganisationRepository();
export const organisationService = new OrganisationService();
export { organisationRepo };
