"use server";

import { db } from "@/db";
import { campaigns, campaignSettings } from "@/db/schema";
import { authConfig } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateCampaign(
  campaignId: string,
  data: {
    name: string;
    description: string;
    image: string;
    backgroundImage: string;
  },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    columns: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db
    .update(campaigns)
    .set({
      name: data.name,
      description: data.description || null,
      image: data.image || null,
      backgroundImage: data.backgroundImage || null,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

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
  },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    columns: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Check if settings exist
  const existing = await db.query.campaignSettings.findFirst({
    where: eq(campaignSettings.campaignId, campaignId),
  });

  if (existing) {
    await db
      .update(campaignSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(campaignSettings.campaignId, campaignId));
  } else {
    await db.insert(campaignSettings).values({
      id: `settings_${campaignId}`,
      campaignId,
      updatedAt: new Date(),
      ...settings,
    });
  }

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function deleteCampaign(campaignId: string) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    columns: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(campaigns).where(eq(campaigns.id, campaignId));

  revalidatePath("/campaigns");
}
