import { prisma } from "@/lib/db/prisma";
import { logCreate, logDelete, logUpdate } from "@/lib/utils/audit";

/**
 * Simple base class for campaign resources
 * Handles common CRUD operations with minimal abstraction
 */
export class CampaignResource<TModel = any> {
  constructor(protected tableName: string, protected include?: any) {}

  /** Get prisma model */
  protected get db() {
    return (prisma as any)[this.tableName];
  }

  /** List with pagination and search */
  async list(
    campaignId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      where?: any;
    } = {}
  ): Promise<any> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "name",
      sortOrder = "asc",
      where: customWhere = {},
    } = options;

    const skip = (page - 1) * limit;
    const where: any = { campaignId, deletedAt: null, ...customWhere };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.db.findMany({
        where,
        include: this.include,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.db.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /** Get by ID */
  async get(id: string, campaignId: string) {
    return this.db.findFirst({
      where: { id, campaignId, deletedAt: null },
      include: this.include,
    });
  }

  /** Get by slug */
  async getBySlug(slug: string, campaignId: string) {
    return this.db.findFirst({
      where: { slug, campaignId, deletedAt: null },
      include: this.include,
    });
  }

  /** Create */
  async create(campaignId: string, createdById: string, data: any) {
    const slug = data.name ? this.makeSlug(data.name) : undefined;
    const record = await this.db.create({
      data: {
        ...data,
        campaignId,
        createdById,
        ...(slug && { slug }),
      },
      include: this.include,
    });

    // Log creation
    await logCreate(this.tableName, record.id, data, createdById, campaignId);

    return record;
  }

  /** Update */
  async update(
    id: string,
    campaignId: string,
    data: any,
    updatedById?: string
  ) {
    // Get existing data for diff
    const existing = await this.db.findFirst({
      where: { id, campaignId },
    });

    const updateData = { ...data };
    if (data.name) {
      updateData.slug = this.makeSlug(data.name);
    }
    if (updatedById) {
      updateData.updatedById = updatedById;
    }

    const record = await this.db.update({
      where: { id, campaignId },
      data: updateData,
      include: this.include,
    });

    // Log update with diff
    if (existing && updatedById) {
      await logUpdate(
        this.tableName,
        id,
        existing,
        data,
        updatedById,
        campaignId
      );
    }

    return record;
  }

  /** Soft delete */
  async delete(id: string, campaignId: string, deletedById?: string) {
    // Get existing data for audit log
    const existing = await this.db.findFirst({
      where: { id, campaignId },
    });

    await this.db.update({
      where: { id, campaignId },
      data: {
        deletedAt: new Date(),
        ...(deletedById && { updatedById: deletedById }),
      },
    });

    // Log deletion
    if (existing && deletedById) {
      await logDelete(this.tableName, id, existing, deletedById, campaignId);
    }
  }

  /** Count */
  async count(campaignId: string, where?: any) {
    return this.db.count({
      where: { campaignId, deletedAt: null, ...where },
    });
  }

  /** Generate slug from name */
  protected makeSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

/** Helper to validate resource exists */
export async function requireResource<T>(
  resource: T | null,
  message = "Resource not found"
): Promise<T> {
  if (!resource) {
    throw new Error("NOT_FOUND");
  }
  return resource;
}
