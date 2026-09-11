"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DealSort } from "@/lib/db/deals";

const OPTIONS: { value: DealSort; label: string }[] = [
  { value: "recent", label: "Recently Updated" },
  { value: "biggest-drop", label: "Biggest Price Drop" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export function DealsSortSelect({ sort }: { sort: DealSort }) {
  const router = useRouter();
  return (
    <Select value={sort} onValueChange={(value) => router.push(`/deals?sort=${value}`)}>
      <SelectTrigger className="w-[200px]" aria-label="Sort deals">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
