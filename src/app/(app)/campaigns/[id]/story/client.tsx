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
import { useState } from "react";
import { toast } from "sonner";
import { createAct, createBeat, createScene, updateAct, updateScene } from "./actions";

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

function CreateActDialog({
  campaignId,
  open,
  onOpenChange,
}: {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateAct = async (data: ActFormData) => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.content) formData.append("content", data.content);

      await createAct(campaignId, formData, false);
      toast.success("Act created successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error creating act:", error);
      toast.error(error.message || "Failed to create act");
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Act</DialogTitle>
          <DialogDescription>
            Define the major narrative sections of your campaign. Acts help
            structure your story into major sections.
          </DialogDescription>
        </DialogHeader>
        <ActForm
          onSubmit={handleCreateAct}
          isLoading={isCreating}
          submitText="Create Act"
        />
      </DialogContent>
    </Dialog>
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
  initialData: { name: string; content?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdateAct = async (data: ActFormData) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.content) formData.append("content", data.content);

      await updateAct(actId, formData, false);
      toast.success("Act updated successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating act:", error);
      toast.error(error.message || "Failed to update act");
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Act</DialogTitle>
          <DialogDescription>
            Update the act details and content.
          </DialogDescription>
        </DialogHeader>
        <ActForm
          initialData={initialData}
          onSubmit={handleUpdateAct}
          isLoading={isUpdating}
          submitText="Update Act"
        />
      </DialogContent>
    </Dialog>
  );
}

export function CreateActCard({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden transition-all cursor-pointer",
          "hover:shadow-lg hover:border-primary/50",
          "border-dashed",
        )}
        onClick={() => setOpen(true)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Theater className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl leading-tight text-muted-foreground">
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
          <Button size="icon" className="h-9 w-9">
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
        initialData={initialData}
        open={open}
        onOpenChange={setOpen}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Edit act</span>
      </Button>
    </>
  );
}

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
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateScene = async (data: SceneFormData) => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.content) formData.append("content", data.content);

      await createScene(actId, formData, false);
      toast.success("Scene created successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error creating scene:", error);
      toast.error(error.message || "Failed to create scene");
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Scene</DialogTitle>
          <DialogDescription>
            Create a scene within this act. Scenes represent specific events or
            moments in your story.
          </DialogDescription>
        </DialogHeader>
        <SceneForm
          onSubmit={handleCreateScene}
          isLoading={isCreating}
          submitText="Create Scene"
        />
      </DialogContent>
    </Dialog>
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
  initialData: { name: string; content?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdateScene = async (data: SceneFormData) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.content) formData.append("content", data.content);

      await updateScene(sceneId, formData, false);
      toast.success("Scene updated successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating scene:", error);
      toast.error(error.message || "Failed to update scene");
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Scene</DialogTitle>
          <DialogDescription>
            Update the scene details and content.
          </DialogDescription>
        </DialogHeader>
        <SceneForm
          initialData={initialData}
          onSubmit={handleUpdateScene}
          isLoading={isUpdating}
          submitText="Update Scene"
        />
      </DialogContent>
    </Dialog>
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
          "border-l-4 border-l-primary/20 transition-all cursor-pointer",
          "hover:shadow-md hover:border-primary/40",
          "border-dashed",
        )}
        onClick={() => setOpen(true)}
      >
        <CardHeader className="pb-3">
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
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateBeat = async (data: BeatFormData) => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("text", data.text);
      formData.append("timestamp", data.timestamp);

      await createBeat(sceneId, formData, false);
      toast.success("Beat created successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error creating beat:", error);
      toast.error(error.message || "Failed to create beat");
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Beat</DialogTitle>
          <DialogDescription>
            Add a timestamped beat to track events in this scene.
          </DialogDescription>
        </DialogHeader>
        <BeatForm
          onSubmit={handleCreateBeat}
          isLoading={isCreating}
          submitText="Create Beat"
        />
      </DialogContent>
    </Dialog>
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
          "group relative flex gap-3 rounded-lg border-l-2 border-dashed border-border bg-muted/20 p-3 transition-colors cursor-pointer",
          "hover:bg-muted/40 hover:border-primary/50",
        )}
        onClick={() => setOpen(true)}
      >
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
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
        className="h-8 w-8"
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Edit scene</span>
      </Button>
      <EditSceneDialog
        sceneId={sceneId}
        actId={actId}
        campaignId={campaignId}
        initialData={initialData}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
