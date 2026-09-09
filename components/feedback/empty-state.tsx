import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = SearchX, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-center", className)}>
      <Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h3 className="text-h3">{title}</h3>
      {description && <p className="max-w-sm text-small text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
