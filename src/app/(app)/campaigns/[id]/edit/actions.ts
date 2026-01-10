"use server";

import { db } from "@/db";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateCampaign(
  campaignId: string,
  data: {
    name: string;
    description: string;
    image: string;
    backgroundImage: string;
  }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const campaign = await db.campaigns.findUnique({
    where: { id: campaignId },
    select: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.campaigns.update({
    where: { id: campaignId },
    data: {
      name: data.name,
      description: data.description || null,
      image: data.image || null,
      backgroundImage: data.backgroundImage || null,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
}

export async function updateCampaignSettings(
  campaignId: string,
  settings: {
    bgOpacity: number;
    bgBlur: number;
    bgExpandToSidebar: boolean;
    bgExpandToHeader: boolean;
    headerBgOpacity: number;
    headerBlur: number;
    sidebarBgOpacity: number;
    sidebarBlur: number;
    cardBgOpacity: number;
    cardBlur: number;
  }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const campaign = await db.campaigns.findUnique({
    where: { id: campaignId },
    select: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.campaign_settings.upsert({
    where: { campaignId },
    create: {
      id: `settings_${campaignId}`,
      campaignId,
      updatedAt: new Date(),
      ...settings,
    },
    update: {
      ...settings,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function deleteCampaign(campaignId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const campaign = await db.campaigns.findUnique({
    where: { id: campaignId },
    select: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.campaigns.delete({
    where: { id: campaignId },
  });

  revalidatePath("/campaigns");
}
