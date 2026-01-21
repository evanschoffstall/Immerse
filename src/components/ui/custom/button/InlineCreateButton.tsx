"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

export type InlineCreateButtonProps = {
  label: string;
  childrenAction: (open: boolean, setOpen: (o: boolean) => void) => ReactNode;
  className?: string;
};

export function InlineCreateButton({
  label,
  childrenAction,
  className = "h-7 w-7",
}: InlineCreateButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DialogTrigger>
      {childrenAction(open, setOpen)}
    </Dialog>
  );
}
