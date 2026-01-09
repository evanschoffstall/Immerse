import { prisma } from "@/lib/data/prisma";
import { ResourceOperations } from "@/lib/data/resources/operations";
import { resourceRegistry } from "@/lib/data/resources/registry";
import { ValidationFactory } from "@/lib/validation/factory";
import { z } from "zod";

/**
 * Beings resource operations - configured with Prisma model
 * This configuration lives in /lib/ to keep data access centralized
 */
export const beingsResource = new ResourceOperations({
  tableName: "beings",
  prismaModel: prisma.beings,
});

// Define being schema
const beingSchema = z.object({
  name: z.string().trim().min(1),
  title: z.string().optional(),
  type: z.string().optional(),
  age: z.string().optional(),
  sex: z.string().optional(),
  pronouns: z.string().optional(),
  location: z.string().optional(),
  family: z.string().optional(),
  description: z.string().optional(),
  imageId: z.string().optional(),
  isPrivate: z.boolean().default(false),
  birthCalendarId: z.string().optional(),
  birthDate: z.string().optional(),
});

// Generate schemas using factory
const schemas = ValidationFactory.createSchemas({
  modelName: "beings",
  baseSchema: beingSchema,
});

// Create list schema
const listSchema = ValidationFactory.createListSchema();

// Register with global registry
resourceRegistry.register(
  "beings",
  {
    resource: beingsResource,
    schemas: {
      create: schemas.create,
      update: schemas.update,
      list: listSchema,
    },
    resourceName: "beings",
    requireAuth: true,
  },
  "Character and NPC management for campaigns"
);

// Export schemas for use in features if needed
export { schemas as beingSchemas };
