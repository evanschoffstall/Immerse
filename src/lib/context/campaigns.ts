import { authConfig } from "@/lib/auth";
import { campaignRepo } from "@/lib/data/repositories";
import { getServerSession } from "next-auth/next";
import { cache } from "react";

/**
 * Campaign context infrastructure - lives in lib/ not features/
 * This is a shared utility for loading campaign context across the app
 */

export interface CampaignContext {
  campaign: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    backgroundImage: string | null;
    visibility: string;
    locale: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  };
  userId: string;
  isOwner: boolean;
}

/**
 * Internal function to load campaign context
 */
async function _getCampaignContext(
  campaignId: string
): Promise<CampaignContext> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const campaign = await campaignRepo.findById(campaignId);

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  // For now, only owners have access
  // TODO: Extend this to check campaign_roles for members/viewers
  const isOwner = campaign.ownerId === session.user.id;

  if (!isOwner) {
    throw new Error("FORBIDDEN");
  }

  return {
    campaign,
    session: {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || undefined,
      },
    },
    userId: session.user.id,
    isOwner,
  };
}

/**
 * Load campaign context and verify user access
 * Cached per-request to avoid duplicate database queries
 * Throws standard errors that can be caught by route wrappers
 */
export const getCampaignContext = cache(_getCampaignContext);

/**
 * Lightweight campaign access check (cached)
 * Only verifies user owns campaign without loading full context
 * Returns campaignId if authorized, throws error otherwise
 */
async function _verifyCampaignAccess(
  campaignId: string,
  userId: string
): Promise<string> {
  const campaign = await campaignRepo.findById(campaignId);

  if (!campaign) {
    throw new Error("CAMPAIGN_NOT_FOUND");
  }

  if (campaign.ownerId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return campaignId;
}

/**
 * Cached lightweight access check for read-only operations
 * Use this instead of getCampaignContext when you only need to verify access
 */
export const verifyCampaignAccess = cache(_verifyCampaignAccess);
