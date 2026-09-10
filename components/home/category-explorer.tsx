import Link from "next/link";
import { Smartphone, Tablet, Laptop, Watch, Headphones, Speaker, Camera, Gamepad2, type LucideIcon } from "lucide-react";
import { Container, Section } from "@/components/layout/primitives";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface CategoryEntry {
  label: string;
  icon: LucideIcon;
  href?: string; // present only for categories that actually exist
}

const CATEGORIES: CategoryEntry[] = [
  { label: "Smartphones", icon: Smartphone, href: "/smartphones" },
  { label: "Tablets", icon: Tablet },
  { label: "Laptops", icon: Laptop },
  { label: "Smartwatches", icon: Watch },
  { label: "Earbuds", icon: Headphones },
  { label: "Headphones", icon: Speaker },
  { label: "Cameras", icon: Camera },
  { label: "Gaming", icon: Gamepad2 },
];

export function CategoryExplorer() {
  return (
    <Section className="py-10 sm:py-12">
      <Container>
        <h2 className="mb-6 text-h2">Browse by Category</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const content = (
              <div
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors duration-fast",
                  category.href ? "hover:border-primary/40 hover:bg-surface-elevated" : "opacity-60",
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <span className="text-caption font-medium">{category.label}</span>
                {!category.href && <Badge variant="default" className="mt-1">Coming soon</Badge>}
              </div>
            );

            return category.href ? (
              <Link key={category.label} href={category.href}>{content}</Link>
            ) : (
              <div key={category.label} aria-disabled="true">{content}</div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
