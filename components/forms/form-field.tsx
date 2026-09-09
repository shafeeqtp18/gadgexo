import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils/cn";

export interface FormFieldProps {
  id: string;
  label: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

/**
 * Wires up label htmlFor, aria-describedby (helper and/or error), and
 * aria-invalid on the child control automatically — callers just pass
 * <Input id="email" /> etc. as children instead of repeating this wiring.
 */
export function FormField({ id, label, helperText, errorText, required, children, className }: FormFieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-error"> *</span>}
      </Label>
      {React.cloneElement(children, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(errorText) || undefined,
        invalid: Boolean(errorText) || undefined,
      })}
      {helperText && !errorText && (
        <p id={helperId} className="text-caption text-muted-foreground">{helperText}</p>
      )}
      {errorText && (
        <p id={errorId} role="alert" className="text-caption text-error">{errorText}</p>
      )}
    </div>
  );
}
