"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const sheetVariants = cva("fixed z-modal border-border bg-surface shadow-lg", {
  variants: {
    side: {
      // Mobile-first: bottom sheet by default; a side="right" instance
      // is how future desktop filter/cart panels would use this.
      bottom: "inset-x-0 bottom-0 rounded-t-lg border-t max-h-[85vh]",
      right: "inset-y-0 right-0 h-full w-full max-w-sm border-l",
    },
  },
  defaultVariants: { side: "bottom" },
});

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

export const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ side, className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-black/60" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), "p-6 focus-visible:outline-none", className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
SheetContent.displayName = "SheetContent";

export const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
));

SheetHeader.displayName = "SheetHeader";

export const SheetTitle = DialogPrimitive.Title;

export const SheetDescription = DialogPrimitive.Description;
