"use server";

import { db } from "@/db";
import { acts, beats, scenes } from "@/db/schema";
import { authConfig } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createActSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  campaignId: z.string().uuid(),
});

const createSceneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  actId: z.string().uuid(),
});

export async function createAct(
  campaignId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const slug =
    (formData.get("slug") as string) ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const content = formData.get("content") as string | null;

  const validated = createActSchema.parse({
    name,
    slug,
    content: content || undefined,
    campaignId,
  });

  const actId = crypto.randomUUID();
  await db.insert(acts).values({
    id: actId,
    ...validated,
    createdById: session.user.id,
    updatedAt: new Date(),
  });

  revalidatePath(`/campaigns/${campaignId}/story`);

  if (shouldRedirect) {
    redirect(`/campaigns/${campaignId}/story`);
  }
}

export async function createScene(
  actId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the act to find the campaignId
  const act = await db.query.acts.findFirst({
    where: eq(acts.id, actId),
    columns: { campaignId: true },
  });

  if (!act) {
    throw new Error("Act not found");
  }

  const name = formData.get("name") as string;
  const slug =
    (formData.get("slug") as string) ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const content = formData.get("content") as string | null;

  const validated = createSceneSchema.parse({
    name,
    slug,
    content: content || undefined,
    actId,
  });

  const sceneId = crypto.randomUUID();
  await db.insert(scenes).values({
    id: sceneId,
    ...validated,
    createdById: session.user.id,
    updatedAt: new Date(),
  });

  revalidatePath(`/campaigns/${act.campaignId}/story`);

  if (shouldRedirect) {
    redirect(`/campaigns/${act.campaignId}/story`);
  }
}

const createBeatSchema = z.object({
  text: z.string().min(1, "Text is required"),
  timestamp: z.string().min(1, "Timestamp is required"),
  sceneId: z.string().uuid(),
});

const updateBeatSchema = createBeatSchema.omit({ sceneId: true }).partial();

export async function createBeat(
  sceneId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the scene to find the act and campaignId
  const scene = await db.query.scenes.findFirst({
    where: eq(scenes.id, sceneId),
    columns: { actId: true },
    with: {
      act: {
        columns: { campaignId: true },
      },
    },
  });

  if (!scene) {
    throw new Error("Scene not found");
  }

  const text = formData.get("text") as string;
  const timestampStr = formData.get("timestamp") as string;
  const timestamp = new Date(timestampStr);

  const validated = createBeatSchema.parse({
    text,
    timestamp: timestampStr,
    sceneId,
  });

  const beatId = crypto.randomUUID();
  await db.insert(beats).values({
    id: beatId,
    text: validated.text,
    timestamp,
    sceneId: validated.sceneId,
    createdById: session.user.id,
    updatedAt: new Date(),
  });

  revalidatePath(`/campaigns/${scene.act.campaignId}/story`);

  if (shouldRedirect) {
    redirect(`/campaigns/${scene.act.campaignId}/story`);
  }
}

export async function updateAct(
  actId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const act = await db.query.acts.findFirst({
    where: eq(acts.id, actId),
    columns: { campaignId: true, createdById: true },
  });

  if (!act || act.createdById !== session.user.id) {
    throw new Error("Forbidden");
  }

  const name = formData.get("name") as string;
  const slug =
    (formData.get("slug") as string) ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const content = formData.get("content") as string | null;

  const validated = createActSchema.partial().parse({
    name,
    slug,
    content: content || undefined,
  });

  await db
    .update(acts)
    .set({
      ...validated,
      updatedAt: new Date(),
      updatedById: session.user.id,
    })
    .where(eq(acts.id, actId));

  revalidatePath(`/campaigns/${act.campaignId}/story`);

  if (shouldRedirect) {
    redirect(`/campaigns/${act.campaignId}/story`);
  }
}

export async function updateScene(
  sceneId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const scene = await db.query.scenes.findFirst({
    where: eq(scenes.id, sceneId),
    columns: { actId: true, createdById: true },
    with: {
      act: {
        columns: { campaignId: true },
      },
    },
  });

  if (!scene || scene.createdById !== session.user.id) {
    throw new Error("Forbidden");
  }

  const name = formData.get("name") as string;
  const slug =
    (formData.get("slug") as string) ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const content = formData.get("content") as string | null;

  const validated = createSceneSchema.partial().parse({
    name,
    slug,
    content: content || undefined,
  });

  await db
    .update(scenes)
    .set({
      ...validated,
      updatedAt: new Date(),
      updatedById: session.user.id,
    })
    .where(eq(scenes.id, sceneId));

  revalidatePath(`/campaigns/${scene.act.campaignId}/story`);

  if (shouldRedirect) {
    redirect(`/campaigns/${scene.act.campaignId}/story`);
  }
}

export async function updateBeat(
  beatId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const beat = await db.query.beats.findFirst({
    where: eq(beats.id, beatId),
    columns: { createdById: true },
    with: {
      scene: {
        columns: { actId: true },
        with: {
          act: {
            columns: { campaignId: true },
          },
        },
      },
    },
  });

  if (!beat || beat.createdById !== session.user.id) {
    throw new Error("Forbidden");
  }

  const text = formData.get("text") as string | null;
  const timestampStr = formData.get("timestamp") as string | null;

  const validated = updateBeatSchema.parse({
    text: text || undefined,
    timestamp: timestampStr || undefined,
  });

  const updates: { text?: string; timestamp?: Date } = {};

  if (validated.text) {
    updates.text = validated.text;
  }

  if (validated.timestamp) {
    updates.timestamp = new Date(validated.timestamp);
  }

  await db
    .update(beats)
    .set({
      ...updates,
      updatedAt: new Date(),
      updatedById: session.user.id,
    })
    .where(eq(beats.id, beatId));

  revalidatePath(`/campaigns/${beat.scene.act.campaignId}/story`);

  if (shouldRedirect) {
    redirect(`/campaigns/${beat.scene.act.campaignId}/story`);
  }
}
