"use client";

import {
  Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,
} from "@/components/feedback/toast";
import { useToast } from "@/lib/hooks/use-toast";

export function Toaster() {
  const { toasts, remove } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, open }) => (
        <Toast key={id} variant={variant} open={open} onOpenChange={(o) => !o && remove(id)}>
          <div className="flex-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
