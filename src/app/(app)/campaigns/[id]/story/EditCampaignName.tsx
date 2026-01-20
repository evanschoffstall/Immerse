"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCampaign } from "../edit/actions";

interface EditCampaignNameProps {
  campaignId: string;
  currentName: string;
  currentDescription: string | null;
  currentImage: string | null;
  currentBackgroundImage: string | null;
}

export function EditCampaignName({
  campaignId,
  currentName,
  currentDescription,
  currentImage,
  currentBackgroundImage,
}: EditCampaignNameProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCampaign(campaignId, {
        name,
        description: currentDescription || "",
        image: currentImage || "",
        backgroundImage: currentBackgroundImage || "",
      });
      toast.success("Campaign name updated");
      startTransition(() => {
        router.refresh();
        setOpen(false);
      });
    } catch (error: any) {
      console.error("Error updating campaign name:", error);
      toast.error(error.message || "Failed to update campaign name");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Edit campaign name</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign Name</DialogTitle>
            <DialogDescription>
              Update the name of your campaign.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter campaign name"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
