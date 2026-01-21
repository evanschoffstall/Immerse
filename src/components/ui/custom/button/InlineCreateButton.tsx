"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

export type InlineCreateButtonProps = {
  label: string;
  children: (open: boolean, setOpen: (o: boolean) => void) => ReactNode;
  className?: string;
};

export function InlineCreateButton({
  label,
  children,
  className = "h-8 px-2 text-xs",
}: InlineCreateButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          {label}
        </Button>
      </DialogTrigger>
      {children(open, setOpen)}
    </Dialog>
  );
}
