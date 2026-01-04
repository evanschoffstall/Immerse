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

// In-file Zod schema for locations based on Prisma model
const locationsOptionalDefaultsSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  parentId: z.string().optional(),
  description: z.string().optional(),
  imageId: z.string().optional(),
  mapImage: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

const locationsPartialSchema = locationsOptionalDefaultsSchema.partial();

export const LocationSchemas = makeNamedResourceSchemas({
  optionalDefaults: locationsOptionalDefaultsSchema,
  partial: locationsPartialSchema,
});

export const listLocationsQuerySchema = listResourceQuerySchema.extend({
  type: z.string().optional(),
  isPrivate: z.coerce.boolean().optional(),
  parentId: z.string().optional(),
});

export type CreateLocationInput = z.infer<typeof LocationSchemas.create>;
export type UpdateLocationInput = z.infer<typeof LocationSchemas.update>;
export type ListLocationsQuery = z.infer<typeof listLocationsQuerySchema>;

// ============================================================================
// REPOSITORY
// ============================================================================

const locationInclude = {
  users: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  images: {
    select: {
      id: true,
      name: true,
      ext: true,
    },
  },
  locations: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.locationsInclude;

class LocationRepository extends CampaignResourceRepository<
  any,
  typeof locationInclude,
  CreateLocationInput,
  UpdateLocationInput,
  ListLocationsQuery
> {
  constructor() {
    super("locations" as Prisma.ModelName, locationInclude);
  }

  protected buildSearchFilters(search: string): any[] {
    return [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { type: { contains: search, mode: "insensitive" } },
    ];
  }

  protected buildCustomFilters(query: ListLocationsQuery): any {
    const filters: any = {};
    if (query.type) filters.type = query.type;
    if (query.isPrivate !== undefined) filters.isPrivate = query.isPrivate;
    if (query.parentId) filters.parentId = query.parentId;
    return filters;
  }

  async findMany(campaignId: string, query: ListLocationsQuery) {
    const { items, total } = await super.findMany(campaignId, query);
    return { items, total };
  }
}

// ============================================================================
// SERVICE
// ============================================================================

class LocationService extends CampaignResourceService<
  any,
  LocationRepository,
  CreateLocationInput,
  UpdateLocationInput,
  ListLocationsQuery
> {
  constructor() {
    super(new LocationRepository(), "location");
  }

  protected get pluralResourceName(): string {
    return "locations";
  }

  protected async validateCreate(
    ctx: CampaignContext,
    data: CreateLocationInput
  ): Promise<void> {
    // Add custom validation if needed
    // e.g., verify parentId exists in campaign
  }

  protected async validateUpdate(
    ctx: CampaignContext,
    id: string,
    data: UpdateLocationInput
  ): Promise<void> {
    // Add custom validation if needed
  }

  protected async validateDelete(
    ctx: CampaignContext,
    id: string
  ): Promise<void> {
    // Check if location has children
    const children = await this.repository.findMany(ctx.campaign.id, {
      page: 1,
      limit: 1,
      parentId: id,
      sortBy: "name",
      sortOrder: "asc",
    });

    if (children.total > 0) {
      throw new Error("LOCATION_HAS_CHILDREN");
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const locationRepo = new LocationRepository();
export const locationService = new LocationService();
export { locationRepo };
