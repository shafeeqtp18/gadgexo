import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-body",
        "placeholder:text-muted-foreground focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-error focus-visible:outline-error",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
