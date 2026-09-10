import { Skeleton } from "@/components/feedback/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
