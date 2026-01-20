"use client";

import ActForm, { type ActFormData } from "@/components/forms/ActForm";
import BeatForm, { type BeatFormData } from "@/components/forms/BeatForm";
import SceneForm, { type SceneFormData } from "@/components/forms/SceneForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BookOpen, Clock, Edit2, Plus, Theater } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createAct,
  createBeat,
  createScene,
  updateAct,
  updateBeat,
  updateScene,
} from "./actions";

// #region Constants & Helpers
const DIALOG_LG = "max-w-2xl max-h-[90vh] overflow-y-auto";
const DIALOG_MD = "max-w-lg";
const INLINE_BUTTON_CLASS = "h-8 px-2 text-xs";
const ICON_BUTTON_CLASS = "h-9 w-9";
const ICON_BUTTON_SM_CLASS = "h-8 w-8";
const ICON_BUTTON_XS_CLASS = "h-7 w-7";
const INLINE_ICON_CLASS = "mr-1 h-3.5 w-3.5";

const dialogCopy = {
  act: {
    createTitle: "New Act",
    createDescription:
      "Define the major narrative sections of your campaign. Acts help structure your story into major sections.",
    editTitle: "Edit Act",
    editDescription: "Update the act details and content.",
  },
  scene: {
    createTitle: "New Scene",
    createDescription:
      "Create a scene within this act. Scenes represent specific events or moments in your story.",
    editTitle: "Edit Scene",
    editDescription: "Update the scene details and content.",
  },
  beat: {
    createTitle: "New Beat",
    createDescription: "Add a timestamped beat to track events in this scene.",
    editTitle: "Edit Beat",
    editDescription: "Update the timestamp or text for this beat.",
  },
};

const toastCopy = {
  actCreated: "Act created successfully!",
  actUpdated: "Act updated successfully!",
  sceneCreated: "Scene created successfully!",
  sceneUpdated: "Scene updated successfully!",
  beatCreated: "Beat created successfully!",
  beatUpdated: "Beat updated successfully!",
  actCreateError: "Failed to create act",
  actUpdateError: "Failed to update act",
  sceneCreateError: "Failed to create scene",
  sceneUpdateError: "Failed to update scene",
  beatCreateError: "Failed to create beat",
  beatUpdateError: "Failed to update beat",
};

const toDateTimeLocalValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const buildFormData = (values: Record<string, string | null | undefined>) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

const DialogShell = ({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  className: string;
  children: React.ReactNode;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={className}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
// #endregion

// #region Empty State
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
            Create your first act to get started organizing your story. Acts
            help structure your narrative into major sections.
          </p>
        </div>
        <CreateActButton campaignId={campaignId} />
      </div>
    </CardContent>
  );
}
// #endregion

// #region Act Dialogs & Buttons
function CreateActDialog({
  campaignId,
  open,
  onOpenChange,
}: {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const closeAndRefresh = () =>
    startTransition(() => {
      router.refresh();
      onOpenChange(false);
    });

  const handleCreateAct = async (data: ActFormData) => {
    try {
      const formData = buildFormData({
        name: data.name,
        content: data.content,
      });
      await createAct(campaignId, formData, false);
      toast.success(toastCopy.actCreated);
      closeAndRefresh();
    } catch (error: any) {
      console.error("Error creating act:", error);
      toast.error(error.message || toastCopy.actCreateError);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={dialogCopy.act.createTitle}
      description={dialogCopy.act.createDescription}
      className={DIALOG_LG}
    >
      <ActForm
        onSubmit={handleCreateAct}
        isLoading={isPending}
        submitText="Create Act"
      />
    </DialogShell>
  );
}

function EditActDialog({
  actId,
  campaignId,
  initialData,
  open,
  onOpenChange,
}: {
  actId: string;
  campaignId: string;
  initialData: { name: string; content?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const closeAndRefresh = () =>
    startTransition(() => {
      router.refresh();
      onOpenChange(false);
    });

  const handleUpdateAct = async (data: ActFormData) => {
    try {
      const formData = buildFormData({
        name: data.name,
        content: data.content,
      });
      await updateAct(actId, formData, false);
      toast.success(toastCopy.actUpdated);
      closeAndRefresh();
    } catch (error: any) {
      console.error("Error updating act:", error);
      toast.error(error.message || toastCopy.actUpdateError);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={dialogCopy.act.editTitle}
      description={dialogCopy.act.editDescription}
      className={DIALOG_LG}
    >
      <ActForm
        initialData={initialData}
        onSubmit={handleUpdateAct}
        isLoading={isPending}
        submitText="Update Act"
      />
    </DialogShell>
  );
}

export function CreateActCard({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(
          "border-0 border-l-4 border-l-primary/20 transition-all cursor-pointer bg-muted/20",
          "hover:shadow-lg hover:bg-muted/40 hover:border-l-primary/50",
          "border-dashed",
        )}
        onClick={() => setOpen(true)}
      >
        <CardHeader className="py-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Theater className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl leading-tight text-muted-foreground">
                New Act
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a new act to organize your story
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      <CreateActDialog
        campaignId={campaignId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function CreateActButton({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className={ICON_BUTTON_CLASS}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Act</span>
          </Button>
        </DialogTrigger>
        <CreateActDialog
          campaignId={campaignId}
          open={open}
          onOpenChange={setOpen}
        />
      </Dialog>
    </>
  );
}

export function CreateActInlineButton({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={INLINE_BUTTON_CLASS}>
          <Plus className={INLINE_ICON_CLASS} />
          New Act
        </Button>
      </DialogTrigger>
      <CreateActDialog
        campaignId={campaignId}
        open={open}
        onOpenChange={setOpen}
      />
    </Dialog>
  );
}

export function EditActButton({
  actId,
  campaignId,
  initialData,
}: {
  actId: string;
  campaignId: string;
  initialData: { name: string; content?: string | null };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <EditActDialog
        actId={actId}
        campaignId={campaignId}
        initialData={{
          name: initialData.name,
          content: initialData.content ?? undefined,
        }}
        open={open}
        onOpenChange={setOpen}
      />
      <Button
        variant="ghost"
        size="icon"
        className={ICON_BUTTON_CLASS}
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Edit act</span>
      </Button>
    </>
  );
}
// #endregion

// #region Scene Dialogs & Buttons
function CreateSceneDialog({
  actId,
  campaignId,
  open,
  onOpenChange,
}: {
  actId: string;
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const closeAndRefresh = () =>
    startTransition(() => {
      router.refresh();
      onOpenChange(false);
    });

  const handleCreateScene = async (data: SceneFormData) => {
    try {
      const formData = buildFormData({
        name: data.name,
        content: data.content,
      });
      await createScene(actId, formData, false);
      toast.success(toastCopy.sceneCreated);
      closeAndRefresh();
    } catch (error: any) {
      console.error("Error creating scene:", error);
      toast.error(error.message || toastCopy.sceneCreateError);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={dialogCopy.scene.createTitle}
      description={dialogCopy.scene.createDescription}
      className={DIALOG_LG}
    >
      <SceneForm
        onSubmit={handleCreateScene}
        isLoading={isPending}
        submitText="Create Scene"
      />
    </DialogShell>
  );
}

function EditSceneDialog({
  sceneId,
  actId,
  campaignId,
  initialData,
  open,
  onOpenChange,
}: {
  sceneId: string;
  actId: string;
  campaignId: string;
  initialData: { name: string; content?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const closeAndRefresh = () =>
    startTransition(() => {
      router.refresh();
      onOpenChange(false);
    });

  const handleUpdateScene = async (data: SceneFormData) => {
    try {
      const formData = buildFormData({
        name: data.name,
        content: data.content,
      });
      await updateScene(sceneId, formData, false);
      toast.success(toastCopy.sceneUpdated);
      closeAndRefresh();
    } catch (error: any) {
      console.error("Error updating scene:", error);
      toast.error(error.message || toastCopy.sceneUpdateError);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={dialogCopy.scene.editTitle}
      description={dialogCopy.scene.editDescription}
      className={DIALOG_LG}
    >
      <SceneForm
        initialData={initialData}
        onSubmit={handleUpdateScene}
        isLoading={isPending}
        submitText="Update Scene"
      />
    </DialogShell>
  );
}

function EditBeatDialog({
  beatId,
  initialData,
  open,
  onOpenChange,
}: {
  beatId: string;
  initialData: { text: string; timestamp: Date };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const closeAndRefresh = () =>
    startTransition(() => {
      router.refresh();
      onOpenChange(false);
    });

  const handleUpdateBeat = async (data: BeatFormData) => {
    try {
      const formData = buildFormData({
        text: data.text,
        timestamp: new Date(data.timestamp).toISOString(),
      });
      await updateBeat(beatId, formData, false);
      toast.success(toastCopy.beatUpdated);
      closeAndRefresh();
    } catch (error: any) {
      console.error("Error updating beat:", error);
      toast.error(error.message || toastCopy.beatUpdateError);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={dialogCopy.beat.editTitle}
      description={dialogCopy.beat.editDescription}
      className={DIALOG_MD}
    >
      <BeatForm
        initialData={{
          text: initialData.text,
          timestamp: toDateTimeLocalValue(initialData.timestamp),
        }}
        onSubmit={handleUpdateBeat}
        isLoading={isPending}
        submitText="Update Beat"
      />
    </DialogShell>
  );
}

export function CreateSceneCard({
  actId,
  campaignId,
}: {
  actId: string;
  campaignId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(
          "border-0 border-l-3 border-l-primary/20 transition-all cursor-pointer bg-muted/20",
          "hover:shadow-md hover:bg-muted/40 hover:border-l-primary/50",
          "border-dashed",
        )}
        onClick={() => setOpen(true)}
      >
        <CardHeader className="py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base leading-tight text-muted-foreground">
                New Scene
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Create a new scene in this act
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      <CreateSceneDialog
        actId={actId}
        campaignId={campaignId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function CreateSceneInlineButton({
  actId,
  campaignId,
}: {
  actId: string;
  campaignId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={INLINE_BUTTON_CLASS}>
          <Plus className={INLINE_ICON_CLASS} />
          New Scene
        </Button>
      </DialogTrigger>
      <CreateSceneDialog
        actId={actId}
        campaignId={campaignId}
        open={open}
        onOpenChange={setOpen}
      />
    </Dialog>
  );
}
// #endregion

// #region Beat Dialogs & Buttons
function CreateBeatDialog({
  sceneId,
  campaignId,
  open,
  onOpenChange,
}: {
  sceneId: string;
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const closeAndRefresh = () =>
    startTransition(() => {
      router.refresh();
      onOpenChange(false);
    });

  const handleCreateBeat = async (data: BeatFormData) => {
    try {
      const formData = buildFormData({
        text: data.text,
        timestamp: new Date(data.timestamp).toISOString(),
      });
      await createBeat(sceneId, formData, false);
      toast.success(toastCopy.beatCreated);
      closeAndRefresh();
    } catch (error: any) {
      console.error("Error creating beat:", error);
      toast.error(error.message || toastCopy.beatCreateError);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={dialogCopy.beat.createTitle}
      description={dialogCopy.beat.createDescription}
      className={DIALOG_MD}
    >
      <BeatForm
        onSubmit={handleCreateBeat}
        isLoading={isPending}
        submitText="Create Beat"
      />
    </DialogShell>
  );
}

export function CreateBeatCard({
  sceneId,
  campaignId,
}: {
  sceneId: string;
  campaignId: string;
}) {
  const [open, setOpen] = useState(false);

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
      <CreateBeatDialog
        sceneId={sceneId}
        campaignId={campaignId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function CreateBeatInlineButton({
  sceneId,
  campaignId,
}: {
  sceneId: string;
  campaignId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={INLINE_BUTTON_CLASS}>
          <Plus className={INLINE_ICON_CLASS} />
          New Beat
        </Button>
      </DialogTrigger>
      <CreateBeatDialog
        sceneId={sceneId}
        campaignId={campaignId}
        open={open}
        onOpenChange={setOpen}
      />
    </Dialog>
  );
}
// #endregion

// #region Edit Buttons
export function EditSceneButton({
  sceneId,
  actId,
  campaignId,
  initialData,
}: {
  sceneId: string;
  actId: string;
  campaignId: string;
  initialData: { name: string; content?: string | null };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={ICON_BUTTON_SM_CLASS}
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Edit scene</span>
      </Button>
      <EditSceneDialog
        sceneId={sceneId}
        actId={actId}
        campaignId={campaignId}
        initialData={{
          name: initialData.name,
          content: initialData.content ?? undefined,
        }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function EditBeatButton({
  beatId,
  initialData,
}: {
  beatId: string;
  initialData: { text: string; timestamp: Date };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={ICON_BUTTON_XS_CLASS}
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-3.5 w-3.5" />
        <span className="sr-only">Edit beat</span>
      </Button>
      <EditBeatDialog
        beatId={beatId}
        initialData={initialData}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
// #endregion

// #region Interactive Wrapper
// Client-side wrapper for interactive hover behavior
export function InteractiveContainer({
  children,
  stopPropagation = false,
}: {
  children: React.ReactNode;
  stopPropagation?: boolean;
}) {
  return (
    <div
      className=""
      onMouseEnter={(e) => {
        if (stopPropagation) {
          e.stopPropagation();
        }
      }}
    >
      {children}
    </div>
  );
}
// #endregion
