import { prisma } from "@/lib/db/prisma";

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
    return this.db.create({
      data: {
        ...data,
        campaignId,
        createdById,
        ...(slug && { slug }),
      },
      include: this.include,
    });
  }

  /** Update */
  async update(
    id: string,
    campaignId: string,
    data: any,
    updatedById?: string
  ) {
    const updateData = { ...data };
    if (data.name) {
      updateData.slug = this.makeSlug(data.name);
    }
    if (updatedById) {
      updateData.updatedById = updatedById;
    }
    return this.db.update({
      where: { id, campaignId },
      data: updateData,
      include: this.include,
    });
  }

  /** Soft delete */
  async delete(id: string, campaignId: string, deletedById?: string) {
    await this.db.update({
      where: { id, campaignId },
      data: {
        deletedAt: new Date(),
        ...(deletedById && { updatedById: deletedById }),
      },
    });
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
