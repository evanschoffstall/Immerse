"use client";

import {
  CampaignForm,
  type CampaignFormData,
} from "@/components/ui/custom/forms/CampaignForm";
import { generateSlug } from "@/lib/utils/slug";
import { useState } from "react";
import { toast } from "sonner";
import { createCampaign } from "../actions";

export default function NewCampaignClient() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCampaign = async (data: CampaignFormData) => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("slug", generateSlug(data.name));
      if (data.description) formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);
      if (data.backgroundImage)
        formData.append("backgroundImage", data.backgroundImage);

      await createCampaign(formData);
      // createCampaign redirects automatically, no need for router.push
      toast.success("Campaign created successfully!");
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error(error.message || "Failed to create campaign");
      setIsCreating(false);
    }
  };

  return (
    <CampaignForm
      onSubmit={handleCreateCampaign}
      isLoading={isCreating}
      submitText="Create Campaign"
    />
  );
}
