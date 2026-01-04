import { authConfig } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";

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
  userId: string;
  isOwner: boolean;
}

/**
 * Load campaign context and verify user access
 * Throws standard errors that can be caught by route wrappers
 */
export async function getCampaignContext(
  campaignId: string
): Promise<CampaignContext> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const campaign = await prisma.campaigns.findUnique({
    where: { id: campaignId },
  });

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
    userId: session.user.id,
    isOwner,
  };
}
