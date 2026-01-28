import { db } from "@/db/db";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/action-errors";
import { and, eq, inArray, isNull, SQL } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reorderIdsSchema = z.array(z.string().uuid()).min(1);

/**
 * Configuration for a narrative entity (Act, Scene, Beat)
 */
export type EntityConfig<T extends PgTable> = {
  /** The Drizzle table object */
  table: T;
  /** The table name as a string (for db.query access) */
  tableName: string;
  /** The ID column reference */
  idColumn: any;
  /** The sortOrder column reference */
  sortOrderColumn: any;
  /** The deletedAt column reference */
  deletedAtColumn: any;
  /** The createdById column reference */
  createdByColumn: any;
  /** The updatedById column reference */
  updatedByColumn: any;
  /** The updatedAt column reference */
  updatedAtColumn: any;
};

/**
 * Reorders entities (acts, scenes, or beats) with authorization checks
 *
 * @param config - Entity configuration object
 * @param entityIds - Array of entity IDs in the desired order
 * @param parentWhere - SQL condition for parent relationship (e.g., eq(acts.campaignId, campaignId))
 * @param userId - The authenticated user's ID
 * @param campaignId - The campaign ID for cache revalidation
 */
export async function reorderEntities<T extends PgTable>(
  config: EntityConfig<T>,
  entityIds: string[],
  parentWhere: SQL,
  userId: string,
  campaignId: string,
): Promise<void> {
  // Validate and parse IDs
  const ids = reorderIdsSchema.parse(entityIds);

  // Fetch entities to verify they exist and check ownership
  const rows = await (db.query as any)[config.tableName].findMany({
    where: and(
      inArray(config.idColumn, ids),
      parentWhere,
      isNull(config.deletedAtColumn),
    ),
    columns: { id: true, createdById: true },
  });

  // Validate all entities were found
  if (rows.length !== ids.length) {
    throw new ValidationError(
      `Some ${config.tableName} were not found or already deleted`,
    );
  }

  // Verify user owns all entities
  if (rows.some((row: any) => row.createdById !== userId)) {
    throw new ForbiddenError(`these ${config.tableName}`);
  }

  // Update sort order in a transaction
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx
        .update(config.table)
        .set({
          sortOrder: index,
          updatedAt: new Date(),
          updatedById: userId,
        } as any)
        .where(eq(config.idColumn, id));
    }
  });

  // Revalidate the campaign story page
  revalidatePath(`/campaigns/${campaignId}/story`);
}
