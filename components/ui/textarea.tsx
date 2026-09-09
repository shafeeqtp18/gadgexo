import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-[96px] w-full rounded-md border border-input bg-surface px-3 py-2 text-body",
        "placeholder:text-muted-foreground focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-error focus-visible:outline-error",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
