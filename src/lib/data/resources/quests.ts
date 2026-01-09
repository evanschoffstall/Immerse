import { prisma } from "@/lib/data/prisma";
import { ResourceOperations } from "@/lib/data/resources/operations";
import { resourceRegistry } from "@/lib/data/resources/registry";
import { ValidationFactory } from "@/lib/validation/factory";
import { z } from "zod";

/**
 * Quests resource operations - configured with Prisma model
 * This configuration lives in /lib/ to keep data access centralized
 */
export const questsResource = new ResourceOperations({
  tableName: "quests",
  prismaModel: prisma.quests,
});

// Define quest schema
const questSchema = z.object({
  name: z.string().trim().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  location: z.string().optional(),
  status: z.string().default("active"),
  isPrivate: z.boolean().default(false),
});

// Generate schemas using factory
const schemas = ValidationFactory.createSchemas({
  modelName: "quests",
  baseSchema: questSchema,
});

// Create list schema
const listSchema = ValidationFactory.createListSchema();

// Register with global registry
resourceRegistry.register(
  "quests",
  {
    resource: questsResource,
    schemas: {
      create: schemas.create,
      update: schemas.update,
      list: listSchema,
    },
    resourceName: "quests",
    requireAuth: true,
  },
  "Quest and adventure management for campaigns"
);

// Export schemas for use in features if needed
export { schemas as questSchemas };
