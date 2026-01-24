"use client";

import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { useState, type ReactNode } from "react";

export type EditIconButtonProps = {
  label: string;
  childrenAction: (open: boolean, setOpen: (o: boolean) => void) => ReactNode;
  className?: string;
};

export function EditIconButton({
  label,
  childrenAction,
  className = "h-7 w-7",
}: EditIconButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">{label}</span>
      </Button>
      {childrenAction(open, setOpen)}
    </>
  );
}
