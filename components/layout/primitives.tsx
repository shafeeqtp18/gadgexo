import { cn } from "@/lib/utils/cn";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container", className)} {...props} />;
}

export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-12 sm:py-16", className)} {...props} />;
}

const gapClasses = { sm: "gap-2", md: "gap-4", lg: "gap-6", xl: "gap-8" } as const;

export function Stack({
  gap = "md",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { gap?: keyof typeof gapClasses }) {
  return <div className={cn("flex flex-col", gapClasses[gap], className)} {...props} />;
}

export function Inline({
  gap = "md",
  wrap = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { gap?: keyof typeof gapClasses; wrap?: boolean }) {
  return (
    <div className={cn("flex items-center", gapClasses[gap], wrap && "flex-wrap", className)} {...props} />
  );
}

const gridColsClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
} as const;

export function Grid({
  cols = 3,
  gap = "md",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { cols?: keyof typeof gridColsClasses; gap?: keyof typeof gapClasses }) {
  return <div className={cn("grid", gridColsClasses[cols], gapClasses[gap], className)} {...props} />;
}
