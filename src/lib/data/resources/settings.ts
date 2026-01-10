import { prisma } from "@/lib/data/prisma";
import { ValidationFactory } from "@/lib/validation/factory";
import { z } from "zod";
import { ResourceOperations } from "./operations";
import { resourceRegistry } from "./registry";

export const settingsResource = new ResourceOperations({
  tableName: "campaign_settings",
  prismaModel: prisma.campaign_settings,
});

const settingsSchema = z.object({
  bgOpacity: z.number().min(0).max(1).optional(),
  bgBlur: z.number().int().min(0).max(50).optional(),
  bgExpandToSidebar: z.boolean().optional(),
  bgExpandToHeader: z.boolean().optional(),
  headerBgOpacity: z.number().min(0).max(1).optional(),
  headerBlur: z.number().int().min(0).max(50).optional(),
  sidebarBgOpacity: z.number().min(0).max(1).optional(),
  sidebarBlur: z.number().int().min(0).max(50).optional(),
  cardBgOpacity: z.number().min(0).max(1).optional(),
  cardBlur: z.number().int().min(0).max(50).optional(),
});

// Generate schemas using factory
const schemas = ValidationFactory.createSchemas({
  modelName: "campaign_settings",
  baseSchema: settingsSchema,
});

// Create list schema
const listSchema = ValidationFactory.createListSchema();

// Register with global registry
resourceRegistry.register(
  "settings",
  {
    resource: settingsResource,
    schemas: {
      create: schemas.create,
      update: schemas.update,
      list: listSchema,
    },
    resourceName: "settings",
    requireAuth: true,
  },
  "Campaign visual settings and theme configuration"
);

export const SettingsSchemas = {
  ...schemas,
  list: listSchema,
};
