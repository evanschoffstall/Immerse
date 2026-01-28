"use server";

import { db } from "@/db/db";
import { acts, beats, scenes } from "@/db/schema";
import { requireAuth } from "@/lib/auth/server-actions";
import { requireEntityOwnership } from "@/lib/auth/authorization";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/action-errors";
import {
  reorderEntities,
  type EntityConfig,
} from "@/lib/db/helpers/entity-operations";
import { extractNameSlugContent } from "@/lib/utils/form";
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

// #endregion Schemas

// =======================================================================================================
// #region Helpers
// =======================================================================================================

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

/**
 * Entity configurations for reorder operations
 */
const actsConfig: EntityConfig<typeof acts> = {
  table: acts,
  tableName: "acts",
  idColumn: acts.id,
  sortOrderColumn: acts.sortOrder,
  deletedAtColumn: acts.deletedAt,
  createdByColumn: acts.createdById,
  updatedByColumn: acts.updatedById,
  updatedAtColumn: acts.updatedAt,
};

const scenesConfig: EntityConfig<typeof scenes> = {
  table: scenes,
  tableName: "scenes",
  idColumn: scenes.id,
  sortOrderColumn: scenes.sortOrder,
  deletedAtColumn: scenes.deletedAt,
  createdByColumn: scenes.createdById,
  updatedByColumn: scenes.updatedById,
  updatedAtColumn: scenes.updatedAt,
};

const beatsConfig: EntityConfig<typeof beats> = {
  table: beats,
  tableName: "beats",
  idColumn: beats.id,
  sortOrderColumn: beats.sortOrder,
  deletedAtColumn: beats.deletedAt,
  createdByColumn: beats.createdById,
  updatedByColumn: beats.updatedById,
  updatedAtColumn: beats.updatedAt,
};

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

  const { name, slug, content } = extractNameSlugContent(formData);

  const validated = createActSchema.parse({
    name,
    slug,
    content,
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
  if (!act) throw new NotFoundError("act");

  const { name, slug, content } = extractNameSlugContent(formData);

  const validated = createSceneSchema.parse({
    name,
    slug,
    content,
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
  if (!scene) throw new NotFoundError("scene");

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
  const { userId, entity: act } = await requireEntityOwnership(
    () =>
      db.query.acts.findFirst({
        where: eq(acts.id, actId),
        columns: { campaignId: true, createdById: true },
      }),
    "act",
  );

  const { name, slug, content } = extractNameSlugContent(formData);

  if (slug) {
    const duplicate = await db.query.acts.findFirst({
      where: and(
        eq(acts.campaignId, act.campaignId),
        eq(acts.slug, slug),
        isNull(acts.deletedAt),
      ),
      columns: { id: true },
    });

    if (duplicate && duplicate.id !== actId) {
      throw new ValidationError("An act with this slug already exists");
    }
  }

  const validated = createActSchema.partial().parse({
    name,
    slug,
    content,
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
  const { userId, entity: scene } = await requireEntityOwnership(
    () =>
      db.query.scenes.findFirst({
        where: eq(scenes.id, sceneId),
        columns: { actId: true, createdById: true },
        with: { act: { columns: { campaignId: true } } },
      }),
    "scene",
  );

  const { name, slug, content } = extractNameSlugContent(formData);

  if (slug) {
    const duplicate = await db.query.scenes.findFirst({
      where: and(
        eq(scenes.actId, scene.actId),
        eq(scenes.slug, slug),
        isNull(scenes.deletedAt),
      ),
      columns: { id: true },
    });

    if (duplicate && duplicate.id !== sceneId) {
      throw new ValidationError("A scene with this slug already exists");
    }
  }

  const validated = createSceneSchema.partial().parse({
    name,
    slug,
    content,
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
  const { userId, entity: beat } = await requireEntityOwnership(
    () =>
      db.query.beats.findFirst({
        where: eq(beats.id, beatId),
        columns: { createdById: true },
        with: {
          scene: {
            columns: { actId: true },
            with: { act: { columns: { campaignId: true } } },
          },
        },
      }),
    "beat",
  );

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
  const { userId, entity: act } = await requireEntityOwnership(
    () =>
      db.query.acts.findFirst({
        where: eq(acts.id, actId),
        columns: { campaignId: true, createdById: true },
      }),
    "act",
  );

  await db
    .update(acts)
    .set({ deletedAt: new Date(), updatedAt: new Date(), updatedById: userId })
    .where(eq(acts.id, actId));

  revalidatePath(`/campaigns/${act.campaignId}/story`);
}

export async function deleteScene(sceneId: string) {
  const { userId, entity: scene } = await requireEntityOwnership(
    () =>
      db.query.scenes.findFirst({
        where: eq(scenes.id, sceneId),
        columns: { createdById: true },
        with: { act: { columns: { campaignId: true } } },
      }),
    "scene",
  );

  await db
    .update(scenes)
    .set({ deletedAt: new Date(), updatedAt: new Date(), updatedById: userId })
    .where(eq(scenes.id, sceneId));

  revalidatePath(`/campaigns/${scene.act.campaignId}/story`);
}

export async function deleteBeat(beatId: string) {
  const { userId, entity: beat } = await requireEntityOwnership(
    () =>
      db.query.beats.findFirst({
        where: eq(beats.id, beatId),
        columns: { createdById: true },
        with: {
          scene: {
            columns: { actId: true },
            with: { act: { columns: { campaignId: true } } },
          },
        },
      }),
    "beat",
  );

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

  await reorderEntities(
    actsConfig,
    actIds,
    eq(acts.campaignId, campaignId),
    userId,
    campaignId,
  );
}

export async function reorderScenes(actId: string, sceneIds: string[]) {
  const userId = await requireAuth();

  const act = await db.query.acts.findFirst({
    where: eq(acts.id, actId),
    columns: { campaignId: true },
  });
  if (!act) throw new NotFoundError("act");

  await reorderEntities(
    scenesConfig,
    sceneIds,
    eq(scenes.actId, actId),
    userId,
    act.campaignId,
  );
}

export async function reorderBeats(sceneId: string, beatIds: string[]) {
  const userId = await requireAuth();

  const scene = await db.query.scenes.findFirst({
    where: eq(scenes.id, sceneId),
    columns: { actId: true },
    with: { act: { columns: { campaignId: true } } },
  });
  if (!scene) throw new NotFoundError("scene");

  await reorderEntities(
    beatsConfig,
    beatIds,
    eq(beats.sceneId, sceneId),
    userId,
    scene.act.campaignId,
  );
}

// #endregion Reorder Actions
