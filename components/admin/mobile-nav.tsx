"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/overlays/sheet";
import { AdminSidebar } from "./sidebar";

export function AdminMobileNav({ userName, role }: { userName: string | null; role: string | null }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
      <p className="text-small font-semibold">GadGexo Admin</p>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm"><Menu className="h-4 w-4" aria-hidden="true" /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4"><SheetTitle>Menu</SheetTitle></SheetHeader>
          <div onClick={() => setOpen(false)}>
            <AdminSidebar userName={userName} role={role} className="flex w-full border-none" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
