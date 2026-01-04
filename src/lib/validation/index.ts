import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelSchemas = {
  optionalDefaults: z.ZodObject<any>;
  partial: z.ZodObject<any>;
};

// shared "server managed" fields for *all* campaign resources
const SERVER_MANAGED = [
  "id",
  "slug",
  "campaignId",
  "createdById",
  "createdAt",
  "updatedAt",
] as const;

// server managed fields for campaigns (no campaignId, uses ownerId)
const CAMPAIGN_SERVER_MANAGED = [
  "id",
  "slug",
  "ownerId",
  "createdAt",
  "updatedAt",
] as const;

type ServerManagedKey = (typeof SERVER_MANAGED)[number];
type CampaignServerManagedKey = (typeof CAMPAIGN_SERVER_MANAGED)[number];

function omitServerManaged<T extends ModelSchemas>(
  schemas: T,
  isCampaign = false
) {
  const keys = isCampaign ? CAMPAIGN_SERVER_MANAGED : SERVER_MANAGED;
  const omitShape = Object.fromEntries(keys.map((k) => [k, true])) as Record<
    ServerManagedKey | CampaignServerManagedKey,
    true
  >;

  return {
    createBase: schemas.optionalDefaults.omit(omitShape as any),
    updateBase: schemas.partial.omit(omitShape as any),
  };
}

/**
 * Builds create/update schemas with only the *minimal* API rules:
 * - forbid server-managed fields
 * - require non-empty name if present
 * - strict() to block unknown keys
 * - optional "must provide at least one key" for PATCH
 */
export function makeNamedResourceSchemas(
  schemas: ModelSchemas,
  isCampaign = false
) {
  const { createBase, updateBase } = omitServerManaged(schemas, isCampaign);

  const create = createBase
    .extend({ name: z.string().trim().min(1, "Name is required") })
    .strict();

  const update = updateBase
    .extend({ name: z.string().trim().min(1).optional() })
    .strict()
    .refine((obj: any) => Object.keys(obj).length > 0, {
      message: "At least one field is required",
    });

  return { create, update };
}

/**
 * Builds simpler "item" schemas (not needing name) – e.g., a membership or log
 */
export function makeItemResourceSchemas(schemas: ModelSchemas) {
  const { createBase, updateBase } = omitServerManaged(schemas);

  const create = createBase.strict();
  const update = updateBase
    .strict()
    .refine((obj: any) => Object.keys(obj).length > 0, {
      message: "At least one field is required",
    });

  return { create, update };
}

/**
 * Standard query params for listing campaign resources
 */
export const listResourceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type ListResourceQuery = z.infer<typeof listResourceQuerySchema>;
