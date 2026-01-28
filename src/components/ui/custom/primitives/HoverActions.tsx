import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type HoverActionsProps = {
  children: ReactNode;
  className?: string;
  showOnHover?: string;
};

export function HoverActions({
  children,
  className,
  showOnHover,
}: HoverActionsProps) {
  return (
    <div
      className={cn(
        "opacity-0 pointer-events-none transition-opacity flex items-center gap-2",
        showOnHover,
        className,
      )}
    >
      {children}
    </div>
  );
}
