"use client";

import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/custom/rich-text/RichTextEditor";
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

interface CampaignData {
  name: string;
  description: string;
  image: string;
  backgroundImage: string;
}

interface EditCampaignFieldProps {
  campaignId: string;
  currentData: {
    name: string;
    description: string | null;
    image: string | null;
    backgroundImage: string | null;
  };
  field: "name" | "description";
  onUpdate: (campaignId: string, data: CampaignData) => Promise<void>;
  buttonClassName?: string;
}

export function EditCampaignField({
  campaignId,
  currentData,
  field,
  onUpdate,
  buttonClassName,
}: EditCampaignFieldProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    field === "name" ? currentData.name : currentData.description || "",
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: CampaignData = {
        name: field === "name" ? value : currentData.name,
        description:
          field === "description" ? value : currentData.description || "",
        image: currentData.image || "",
        backgroundImage: currentData.backgroundImage || "",
      };

      await onUpdate(campaignId, updateData);

      toast.success(
        field === "name"
          ? "Campaign name updated"
          : "Campaign description updated",
      );

      startTransition(() => {
        router.refresh();
        setOpen(false);
      });
    } catch (error: any) {
      console.error(`Error updating campaign ${field}:`, error);
      toast.error(error.message || `Failed to update campaign ${field}`);
    }
  };

  const isName = field === "name";

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={buttonClassName}
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">
          {isName ? "Edit campaign name" : "Edit campaign description"}
        </span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={isName ? undefined : "max-w-3xl"}>
          <DialogHeader>
            <DialogTitle>
              {isName ? "Edit Campaign Name" : "Edit Overview"}
            </DialogTitle>
            <DialogDescription>
              {isName
                ? "Update the name of your campaign."
                : "Update your campaign overview description."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {isName ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter campaign name"
                    required
                  />
                </div>
              ) : (
                <RichTextEditor
                  content={value}
                  onChange={setValue}
                  placeholder="Enter campaign description..."
                  className="h-96"
                />
              )}
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
