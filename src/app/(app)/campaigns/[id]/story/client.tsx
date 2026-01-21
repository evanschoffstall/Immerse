"use client";

import ActForm, {
  type ActFormData,
} from "@/components/ui/custom/forms/ActForm";
import BeatForm, {
  type BeatFormData,
} from "@/components/ui/custom/forms/BeatForm";
import SceneForm, {
  type SceneFormData,
} from "@/components/ui/custom/forms/SceneForm";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { CreateCard } from "@/components/ui/custom/card/CreateCard";
import { EditIconButton } from "@/components/ui/custom/button/EditIconButton";
import {
  FormDialog,
  useFormDialog,
  useFormDialogSubmit,
} from "@/components/ui/custom/dialog/FormDialog";
import { InlineCreateButton } from "@/components/ui/custom/button/InlineCreateButton";
import { cn } from "@/lib/utils";
import { Clock, Plus, Theater } from "lucide-react";
import { toast } from "sonner";
import {
  createAct,
  createBeat,
  createScene,
  updateAct,
  updateBeat,
  updateScene,
} from "./actions";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { ReactNode } from "react";

// ============================================================================
// Helpers
// ============================================================================

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

// ============================================================================
// Act
// ============================================================================

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
  const isCreate = mode === "create";

  const onSubmit = async (d: ActFormData) => {
    try {
      const fd = toFormData({ name: d.name, content: d.content });
      isCreate
        ? await createAct(campaignId, fd, false)
        : await updateAct(actId!, fd, false);
      toast.success(successText(mode, "Act"));
      done();
    } catch (err: any) {
      toast.error(err.message || errorText(mode, "Act"));
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? "New Act" : "Edit Act"}
      description={
        isCreate
          ? "Define the major narrative sections of your campaign."
          : "Update the act details and content."
      }
      size="lg"
    >
      <ActForm
        initialData={initial}
        onSubmit={onSubmit}
        isLoading={isPending}
        submitText={submitText(mode, "Act")}
      />
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

export function CreateActCard({ campaignId }: { campaignId: string }) {
  const { open, setOpen } = useFormDialog();
  return (
    <>
      <CreateCard
        icon={Theater}
        title="New Act"
        description="Create a new act to organize your story"
        variant="lg"
        onClick={() => setOpen(true)}
      />
      <ActDialogContent
        mode="create"
        campaignId={campaignId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function CreateActButton({ campaignId }: { campaignId: string }) {
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
    <InlineCreateButton label="New Act">
      {(open, setOpen) => (
        <ActDialogContent
          mode="create"
          campaignId={campaignId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </InlineCreateButton>
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
    <EditIconButton label="Edit act">
      {(open, setOpen) => (
        <ActDialogContent
          mode="edit"
          campaignId={campaignId}
          actId={actId}
          initial={toOptionalText(initialData)}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </EditIconButton>
  );
}

// ============================================================================
// Scene
// ============================================================================

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
  const isCreate = mode === "create";

  const onSubmit = async (d: SceneFormData) => {
    try {
      const fd = toFormData({ name: d.name, content: d.content });
      isCreate
        ? await createScene(actId, fd, false)
        : await updateScene(sceneId!, fd, false);
      toast.success(successText(mode, "Scene"));
      done();
    } catch (err: any) {
      toast.error(err.message || errorText(mode, "Scene"));
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? "New Scene" : "Edit Scene"}
      description={
        isCreate
          ? "Create a scene within this act."
          : "Update the scene details and content."
      }
      size="lg"
    >
      <SceneForm
        initialData={initial}
        onSubmit={onSubmit}
        isLoading={isPending}
        submitText={submitText(mode, "Scene")}
      />
    </FormDialog>
  );
}

export function CreateSceneCard({ actId }: { actId: string }) {
  const { open, setOpen } = useFormDialog();
  return (
    <>
      <CreateCard
        icon={Theater}
        title="New Scene"
        description="Create a new scene in this act"
        variant="md"
        onClick={() => setOpen(true)}
      />
      <SceneDialogContent
        mode="create"
        actId={actId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function CreateSceneInlineButton({ actId }: { actId: string }) {
  return (
    <InlineCreateButton label="New Scene">
      {(open, setOpen) => (
        <SceneDialogContent
          mode="create"
          actId={actId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </InlineCreateButton>
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
    <EditIconButton label="Edit scene">
      {(open, setOpen) => (
        <SceneDialogContent
          mode="edit"
          actId={actId}
          sceneId={sceneId}
          initial={toOptionalText(initialData)}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </EditIconButton>
  );
}

// ============================================================================
// Beat
// ============================================================================

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
  const isCreate = mode === "create";

  const onSubmit = async (d: BeatFormData) => {
    try {
      const fd = toFormData({
        text: d.text,
        timestamp: new Date(d.timestamp).toISOString(),
      });
      isCreate
        ? await createBeat(sceneId!, fd, false)
        : await updateBeat(beatId!, fd, false);
      toast.success(successText(mode, "Beat"));
      done();
    } catch (err: any) {
      toast.error(err.message || errorText(mode, "Beat"));
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? "New Beat" : "Edit Beat"}
      description={
        isCreate
          ? "Add a timestamped beat to track events."
          : "Update the beat details."
      }
      size="md"
    >
      <BeatForm
        initialData={initial}
        onSubmit={onSubmit}
        isLoading={isPending}
        submitText={submitText(mode, "Beat")}
      />
    </FormDialog>
  );
}

export function CreateBeatCard({ sceneId }: { sceneId: string }) {
  const { open, setOpen } = useFormDialog();
  return (
    <>
      <div
        className={cn(
          "group relative flex gap-3 rounded-lg border-l-2 border-dashed border-l-primary/20 bg-muted/20 p-3 transition-colors cursor-pointer",
          "hover:bg-muted/40 hover:border-l-primary/50",
        )}
        onClick={() => setOpen(true)}
      >
        <div className="shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">New Beat</p>
          <p className="text-xs text-muted-foreground">
            Add a timestamped event to this scene
          </p>
        </div>
      </div>
      <BeatDialogContent
        mode="create"
        sceneId={sceneId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function CreateBeatInlineButton({ sceneId }: { sceneId: string }) {
  return (
    <InlineCreateButton label="New Beat">
      {(open, setOpen) => (
        <BeatDialogContent
          mode="create"
          sceneId={sceneId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </InlineCreateButton>
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
    <EditIconButton label="Edit beat">
      {(open, setOpen) => (
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
    </EditIconButton>
  );
}

// ============================================================================
// Utils
// ============================================================================

export function InteractiveContainer({
  children,
  stopPropagation = false,
}: {
  children: ReactNode;
  stopPropagation?: boolean;
}) {
  return (
    <div onMouseEnter={(e) => stopPropagation && e.stopPropagation()}>
      {children}
    </div>
  );
}
