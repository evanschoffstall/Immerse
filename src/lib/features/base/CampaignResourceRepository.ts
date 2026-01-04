import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Base query interface for listing resources
 */
export interface BaseListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

/**
 * Base repository class for campaign-scoped resources
 * Provides standard CRUD operations with hooks for customization
 */
export abstract class CampaignResourceRepository<
  TModel extends { id: string; campaignId: string; slug: string; name: string },
  TInclude extends
    | Prisma.CharactersInclude
    | Prisma.LocationsInclude
    | Record<string, any>,
  TCreateInput,
  TUpdateInput,
  TQuery extends BaseListQuery
> {
  constructor(
    protected modelName: Prisma.ModelName,
    protected include: TInclude
  ) {}

  /**
   * Get the Prisma model delegate (e.g., prisma.characters)
   */
  protected get model() {
    return (prisma as any)[this.modelName];
  }

  /**
   * Find many resources with filters and pagination
   */
  async findMany(campaignId: string, query: TQuery) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(campaignId, query);
    const orderBy = { [sortBy]: sortOrder };

    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        include: this.include,
        orderBy,
        skip,
        take: limit,
      }),
      this.model.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Find a single resource by ID
   */
  async findById(id: string, campaignId: string): Promise<TModel | null> {
    return this.model.findFirst({
      where: { id, campaignId },
      include: this.include,
    });
  }

  /**
   * Find a single resource by slug
   */
  async findBySlug(slug: string, campaignId: string): Promise<TModel | null> {
    return this.model.findFirst({
      where: { slug, campaignId },
      include: this.include,
    });
  }

  /**
   * Create a new resource
   */
  async create(
    campaignId: string,
    createdById: string,
    data: TCreateInput
  ): Promise<TModel> {
    const slug = this.generateSlug((data as any).name);

    return this.model.create({
      data: {
        ...data,
        campaignId,
        createdById,
        slug,
      },
      include: this.include,
    });
  }

  /**
   * Update an existing resource
   */
  async update(
    id: string,
    campaignId: string,
    data: TUpdateInput
  ): Promise<TModel> {
    // Update slug if name changed
    const updateData: any = { ...data };
    if ((data as any).name) {
      updateData.slug = this.generateSlug((data as any).name);
    }

    return this.model.update({
      where: { id, campaignId },
      data: updateData,
      include: this.include,
    });
  }

  /**
   * Delete a resource
   */
  async delete(id: string, campaignId: string): Promise<void> {
    await this.model.delete({
      where: { id, campaignId },
    });
  }

  /**
   * Count resources in a campaign
   */
  async count(campaignId: string): Promise<number> {
    return this.model.count({
      where: { campaignId },
    });
  }

  /**
   * Find recently created resources
   */
  async findRecent(campaignId: string, limit: number = 5): Promise<TModel[]> {
    return this.model.findMany({
      where: { campaignId },
      include: this.include,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Build the WHERE clause for queries
   * Override this method to add resource-specific filters
   */
  protected buildWhereClause(
    campaignId: string,
    query: TQuery
  ): Prisma.CharactersWhereInput | Prisma.LocationsWhereInput | any {
    const { search } = query;

    const where: any = {
      campaignId,
    };

    // Add search filtering if provided
    if (search) {
      where.OR = this.buildSearchFilters(search);
    }

    // Add custom filters from subclass
    Object.assign(where, this.buildCustomFilters(query));

    return where;
  }

  /**
   * Build search filters for the resource
   * Override to customize which fields are searchable
   */
  protected buildSearchFilters(search: string): any[] {
    return [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  /**
   * Build custom filters specific to the resource
   * Override to add resource-specific query filters
   */
  protected buildCustomFilters(query: TQuery): any {
    return {};
  }

  /**
   * Generate a URL-friendly slug from a name
   */
  protected generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
