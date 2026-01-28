import { db } from "@/db/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ForbiddenError } from "../errors/action-errors";
import { requireAuth } from "./server-actions";

/**
 * Verifies that the current user owns the specified campaign.
 * @param campaignId - The ID of the campaign to check ownership for
 * @returns The user ID if authorized
 * @throws Error if the campaign doesn't exist or user doesn't own it
 */
export async function requireCampaignOwnership(
  campaignId: string,
): Promise<string> {
  const userId = await requireAuth();

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    columns: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== userId) {
    throw new ForbiddenError("campaign");
  }

  return userId;
}

/**
 * Verifies that the current user owns the specified entity through createdById.
 * Generic function for acts, scenes, beats, and other user-created entities.
 * @param queryFn - Database query function that returns the entity
 * @param entityName - Name of the entity type for error messages
 * @returns Object containing the user ID and the entity
 * @throws Error if the entity doesn't exist or user doesn't own it
 */
export async function requireEntityOwnership<T extends { createdById: string }>(
  queryFn: () => Promise<T | undefined>,
  entityName: string = "resource",
): Promise<{ userId: string; entity: T }> {
  const userId = await requireAuth();

  const entity = await queryFn();

  if (!entity || entity.createdById !== userId) {
    throw new ForbiddenError(entityName);
  }

  return { userId, entity };
}
