"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex h-5 w-9 items-center rounded-full bg-muted transition-colors duration-fast",
      "data-[state=checked]:bg-primary focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-fast",
        "data-[state=checked]:translate-x-[18px]",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
