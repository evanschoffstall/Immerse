"use server";

import { db } from "@/db/db";
import { campaigns } from "@/db/schema";
import { requireAuth } from "@/lib/auth/server-actions";
import { requireCampaignOwnership } from "@/lib/auth/authorization";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createCampaignSchema = createInsertSchema(campaigns, {
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3),
}).pick({
  name: true,
  slug: true,
  description: true,
  image: true,
  backgroundImage: true,
  visibility: true,
  locale: true,
});

const updateCampaignSchema = createInsertSchema(campaigns, {
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  slug: z.string().min(3).optional(),
})
  .pick({
    name: true,
    slug: true,
    description: true,
    image: true,
    backgroundImage: true,
    visibility: true,
    locale: true,
  })
  .partial();

export async function createCampaign(formData: FormData) {
  const userId = await requireAuth();

  const data = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    image: formData.get("image") || undefined,
    backgroundImage: formData.get("backgroundImage") || undefined,
    visibility: formData.get("visibility") || "private",
    locale: formData.get("locale") || "en",
  };

  const validated = createCampaignSchema.parse(data);

  const campaignId = crypto.randomUUID();
  await db.insert(campaigns).values({
    id: campaignId,
    ...validated,
    ownerId: userId,
    updatedAt: new Date(),
  });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaignId}`);
}

export async function updateCampaign(
  campaignId: string,
  data: z.infer<typeof updateCampaignSchema>,
) {
  await requireCampaignOwnership(campaignId);

  const validated = updateCampaignSchema.parse(data);

  await db
    .update(campaigns)
    .set({ ...validated, updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
}

export async function deleteCampaign(campaignId: string) {
  await requireCampaignOwnership(campaignId);

  await db
    .update(campaigns)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  revalidatePath("/campaigns");
  redirect("/campaigns");
}
