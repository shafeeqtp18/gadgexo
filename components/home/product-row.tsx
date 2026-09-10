import { cn } from "@/lib/utils/cn";

export function ProductRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        // Mobile: horizontal snap-scroll carousel. Desktop: real grid.
        "flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0",
        "lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ProductRowItem({ children }: { children: React.ReactNode }) {
  return <div className="w-[42vw] shrink-0 snap-start sm:w-auto">{children}</div>;
}
