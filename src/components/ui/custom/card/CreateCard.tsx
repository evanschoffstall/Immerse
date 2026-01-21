import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type CreateCardVariant = "lg" | "md" | "sm";

const VARIANT_STYLES: Record<
  CreateCardVariant,
  {
    border: string;
    iconSize: string;
    boxSize: string;
    titleSize: string;
    gap: string;
    shadow: string;
    descSize: string;
  }
> = {
  lg: {
    border: "border-l-4",
    iconSize: "h-6 w-6",
    boxSize: "h-12 w-12 rounded-xl",
    titleSize: "text-xl",
    gap: "gap-4",
    shadow: "hover:shadow-lg",
    descSize: "text-sm",
  },
  md: {
    border: "border-l-3",
    iconSize: "h-4 w-4",
    boxSize: "h-9 w-9 rounded-lg",
    titleSize: "text-base",
    gap: "gap-3",
    shadow: "hover:shadow-md",
    descSize: "text-xs",
  },
  sm: {
    border: "border-l-2",
    iconSize: "h-3.5 w-3.5",
    boxSize: "h-8 w-8 rounded-md",
    titleSize: "text-sm",
    gap: "gap-3",
    shadow: "",
    descSize: "text-xs",
  },
};

export type CreateCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: CreateCardVariant;
  onClick?: () => void;
  className?: string;
};

export function CreateCard({
  icon: Icon,
  title,
  description,
  variant = "lg",
  onClick,
  className,
}: CreateCardProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <Card
      className={cn(
        `border-0 ${s.border} border-l-primary/20 transition-all cursor-pointer bg-muted/20 border-dashed`,
        `${s.shadow} hover:bg-muted/40 hover:border-l-primary/50`,
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="py-3">
        <div className={cn("flex items-center", s.gap)}>
          <div
            className={cn(
              "flex shrink-0 items-center justify-center bg-primary/10",
              s.boxSize,
            )}
          >
            <Icon className={cn(s.iconSize, "text-primary")} />
          </div>
          <div className="space-y-1">
            <CardTitle
              className={cn(s.titleSize, "leading-tight text-muted-foreground")}
            >
              {title}
            </CardTitle>
            <p className={cn(s.descSize, "text-muted-foreground")}>
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
