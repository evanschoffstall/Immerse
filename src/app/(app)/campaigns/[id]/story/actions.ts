"use server";

import { db } from "@/db/db";
import { acts, beats, scenes } from "@/db/schema";
import { requireAuth } from "@/lib/auth/server-actions";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// =======================================================================================================
// #region Schemas
// =======================================================================================================

const createActSchema = createInsertSchema(acts, {
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
}).pick({ name: true, slug: true, content: true, campaignId: true });

const createSceneSchema = createInsertSchema(scenes, {
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
}).pick({ name: true, slug: true, content: true, actId: true });

const createBeatSchema = createInsertSchema(beats, {
  text: z.string().min(1, "Text is required"),
})
  .pick({ text: true, sceneId: true })
  .extend({
    timestamp: z.string().min(1, "Timestamp is required"),
  });

const updateBeatSchema = createBeatSchema.omit({ sceneId: true }).partial();
const reorderIdsSchema = z.array(z.string().uuid()).min(1);

// #endregion Schemas

// =======================================================================================================
// #region Helpers
// =======================================================================================================

function generateSlug(name: string, providedSlug?: string | null): string {
  return (
    providedSlug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

async function getNextSortOrder(
  table: typeof acts | typeof scenes | typeof beats,
  whereClause: ReturnType<typeof and>,
): Promise<number> {
  const [{ maxSortOrder }] = await db
    .select({ maxSortOrder: sql<number | null>`max(${table.sortOrder})` })
    .from(table)
    .where(whereClause);
  return (maxSortOrder ?? -1) + 1;
}

// #endregion Helpers

// =======================================================================================================
// #region Create Actions
// =======================================================================================================

export async function createAct(
  campaignId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const userId = await requireAuth();

  const name = formData.get("name") as string;
  const slug = generateSlug(name, formData.get("slug") as string);
  const content = formData.get("content") as string | null;

  const validated = createActSchema.parse({
    name,
    slug,
    content: content || undefined,
    campaignId,
  });

  const sortOrder = await getNextSortOrder(
    acts,
    and(eq(acts.campaignId, campaignId), isNull(acts.deletedAt)),
  );

  await db.insert(acts).values({
    id: crypto.randomUUID(),
    ...validated,
    sortOrder,
    createdById: userId,
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
  const userId = await requireAuth();

  const act = await db.query.acts.findFirst({
    where: eq(acts.id, actId),
    columns: { campaignId: true },
  });
  if (!act) throw new Error("Act not found");

  const name = formData.get("name") as string;
  const slug = generateSlug(name, formData.get("slug") as string);
  const content = formData.get("content") as string | null;

  const validated = createSceneSchema.parse({
    name,
    slug,
    content: content || undefined,
    actId,
  });

  const sortOrder = await getNextSortOrder(
    scenes,
    and(eq(scenes.actId, actId), isNull(scenes.deletedAt)),
  );

  await db.insert(scenes).values({
    id: crypto.randomUUID(),
    ...validated,
    sortOrder,
    createdById: userId,
    updatedAt: new Date(),
  });

  revalidatePath(`/campaigns/${act.campaignId}/story`);
  if (shouldRedirect) {
    redirect(`/campaigns/${act.campaignId}/story`);
  }
}

export async function createBeat(
  sceneId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const userId = await requireAuth();

  const scene = await db.query.scenes.findFirst({
    where: eq(scenes.id, sceneId),
    columns: { actId: true },
    with: { act: { columns: { campaignId: true } } },
  });
  if (!scene) throw new Error("Scene not found");

  const text = formData.get("text") as string;
  const timestampStr = formData.get("timestamp") as string;

  const validated = createBeatSchema.parse({
    text,
    timestamp: timestampStr,
    sceneId,
  });

  const sortOrder = await getNextSortOrder(
    beats,
    and(eq(beats.sceneId, sceneId), isNull(beats.deletedAt)),
  );

  await db.insert(beats).values({
    id: crypto.randomUUID(),
    text: validated.text,
    timestamp: new Date(timestampStr),
    sceneId: validated.sceneId,
    sortOrder,
    createdById: userId,
    updatedAt: new Date(),
  });

  revalidatePath(`/campaigns/${scene.act.campaignId}/story`);
  if (shouldRedirect) {
    redirect(`/campaigns/${scene.act.campaignId}/story`);
  }
}

// #endregion Create Actions

// =======================================================================================================
// #region Update Actions
// =======================================================================================================

export async function updateAct(
  actId: string,
  formData: FormData,
  shouldRedirect: boolean = true,
) {
  const userId = await requireAuth();

  const act = await db.query.acts.findFirst({
    where: eq(acts.id, actId),
    columns: { campaignId: true, createdById: true },
  });
  if (!act || act.createdById !== userId) throw new Error("Forbidden");

  const name = formData.get("name") as string;
  const slug = generateSlug(name, formData.get("slug") as string);
  const content = formData.get("content") as string | null;

  const validated = createActSchema.partial().parse({
    name,
    slug,
    content: content || undefined,
  });

  await db
    .update(acts)
    .set({ ...validated, updatedAt: new Date(), updatedById: userId })
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
  const userId = await requireAuth();

  const scene = await db.query.scenes.findFirst({
    where: eq(scenes.id, sceneId),
    columns: { actId: true, createdById: true },
    with: { act: { columns: { campaignId: true } } },
  });
  if (!scene || scene.createdById !== userId) throw new Error("Forbidden");

  const name = formData.get("name") as string;
  const slug = generateSlug(name, formData.get("slug") as string);
  const content = formData.get("content") as string | null;

  const validated = createSceneSchema.partial().parse({
    name,
    slug,
    content: content || undefined,
  });

  await db
    .update(scenes)
    .set({ ...validated, updatedAt: new Date(), updatedById: userId })
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
  const userId = await requireAuth();

  const beat = await db.query.beats.findFirst({
    where: eq(beats.id, beatId),
    columns: { createdById: true },
    with: {
      scene: {
        columns: { actId: true },
        with: { act: { columns: { campaignId: true } } },
      },
    },
  });
  if (!beat || beat.createdById !== userId) throw new Error("Forbidden");

  const text = formData.get("text") as string | null;
  const timestampStr = formData.get("timestamp") as string | null;

  const validated = updateBeatSchema.parse({
    text: text || undefined,
    timestamp: timestampStr || undefined,
  });

  const updates: { text?: string; timestamp?: Date } = {};
  if (validated.text) updates.text = validated.text;
  if (validated.timestamp) updates.timestamp = new Date(validated.timestamp);

  await db
    .update(beats)
    .set({ ...updates, updatedAt: new Date(), updatedById: userId })
    .where(eq(beats.id, beatId));

  revalidatePath(`/campaigns/${beat.scene.act.campaignId}/story`);
  if (shouldRedirect) {
    redirect(`/campaigns/${beat.scene.act.campaignId}/story`);
  }
}

// #endregion Update Actions

// =======================================================================================================
// #region Delete Actions
// =======================================================================================================

export async function deleteAct(actId: string) {
  const userId = await requireAuth();

  const act = await db.query.acts.findFirst({
    where: eq(acts.id, actId),
    columns: { campaignId: true, createdById: true },
  });
  if (!act || act.createdById !== userId) throw new Error("Forbidden");

  await db
    .update(acts)
    .set({ deletedAt: new Date(), updatedAt: new Date(), updatedById: userId })
    .where(eq(acts.id, actId));

  revalidatePath(`/campaigns/${act.campaignId}/story`);
}

export async function deleteScene(sceneId: string) {
  const userId = await requireAuth();

  const scene = await db.query.scenes.findFirst({
    where: eq(scenes.id, sceneId),
    columns: { createdById: true },
    with: { act: { columns: { campaignId: true } } },
  });
  if (!scene || scene.createdById !== userId) throw new Error("Forbidden");

  await db
    .update(scenes)
    .set({ deletedAt: new Date(), updatedAt: new Date(), updatedById: userId })
    .where(eq(scenes.id, sceneId));

  revalidatePath(`/campaigns/${scene.act.campaignId}/story`);
}

export async function deleteBeat(beatId: string) {
  const userId = await requireAuth();

  const beat = await db.query.beats.findFirst({
    where: eq(beats.id, beatId),
    columns: { createdById: true },
    with: {
      scene: {
        columns: { actId: true },
        with: { act: { columns: { campaignId: true } } },
      },
    },
  });
  if (!beat || beat.createdById !== userId) throw new Error("Forbidden");

  await db
    .update(beats)
    .set({ deletedAt: new Date(), updatedAt: new Date(), updatedById: userId })
    .where(eq(beats.id, beatId));

  revalidatePath(`/campaigns/${beat.scene.act.campaignId}/story`);
}

// #endregion Delete Actions

// =======================================================================================================
// #region Reorder Actions
// =======================================================================================================

export async function reorderActs(campaignId: string, actIds: string[]) {
  const userId = await requireAuth();

  const ids = reorderIdsSchema.parse(actIds);
  const rows = await db.query.acts.findMany({
    where: and(
      inArray(acts.id, ids),
      eq(acts.campaignId, campaignId),
      isNull(acts.deletedAt),
    ),
    columns: { id: true, createdById: true },
  });

  if (rows.length !== ids.length) throw new Error("Invalid acts");
  if (rows.some((row) => row.createdById !== userId)) {
    throw new Error("Forbidden");
  }

  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx
        .update(acts)
        .set({ sortOrder: index, updatedAt: new Date(), updatedById: userId })
        .where(eq(acts.id, id));
    }
  });

  revalidatePath(`/campaigns/${campaignId}/story`);
}

export async function reorderScenes(actId: string, sceneIds: string[]) {
  const userId = await requireAuth();

  const act = await db.query.acts.findFirst({
    where: eq(acts.id, actId),
    columns: { campaignId: true },
  });
  if (!act) throw new Error("Act not found");

  const ids = reorderIdsSchema.parse(sceneIds);
  const rows = await db.query.scenes.findMany({
    where: and(
      inArray(scenes.id, ids),
      eq(scenes.actId, actId),
      isNull(scenes.deletedAt),
    ),
    columns: { id: true, createdById: true },
  });

  if (rows.length !== ids.length) throw new Error("Invalid scenes");
  if (rows.some((row) => row.createdById !== userId)) {
    throw new Error("Forbidden");
  }

  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx
        .update(scenes)
        .set({ sortOrder: index, updatedAt: new Date(), updatedById: userId })
        .where(eq(scenes.id, id));
    }
  });

  revalidatePath(`/campaigns/${act.campaignId}/story`);
}

export async function reorderBeats(sceneId: string, beatIds: string[]) {
  const userId = await requireAuth();

  const scene = await db.query.scenes.findFirst({
    where: eq(scenes.id, sceneId),
    columns: { actId: true },
    with: { act: { columns: { campaignId: true } } },
  });
  if (!scene) throw new Error("Scene not found");

  const ids = reorderIdsSchema.parse(beatIds);
  const rows = await db.query.beats.findMany({
    where: and(
      inArray(beats.id, ids),
      eq(beats.sceneId, sceneId),
      isNull(beats.deletedAt),
    ),
    columns: { id: true, createdById: true },
  });

  if (rows.length !== ids.length) throw new Error("Invalid beats");
  if (rows.some((row) => row.createdById !== userId)) {
    throw new Error("Forbidden");
  }

  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx
        .update(beats)
        .set({ sortOrder: index, updatedAt: new Date(), updatedById: userId })
        .where(eq(beats.id, id));
    }
  });

  revalidatePath(`/campaigns/${scene.act.campaignId}/story`);
}

// #endregion Reorder Actions
