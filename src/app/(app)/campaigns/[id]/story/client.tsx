"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { EditIconButton } from "@/components/ui/custom/button/EditIconButton";
import { InlineCreateButton } from "@/components/ui/custom/button/InlineCreateButton";
import {
  FormDialog,
  useFormDialog,
  useFormDialogSubmit,
} from "@/components/ui/custom/dialog/FormDialog";
import {
  ActForm,
  type ActFormData,
} from "@/components/ui/custom/forms/ActForm";
import {
  BeatForm,
  type BeatFormData,
} from "@/components/ui/custom/forms/BeatForm";
import {
  SceneForm,
  type SceneFormData,
} from "@/components/ui/custom/forms/SceneForm";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Theater } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Sortable, { type SortableEvent } from "sortablejs";
import {
  createAct,
  createBeat,
  createScene,
  deleteAct,
  deleteBeat,
  deleteScene,
  reorderActs,
  reorderBeats,
  reorderScenes,
  updateAct,
  updateBeat,
  updateScene,
} from "./actions";

// =======================================================================================================
// #region Helpers
// =======================================================================================================

const toLocalDateTime = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

const toFormData = (v: Record<string, string | null | undefined>) => {
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => val != null && fd.append(k, val));
  return fd;
};

type DialogMode = "create" | "edit";

const submitText = (mode: DialogMode, label: string) =>
  mode === "create" ? `Create ${label}` : `Update ${label}`;

const successText = (mode: DialogMode, label: string) =>
  mode === "create" ? `${label} created!` : `${label} updated!`;

const errorText = (mode: DialogMode, label: string) =>
  `Failed to ${mode} ${label.toLowerCase()}`;

type InitialTextNullable = { name: string; content?: string | null };

function toOptionalText(
  initial?: InitialTextNullable,
): { name: string; content?: string } | undefined {
  if (!initial) return undefined;
  return { name: initial.name, content: initial.content ?? undefined };
}

const getSortIds = (el: HTMLElement) =>
  Array.from(el.children)
    .map((node) => (node as HTMLElement).dataset.sortId)
    .filter((id): id is string => Boolean(id));

// #endregion Helpers

// =======================================================================================================
// #region Sortable Components
// =======================================================================================================

function GenericSortable({
  handleType,
  onReorder,
  children,
  className,
}: {
  handleType: string;
  onReorder: (ids: string[]) => Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const sortable = Sortable.create(el, {
      animation: 150,
      handle: `[data-drag-handle='${handleType}']`,
      draggable: "[data-sort-id]",
      ghostClass: "opacity-50",
      onEnd: async (evt: SortableEvent) => {
        if (evt.oldIndex === evt.newIndex) return;
        const ids = getSortIds(el);
        if (ids.length === 0) return;
        setIsSaving(true);
        try {
          await onReorder(ids);
          toast.success(`${handleType}s reordered`);
        } catch (err: any) {
          toast.error(err.message || `Failed to reorder ${handleType}s`);
        } finally {
          setIsSaving(false);
        }
      },
    });

    return () => sortable.destroy();
  }, [handleType, onReorder]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "space-y-3",
        isSaving && "pointer-events-none opacity-70",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SortableActs({
  campaignId,
  children,
  className,
}: {
  campaignId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GenericSortable
      handleType="act"
      onReorder={(ids) => reorderActs(campaignId, ids)}
      className={className}
    >
      {children}
    </GenericSortable>
  );
}

export function SortableScenes({
  actId,
  children,
  className,
}: {
  actId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GenericSortable
      handleType="scene"
      onReorder={(ids) => reorderScenes(actId, ids)}
      className={className}
    >
      {children}
    </GenericSortable>
  );
}

export function SortableBeats({
  sceneId,
  children,
  className,
}: {
  sceneId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GenericSortable
      handleType="beat"
      onReorder={(ids) => reorderBeats(sceneId, ids)}
      className={className}
    >
      {children}
    </GenericSortable>
  );
}

// #endregion Sortable Components

// =======================================================================================================
// #region Act Components
// =======================================================================================================

function ActDialogContent({
  mode,
  campaignId,
  actId,
  initial,
  open,
  onOpenChange,
}: {
  mode: DialogMode;
  campaignId: string;
  actId?: string;
  initial?: { name: string; content?: string };
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { isPending, done } = useFormDialogSubmit(onOpenChange);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCreate = mode === "create";

  const onSubmit = async (d: ActFormData) => {
    try {
      const fd = toFormData({ name: d.name, content: d.content });
      if (isCreate) {
        await createAct(campaignId, fd, false);
      } else {
        await updateAct(actId!, fd, false);
      }
      toast.success(successText(mode, "Act"));
      done();
    } catch (err: any) {
      toast.error(err.message || errorText(mode, "Act"));
    }
  };

  const onDelete = async () => {
    if (!actId) return;
    setIsDeleting(true);
    try {
      await deleteAct(actId);
      toast.success("Act deleted!");
      done();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete act");
      setIsDeleting(false);
    }
  };

  const isLoading = isPending || isDeleting;

  return (
    <FormDialog
      open={open}
      onOpenChangeAction={onOpenChange}
      title={isCreate ? "New Act" : "Edit Act"}
      description={
        isCreate
          ? "Define the major narrative sections of your campaign."
          : "Update the act details and content."
      }
      size="lg"
    >
      <div className="space-y-6">
        <ActForm
          initialData={initial}
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitText={submitText(mode, "Act")}
        />
        {!isCreate && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isLoading}
            >
              {isDeleting ? "Deleting..." : "Delete Act"}
            </Button>
          </div>
        )}
      </div>
    </FormDialog>
  );
}

export function EmptyState({ campaignId }: { campaignId: string }) {
  return (
    <CardContent className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Theater className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">No acts yet</h3>
          <p className="text-muted-foreground max-w-md">
            Create your first act to get started organizing your story.
          </p>
        </div>
        <CreateActButton campaignId={campaignId} />
      </div>
    </CardContent>
  );
}

function CreateActButton({ campaignId }: { campaignId: string }) {
  const { open, setOpen } = useFormDialog();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-7 w-7">
          <Plus className="h-4 w-4" />
          <span className="sr-only">New Act</span>
        </Button>
      </DialogTrigger>
      <ActDialogContent
        mode="create"
        campaignId={campaignId}
        open={open}
        onOpenChange={setOpen}
      />
    </Dialog>
  );
}

export function CreateActInlineButton({ campaignId }: { campaignId: string }) {
  return (
    <InlineCreateButton
      label="New Act"
      childrenAction={(open: boolean, setOpen: (o: boolean) => void) => (
        <ActDialogContent
          mode="create"
          campaignId={campaignId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    />
  );
}

export function EditActButton({
  actId,
  campaignId,
  initialData,
}: {
  actId: string;
  campaignId: string;
  initialData: InitialTextNullable;
}) {
  return (
    <EditIconButton
      label="Edit act"
      childrenAction={(open, setOpen) => (
        <ActDialogContent
          mode="edit"
          campaignId={campaignId}
          actId={actId}
          initial={toOptionalText(initialData)}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    />
  );
}

// #endregion Act Components

// =======================================================================================================
// #region Scene Components
// =======================================================================================================

function SceneDialogContent({
  mode,
  actId,
  sceneId,
  initial,
  open,
  onOpenChange,
}: {
  mode: DialogMode;
  actId: string;
  sceneId?: string;
  initial?: { name: string; content?: string };
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { isPending, done } = useFormDialogSubmit(onOpenChange);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCreate = mode === "create";
  const isLoading = isPending || isDeleting;

  const onSubmit = async (d: SceneFormData) => {
    try {
      const fd = toFormData({ name: d.name, content: d.content });
      if (isCreate) {
        await createScene(actId, fd, false);
      } else {
        await updateScene(sceneId!, fd, false);
      }
      toast.success(successText(mode, "Scene"));
      done();
    } catch (err: any) {
      toast.error(err.message || errorText(mode, "Scene"));
    }
  };

  const onDelete = async () => {
    if (!sceneId) return;
    setIsDeleting(true);
    try {
      await deleteScene(sceneId);
      toast.success("Scene deleted!");
      done();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete scene");
      setIsDeleting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChangeAction={onOpenChange}
      title={isCreate ? "New Scene" : "Edit Scene"}
      description={
        isCreate
          ? "Create a scene within this act."
          : "Update the scene details and content."
      }
      size="lg"
    >
      <div className="space-y-6">
        <SceneForm
          initialData={initial}
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitText={submitText(mode, "Scene")}
        />
        {!isCreate && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isLoading}
            >
              {isDeleting ? "Deleting..." : "Delete Scene"}
            </Button>
          </div>
        )}
      </div>
    </FormDialog>
  );
}

export function CreateSceneInlineButton({ actId }: { actId: string }) {
  return (
    <InlineCreateButton
      label="New Scene"
      childrenAction={(open: boolean, setOpen: (o: boolean) => void) => (
        <SceneDialogContent
          mode="create"
          actId={actId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    />
  );
}

export function EditSceneButton({
  sceneId,
  actId,
  initialData,
}: {
  sceneId: string;
  actId: string;
  initialData: InitialTextNullable;
}) {
  return (
    <EditIconButton
      label="Edit scene"
      childrenAction={(open, setOpen) => (
        <SceneDialogContent
          mode="edit"
          actId={actId}
          sceneId={sceneId}
          initial={toOptionalText(initialData)}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    />
  );
}

// #endregion Scene Components

// =======================================================================================================
// #region Beat Components
// =======================================================================================================

function BeatDialogContent({
  mode,
  sceneId,
  beatId,
  initial,
  open,
  onOpenChange,
}: {
  mode: DialogMode;
  sceneId?: string;
  beatId?: string;
  initial?: { text: string; timestamp: string };
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { isPending, done } = useFormDialogSubmit(onOpenChange);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCreate = mode === "create";
  const isLoading = isPending || isDeleting;

  const onSubmit = async (d: BeatFormData) => {
    try {
      const fd = toFormData({
        text: d.text,
        timestamp: new Date(d.timestamp).toISOString(),
      });
      if (isCreate) {
        await createBeat(sceneId!, fd, false);
      } else {
        await updateBeat(beatId!, fd, false);
      }
      toast.success(successText(mode, "Beat"));
      done();
    } catch (err: any) {
      toast.error(err.message || errorText(mode, "Beat"));
    }
  };

  const onDelete = async () => {
    if (!beatId) return;
    setIsDeleting(true);
    try {
      await deleteBeat(beatId);
      toast.success("Beat deleted!");
      done();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete beat");
      setIsDeleting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChangeAction={onOpenChange}
      title={isCreate ? "New Beat" : "Edit Beat"}
      description={
        isCreate
          ? "Add a timestamped beat to track events."
          : "Update the beat details."
      }
      size="md"
    >
      <div className="space-y-6">
        <BeatForm
          initialData={initial}
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitText={submitText(mode, "Beat")}
        />
        {!isCreate && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isLoading}
            >
              {isDeleting ? "Deleting..." : "Delete Beat"}
            </Button>
          </div>
        )}
      </div>
    </FormDialog>
  );
}

export function CreateBeatInlineButton({ sceneId }: { sceneId: string }) {
  return (
    <InlineCreateButton
      label="New Beat"
      childrenAction={(open: boolean, setOpen: (o: boolean) => void) => (
        <BeatDialogContent
          mode="create"
          sceneId={sceneId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    />
  );
}

export function EditBeatButton({
  beatId,
  initialData,
}: {
  beatId: string;
  initialData: { text: string; timestamp: Date };
}) {
  return (
    <EditIconButton
      label="Edit beat"
      childrenAction={(open, setOpen) => (
        <BeatDialogContent
          mode="edit"
          beatId={beatId}
          initial={{
            text: initialData.text,
            timestamp: toLocalDateTime(initialData.timestamp),
          }}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    />
  );
}

// #endregion Beat Components

// =======================================================================================================
// #region Utils
// =======================================================================================================

export function InteractiveContainer({
  children,
  stopPropagation = false,
  className,
  dataSortId,
}: {
  children: ReactNode;
  stopPropagation?: boolean;
  className?: string;
  dataSortId?: string;
}) {
  return (
    <div
      onMouseEnter={(e) => stopPropagation && e.stopPropagation()}
      className={className}
      data-sort-id={dataSortId}
    >
      {children}
    </div>
  );
}

// #endregion Utils
