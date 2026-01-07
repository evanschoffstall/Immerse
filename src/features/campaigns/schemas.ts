import { makeNamedResourceSchemas } from "@/lib/validation";
import { z } from "zod";

// ============================================================================
// CAMPAIGN SCHEMAS - Shared between client and server
// ============================================================================

const campaignsOptionalDefaultsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  backgroundImage: z.string().optional(),
  visibility: z.string().optional(),
  locale: z.string().optional(),
});

const campaignsPartialSchema = campaignsOptionalDefaultsSchema.partial();

export const CampaignSchemas = makeNamedResourceSchemas(
  {
    optionalDefaults: campaignsOptionalDefaultsSchema,
    partial: campaignsPartialSchema,
  },
  true
); // true = isCampaign, uses different server-managed fields

export const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCampaignInput = z.infer<typeof CampaignSchemas.create>;
export type UpdateCampaignInput = z.infer<typeof CampaignSchemas.update>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
