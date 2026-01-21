import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type SectionIconSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
  SectionIconSize,
  { container: string; icon: string }
> = {
  sm: {
    container: "h-6 w-6 rounded-md",
    icon: "h-3 w-3",
  },
  md: {
    container: "h-8 w-8 rounded-lg",
    icon: "h-4 w-4",
  },
  lg: {
    container: "h-12 w-12 rounded-xl",
    icon: "h-6 w-6",
  },
};

export type SectionIconProps = {
  icon: LucideIcon;
  size?: SectionIconSize;
  className?: string;
};

export function SectionIcon({
  icon: Icon,
  size = "lg",
  className,
}: SectionIconProps) {
  const s = SIZE_STYLES[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-primary/10",
        s.container,
        className,
      )}
    >
      <Icon className={cn(s.icon, "text-primary")} />
    </div>
  );
}
