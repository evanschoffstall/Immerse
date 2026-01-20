"use client";

import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { EditCampaignDialog } from "./EditCampaignDialog";

interface EditCampaignDialogButtonProps {
  campaignId: string;
  campaignName: string;
  campaignDescription: string | null;
  campaignImage: string | null;
  campaignBackgroundImage: string | null;
  campaignSettings: any;
}

export function EditCampaignDialogButton({
  campaignId,
  campaignName,
  campaignDescription,
  campaignImage,
  campaignBackgroundImage,
  campaignSettings,
}: EditCampaignDialogButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Edit campaign</span>
      </Button>
      <EditCampaignDialog
        campaignId={campaignId}
        initialData={{
          name: campaignName,
          description: campaignDescription || "",
          image: campaignImage || "",
          backgroundImage: campaignBackgroundImage || "",
        }}
        initialSettings={campaignSettings}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
