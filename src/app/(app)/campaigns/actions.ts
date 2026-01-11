"use server";

import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { authConfig } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createCampaignSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3),
  description: z.string().optional(),
  image: z.string().optional(),
  backgroundImage: z.string().optional(),
  visibility: z.enum(["private", "public"]).default("private"),
  locale: z.string().default("en"),
});

export async function createCampaign(formData: FormData) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

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
    ownerId: session.user.id,
    updatedAt: new Date(),
  });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaignId}`);
}

export async function updateCampaign(id: string, formData: FormData) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, id),
    columns: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const data = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    image: formData.get("image") || undefined,
    backgroundImage: formData.get("backgroundImage") || undefined,
    visibility: formData.get("visibility"),
    locale: formData.get("locale"),
  };

  const validated = createCampaignSchema.partial().parse(data);

  await db
    .update(campaigns)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, id));

  revalidatePath(`/campaigns/${id}`);
  revalidatePath("/campaigns");
}

export async function deleteCampaign(id: string) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, id),
    columns: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await db.delete(campaigns).where(eq(campaigns.id, id));

  revalidatePath("/campaigns");
  redirect("/campaigns");
}
