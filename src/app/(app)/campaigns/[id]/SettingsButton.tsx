"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Settings } from "lucide-react";
import { useState } from "react";
import { EditCampaignDialog } from "./story/EditCampaignDialog";

interface SettingsButtonProps {
  campaignId: string;
  campaignName: string;
  campaignDescription: string | null;
  campaignImage: string | null;
  campaignBackgroundImage: string | null;
  campaignSettings: any;
}

export function SettingsButton({
  campaignId,
  campaignName,
  campaignDescription,
  campaignImage,
  campaignBackgroundImage,
  campaignSettings,
}: SettingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SidebarMenuButton onClick={() => setOpen(true)}>
        <Settings className="w-4 h-4" />
        <span>Settings</span>
      </SidebarMenuButton>
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
