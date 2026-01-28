"use client";

import {
  CampaignForm,
  type CampaignFormData,
} from "@/components/ui/custom/forms/CampaignForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteCampaign,
  updateCampaign,
} from "@/app/(app)/campaigns/actions";
import { updateCampaignSettings } from "@/app/(app)/campaigns/[id]/edit/actions";
import {
  BackgroundSettingsCard,
  type CampaignSettings,
  DEFAULT_SETTINGS,
} from "./BackgroundSettingsCard";
import { DangerZoneCard } from "./DangerZoneCard";

interface EditCampaignDialogProps {
  campaignId: string;
  initialData: CampaignFormData;
  initialSettings: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditCampaignDialog({
  campaignId,
  initialData,
  initialSettings,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditCampaignDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPendingUpdate, startUpdateTransition] = useTransition();
  const [isPendingSettings, startSettingsTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState<CampaignSettings>(() => {
    if (!initialSettings) return DEFAULT_SETTINGS;

    return {
      bg: {
        opacity: initialSettings.bgOpacity ?? DEFAULT_SETTINGS.bg.opacity,
        blur: initialSettings.bgBlur ?? DEFAULT_SETTINGS.bg.blur,
        expandToSidebar:
          initialSettings.bgExpandToSidebar ??
          DEFAULT_SETTINGS.bg.expandToSidebar,
        expandToHeader:
          initialSettings.bgExpandToHeader ??
          DEFAULT_SETTINGS.bg.expandToHeader,
      },
      header: {
        bgOpacity:
          initialSettings.headerBgOpacity ?? DEFAULT_SETTINGS.header.bgOpacity,
        blur: initialSettings.headerBlur ?? DEFAULT_SETTINGS.header.blur,
      },
      sidebar: {
        bgOpacity:
          initialSettings.sidebarBgOpacity ??
          DEFAULT_SETTINGS.sidebar.bgOpacity,
        blur: initialSettings.sidebarBlur ?? DEFAULT_SETTINGS.sidebar.blur,
      },
      card: {
        bgOpacity:
          initialSettings.cardBgOpacity ?? DEFAULT_SETTINGS.card.bgOpacity,
        blur: initialSettings.cardBlur ?? DEFAULT_SETTINGS.card.blur,
      },
    };
  });

  // Apply settings live for preview
  useEffect(() => {
    if (!open) return;

    document.documentElement.style.setProperty(
      "--campaign-bg-opacity",
      settings.bg.opacity.toString(),
    );
    document.documentElement.style.setProperty(
      "--campaign-bg-blur",
      `${settings.bg.blur}px`,
    );
    document.documentElement.style.setProperty(
      "--campaign-header-bg-opacity",
      settings.header.bgOpacity.toString(),
    );
    document.documentElement.style.setProperty(
      "--campaign-header-blur",
      `${settings.header.blur}px`,
    );
    document.documentElement.style.setProperty(
      "--campaign-sidebar-bg-opacity",
      settings.sidebar.bgOpacity.toString(),
    );
    document.documentElement.style.setProperty(
      "--campaign-sidebar-blur",
      `${settings.sidebar.blur}px`,
    );
    document.documentElement.style.setProperty(
      "--campaign-bg-expand-to-sidebar",
      settings.bg.expandToSidebar ? "1" : "0",
    );
    document.documentElement.style.setProperty(
      "--campaign-bg-expand-to-header",
      settings.bg.expandToHeader ? "1" : "0",
    );
    document.documentElement.style.setProperty(
      "--campaign-card-bg-opacity",
      settings.card.bgOpacity.toString(),
    );
    document.documentElement.style.setProperty(
      "--campaign-card-blur",
      `${settings.card.blur}px`,
    );
  }, [settings, open]);

  const handleUpdateCampaign = async (data: CampaignFormData) => {
    try {
      await updateCampaign(campaignId, {
        name: data.name,
        description: data.description || "",
        image: data.image || "",
        backgroundImage: data.backgroundImage || "",
      });
      toast.success("Campaign updated successfully!");
      startUpdateTransition(() => {
        router.refresh();
        setOpen(false);
      });
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      toast.error(error.message || "Failed to update campaign");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateCampaignSettings(campaignId, {
        bgOpacity: settings.bg.opacity,
        bgBlur: settings.bg.blur,
        bgExpandToSidebar: settings.bg.expandToSidebar,
        bgExpandToHeader: settings.bg.expandToHeader,
        headerBgOpacity: settings.header.bgOpacity,
        headerBlur: settings.header.blur,
        sidebarBgOpacity: settings.sidebar.bgOpacity,
        sidebarBlur: settings.sidebar.blur,
        cardBgOpacity: settings.card.bgOpacity,
        cardBlur: settings.card.blur,
      });
      toast.success("Background settings saved");
      startSettingsTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Failed to save settings");
    }
  };

  const handleDeleteCampaign = async () => {
    setIsDeleting(true);
    try {
      await deleteCampaign(campaignId);
      toast.success("Campaign deleted successfully");
      setShowDeleteDialog(false);
      setOpen(false);
      router.push("/campaigns");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast.error(error.message || "Failed to delete campaign");
      setShowDeleteDialog(false);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl">Edit Campaign</DialogTitle>
            <DialogDescription>
              Update your campaign details and background settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Campaign Form */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Update your campaign name, description, and images.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampaignForm
                  initialData={initialData}
                  onSubmit={handleUpdateCampaign}
                  isLoading={isPendingUpdate}
                  submitText="Update Campaign"
                  onImageChange={(url) => {
                    document.documentElement.style.setProperty(
                      "--campaign-preview-image",
                      `url(${url})`,
                    );
                  }}
                  onBackgroundImageChange={(url) => {
                    document.documentElement.style.setProperty(
                      "--campaign-preview-bg-image",
                      `url(${url})`,
                    );
                  }}
                />
              </CardContent>
            </Card>

            <BackgroundSettingsCard
              settings={settings}
              onSettingsChange={setSettings}
              onSave={handleSaveSettings}
              isPending={isPendingSettings}
            />

            <DangerZoneCard onDeleteClick={() => setShowDeleteDialog(true)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot
              be undone and will delete all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
