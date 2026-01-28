"use server";

import { db } from "@/db/db";
import { campaignSettings } from "@/db/schema";
import { requireCampaignOwnership } from "@/lib/auth/authorization";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
  await requireCampaignOwnership(campaignId);

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
