import type { CampaignContext } from "@/features/campaigns";
import type {
  BaseListQuery,
  CampaignResourceRepository,
} from "./CampaignResourceRepository";

/**
 * Standard pagination response
 */
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Base service class for campaign-scoped resources
 * Provides standard business logic and response formatting
 */
export abstract class CampaignResourceService<
  TModel,
  TRepository extends CampaignResourceRepository<any, any, any, any, any>,
  TCreateInput,
  TUpdateInput,
  TQuery extends BaseListQuery
> {
  constructor(
    protected repository: TRepository,
    protected resourceName: string
  ) {}

  /**
   * List resources with pagination and filters
   */
  async list(ctx: CampaignContext, query: TQuery) {
    const { items, total } = await this.repository.findMany(
      ctx.campaign.id,
      query
    );

    return {
      [this.pluralResourceName]: items,
      pagination: this.formatPagination(query, total),
    };
  }

  /**
   * Get a single resource by ID
   */
  async get(ctx: CampaignContext, id: string) {
    const item = await this.repository.findById(id, ctx.campaign.id);

    if (!item) {
      throw new Error("NOT_FOUND");
    }

    return { [this.resourceName]: item };
  }

  /**
   * Get a resource by slug
   */
  async getBySlug(ctx: CampaignContext, slug: string) {
    const item = await this.repository.findBySlug(slug, ctx.campaign.id);

    if (!item) {
      throw new Error("NOT_FOUND");
    }

    return { [this.resourceName]: item };
  }

  /**
   * Create a new resource
   */
  async create(ctx: CampaignContext, data: TCreateInput) {
    // Run pre-create validation hook
    await this.validateCreate(ctx, data);

    const item = await this.repository.create(
      ctx.campaign.id,
      ctx.session.user.id,
      data
    );

    return { [this.resourceName]: item };
  }

  /**
   * Update an existing resource
   */
  async update(ctx: CampaignContext, id: string, data: TUpdateInput) {
    // Verify resource exists
    const existing = await this.repository.findById(id, ctx.campaign.id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    // Run pre-update validation hook
    await this.validateUpdate(ctx, id, data);

    const item = await this.repository.update(id, ctx.campaign.id, data);

    return { [this.resourceName]: item };
  }

  /**
   * Delete a resource
   */
  async delete(ctx: CampaignContext, id: string) {
    // Verify resource exists
    const existing = await this.repository.findById(id, ctx.campaign.id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    // Run pre-delete validation hook
    await this.validateDelete(ctx, id);

    await this.repository.delete(id, ctx.campaign.id);

    return { success: true };
  }

  /**
   * Get resource statistics
   */
  async getStats(ctx: CampaignContext) {
    const [total, recent] = await Promise.all([
      this.repository.count(ctx.campaign.id),
      this.repository.findRecent(ctx.campaign.id, 5),
    ]);

    return {
      total,
      recent,
    };
  }

  /**
   * Format pagination response
   */
  protected formatPagination(query: TQuery, total: number): PaginationResponse {
    return {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
      hasNext: query.page * query.limit < total,
      hasPrev: query.page > 1,
    };
  }

  /**
   * Get plural form of resource name
   */
  protected get pluralResourceName(): string {
    // Simple pluralization - override if needed
    return this.resourceName + "s";
  }

  /**
   * Hook: Validate data before create
   * Override to add resource-specific validation
   */
  protected async validateCreate(
    ctx: CampaignContext,
    data: TCreateInput
  ): Promise<void> {
    // Default: no additional validation
  }

  /**
   * Hook: Validate data before update
   * Override to add resource-specific validation
   */
  protected async validateUpdate(
    ctx: CampaignContext,
    id: string,
    data: TUpdateInput
  ): Promise<void> {
    // Default: no additional validation
  }

  /**
   * Hook: Validate before delete
   * Override to add resource-specific validation (e.g., check dependencies)
   */
  protected async validateDelete(
    ctx: CampaignContext,
    id: string
  ): Promise<void> {
    // Default: no additional validation
  }
}
