"use server";

import { db } from "@/db";
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
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    backgroundImage: formData.get("backgroundImage"),
    visibility: formData.get("visibility") || "private",
    locale: formData.get("locale") || "en",
  };

  const validated = createCampaignSchema.parse(data);

  const campaign = await db.campaigns.create({
    data: {
      id: crypto.randomUUID(),
      ...validated,
      ownerId: session.user.id,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaign.id}`);
}

export async function updateCampaign(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const campaign = await db.campaigns.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const data = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image: formData.get("image"),
    backgroundImage: formData.get("backgroundImage"),
    visibility: formData.get("visibility"),
    locale: formData.get("locale"),
  };

  const validated = createCampaignSchema.partial().parse(data);

  await db.campaigns.update({
    where: { id },
    data: {
      ...validated,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/campaigns/${id}`);
  revalidatePath("/campaigns");
}

export async function deleteCampaign(id: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const campaign = await db.campaigns.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!campaign || campaign.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await db.campaigns.delete({ where: { id } });

  revalidatePath("/campaigns");
  redirect("/campaigns");
}
