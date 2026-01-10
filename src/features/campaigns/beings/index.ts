/**
 * Beings feature module
 * Re-exports schemas from resource layer
 * Uses registry-based CRUD via [[...segments]]/route.ts
 */

export { beingSchemas } from "@/lib/data/resources/beings";

import { beingSchemas } from "@/lib/data/resources/beings";
import type { z } from "zod";
export type CreateBeingInput = z.infer<typeof beingSchemas.create>;
export type UpdateBeingInput = z.infer<typeof beingSchemas.update>;
