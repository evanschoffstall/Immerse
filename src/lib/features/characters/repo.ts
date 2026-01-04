import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type {
  CreateCharacterInput,
  ListCharactersQuery,
  UpdateCharacterInput,
} from "./schemas";

/**
 * Standard character include for API responses
 */
const characterInclude = {
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
  calendars: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.charactersInclude;

/**
 * Character repository - handles all database operations for characters
 */
export const characterRepo = {
  /**
   * Find many characters with filters and pagination
   */
  async findMany(campaignId: string, query: ListCharactersQuery) {
    const { page, limit, search, type, isPrivate, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.charactersWhereInput = {
      campaignId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type && { type }),
      ...(isPrivate !== undefined && { isPrivate }),
    };

    const orderBy: Prisma.charactersOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [characters, total] = await Promise.all([
      prisma.characters.findMany({
        where,
        include: characterInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.characters.count({ where }),
    ]);

    return { characters, total };
  },

  /**
   * Find a single character by ID
   */
  async findById(id: string, campaignId: string) {
    return prisma.characters.findFirst({
      where: {
        id,
        campaignId,
      },
      include: characterInclude,
    });
  },

  /**
   * Find a character by slug
   */
  async findBySlug(slug: string, campaignId: string) {
    return prisma.characters.findFirst({
      where: {
        slug,
        campaignId,
      },
      include: characterInclude,
    });
  },

  /**
   * Create a new character
   */
  async create(campaignId: string, userId: string, data: CreateCharacterInput) {
    const slug = generateSlug(data.name);

    // Check if slug already exists
    const existing = await this.findBySlug(slug, campaignId);
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return prisma.characters.create({
      data: {
        ...data,
        slug: finalSlug,
        campaignId,
        createdById: userId,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
      include: characterInclude,
    });
  },

  /**
   * Update a character
   */
  async update(id: string, campaignId: string, data: UpdateCharacterInput) {
    // If name is being updated, regenerate slug
    let slug: string | undefined;
    if (data.name) {
      slug = generateSlug(data.name);

      // Check if new slug conflicts with another character
      const existing = await prisma.characters.findFirst({
        where: {
          slug,
          campaignId,
          NOT: { id },
        },
      });

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    return prisma.characters.update({
      where: { id },
      data: {
        ...data,
        ...(slug && { slug }),
        updatedAt: new Date(),
      },
      include: characterInclude,
    });
  },

  /**
   * Delete a character
   */
  async delete(id: string) {
    return prisma.characters.delete({
      where: { id },
    });
  },

  /**
   * Count characters in a campaign
   */
  async count(campaignId: string) {
    return prisma.characters.count({
      where: { campaignId },
    });
  },

  /**
   * Get recent characters
   */
  async findRecent(campaignId: string, limit = 5) {
    return prisma.characters.findMany({
      where: { campaignId },
      include: characterInclude,
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  },
};

/**
 * Generate a URL-safe slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
