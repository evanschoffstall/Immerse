/**
 * Quests feature module
 * Re-exports schemas from resource layer
 * Uses registry-based CRUD via [[...segments]]/route.ts
 */

export { questSchemas } from "@/lib/data/resources/quests";

import { questSchemas } from "@/lib/data/resources/quests";
import type { z } from "zod";
export type CreateQuestInput = z.infer<typeof questSchemas.create>;
export type UpdateQuestInput = z.infer<typeof questSchemas.update>;
