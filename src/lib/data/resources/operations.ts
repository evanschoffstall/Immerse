import { logCreate, logDelete, logUpdate } from "@/lib/utils/audit";
import { buildPaginationMeta } from "@/lib/utils/pagination";

/**
 * Generic resource operations configuration
 */
export interface ResourceOperationsConfig<TModel = any> {
  tableName: string;
  prismaModel: any; // Prisma delegate (e.g., prisma.beings)
  include?: Record<string, any>;
  generateSlug?: (name: string) => string;
}

/**
 * Unified resource operations
 * Eliminates duplication across all resource repositories
 * Provides consistent CRUD operations with built-in audit logging
 */
export class ResourceOperations<TModel = any> {
  constructor(private config: ResourceOperationsConfig<TModel>) {}

  /**
   * List resources with pagination and filtering
   */
  async list(filters: {
    where?: Record<string, any>;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    searchFields?: string[];
  }) {
    const {
      where = {},
      page = 1,
      limit = 20,
      sortBy = "name",
      sortOrder = "asc",
      search,
      searchFields = ["name", "description"],
    } = filters;

    // Build search filter
    const searchFilter = search
      ? {
          OR: searchFields.map((field) => ({
            [field]: { contains: search, mode: "insensitive" as const },
          })),
        }
      : {};

    const whereClause = { ...where, ...searchFilter };

    const [items, total] = await Promise.all([
      this.config.prismaModel.findMany({
        where: whereClause,
        include: this.config.include,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.config.prismaModel.count({ where: whereClause }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get one resource by ID
   */
  async getOne(id: string, include?: Record<string, any>) {
    return this.config.prismaModel.findUnique({
      where: { id },
      include: include || this.config.include,
    });
  }

  /**
   * Get one resource by field
   */
  async getBy(field: string, value: any, include?: Record<string, any>) {
    return this.config.prismaModel.findFirst({
      where: { [field]: value },
      include: include || this.config.include,
    });
  }

  /**
   * Create a new resource
   */
  async create(data: any, metadata?: { userId?: string; campaignId?: string }) {
    const slug =
      data.name && this.config.generateSlug
        ? await this.ensureUniqueSlug(this.config.generateSlug(data.name))
        : undefined;

    const record = await this.config.prismaModel.create({
      data: {
        ...data,
        ...(slug && { slug }),
      },
      include: this.config.include,
    });

    // Audit log
    if (metadata?.userId) {
      await logCreate(
        this.config.tableName,
        record.id,
        data,
        metadata.userId,
        metadata.campaignId
      );
    }

    return record;
  }

  /**
   * Update an existing resource
   */
  async update(
    id: string,
    data: any,
    metadata?: { userId?: string; campaignId?: string }
  ) {
    // Get old data for audit
    const oldData = await this.getOne(id);
    if (!oldData) throw new Error("NOT_FOUND");

    const slug =
      data.name && this.config.generateSlug
        ? await this.ensureUniqueSlug(this.config.generateSlug(data.name), id)
        : undefined;

    const updated = await this.config.prismaModel.update({
      where: { id },
      data: {
        ...data,
        ...(slug && { slug }),
        updatedAt: new Date(),
      },
      include: this.config.include,
    });

    // Audit log
    if (metadata?.userId) {
      await logUpdate(
        this.config.tableName,
        id,
        oldData,
        data,
        metadata.userId,
        metadata.campaignId
      );
    }

    return updated;
  }

  /**
   * Delete a resource (soft delete if deletedAt field exists)
   */
  async delete(
    id: string,
    metadata?: { userId?: string; campaignId?: string }
  ) {
    const oldData = await this.getOne(id);
    if (!oldData) throw new Error("NOT_FOUND");

    // Check if model has deletedAt field for soft delete
    const hasDeletedAt = "deletedAt" in oldData;

    let result;
    if (hasDeletedAt) {
      // Soft delete
      result = await this.config.prismaModel.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } else {
      // Hard delete
      result = await this.config.prismaModel.delete({
        where: { id },
      });
    }

    // Audit log
    if (metadata?.userId) {
      await logDelete(
        this.config.tableName,
        id,
        oldData,
        metadata.userId,
        metadata.campaignId
      );
    }

    return result;
  }

  /**
   * Count resources
   */
  async count(where?: Record<string, any>) {
    return this.config.prismaModel.count({ where });
  }

  /**
   * Ensure unique slug by adding timestamp if needed
   */
  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string
  ): Promise<string> {
    const where: any = { slug: baseSlug };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const existing = await this.config.prismaModel.findFirst({ where });

    if (!existing) return baseSlug;

    // Add timestamp to make unique
    return `${baseSlug}-${Date.now()}`;
  }

  /**
   * Bulk create operations
   */
  async bulkCreate(
    items: any[],
    metadata?: { userId?: string; campaignId?: string }
  ) {
    return Promise.all(items.map((item) => this.create(item, metadata)));
  }

  /**
   * Bulk update operations
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: any }>,
    metadata?: { userId?: string; campaignId?: string }
  ) {
    return Promise.all(
      updates.map(({ id, data }) => this.update(id, data, metadata))
    );
  }

  /**
   * Bulk delete operations
   */
  async bulkDelete(
    ids: string[],
    metadata?: { userId?: string; campaignId?: string }
  ) {
    return Promise.all(ids.map((id) => this.delete(id, metadata)));
  }
}

/**
 * Factory function to create resource operations
 */
export function createResourceOperations<TModel = any>(
  config: ResourceOperationsConfig<TModel>
) {
  return new ResourceOperations<TModel>(config);
}
