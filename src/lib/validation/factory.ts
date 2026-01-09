import { z, ZodSchema } from "zod";

/**
 * Validation configuration
 */
interface ValidationConfig {
  modelName: string;
  baseSchema: z.ZodObject<any>;
  serverManagedFields?: string[];
  requireName?: boolean;
  customValidations?: {
    create?: (schema: z.ZodObject<any>) => z.ZodSchema;
    update?: (schema: z.ZodObject<any>) => z.ZodSchema;
  };
}

/**
 * Unified validation factory
 * Creates consistent create/update schemas for all resources
 * Eliminates repetitive schema definitions across the codebase
 */
export class ValidationFactory {
  private static readonly DEFAULT_SERVER_MANAGED = [
    "id",
    "slug",
    "campaignId",
    "createdById",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ];

  /**
   * Create standard create/update schemas
   */
  static createSchemas(config: ValidationConfig) {
    const {
      baseSchema,
      serverManagedFields = this.DEFAULT_SERVER_MANAGED,
      requireName = true,
      customValidations,
    } = config;

    // Remove server-managed fields
    const cleanSchema = this.omitFields(baseSchema, serverManagedFields);

    // Create schema
    let createSchema = cleanSchema;
    if (requireName) {
      createSchema = cleanSchema.merge(
        z.object({
          name: z.string().trim().min(1, "Name is required"),
        })
      );
    }
    createSchema = createSchema.strict();

    // Update schema (all fields optional + at least one required)
    let updateSchema = cleanSchema
      .partial()
      .merge(
        requireName
          ? z.object({
              name: z.string().trim().min(1).optional(),
            })
          : z.object({})
      )
      .strict()
      .refine((obj: any) => Object.keys(obj).length > 0, {
        message: "At least one field is required",
      });

    // Apply custom validations
    if (customValidations?.create) {
      createSchema = customValidations.create(createSchema as any) as any;
    }
    if (customValidations?.update) {
      updateSchema = customValidations.update(updateSchema as any) as any;
    }

    return {
      create: createSchema,
      update: updateSchema,
    };
  }

  /**
   * Remove specified fields from schema
   */
  private static omitFields(
    schema: z.ZodObject<any>,
    fields: string[]
  ): z.ZodObject<any> {
    const shape = { ...schema.shape };
    fields.forEach((field) => delete shape[field]);
    return z.object(shape);
  }

  /**
   * Create standard list query schema
   */
  static createListSchema(additionalFields?: z.ZodRawShape) {
    return z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
      search: z.string().optional(),
      sortBy: z.string().default("name"),
      sortOrder: z.enum(["asc", "desc"]).default("asc"),
      ...additionalFields,
    });
  }
}

/**
 * Quick helper for standard resource schemas
 */
export function createResourceSchemas(
  baseSchema: z.ZodObject<any>,
  options?: Partial<ValidationConfig>
) {
  return ValidationFactory.createSchemas({
    modelName: "resource",
    baseSchema,
    ...options,
  });
}

/**
 * Export for convenience
 */
export const createListSchema = ValidationFactory.createListSchema;
