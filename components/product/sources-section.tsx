import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { DetailSource } from "@/lib/db/product-detail";

export function SourcesSection({ sources }: { sources: DetailSource[] }) {
  if (sources.length === 0) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="sources">
        <AccordionTrigger>Data Sources ({sources.length})</AccordionTrigger>
        <AccordionContent>
          <ul className="flex flex-col gap-2">
            {sources.map((source) => (
              <li key={source.id} className="text-small text-muted-foreground">
                <span className="font-medium text-foreground">{source.name}</span>
                {" — "}
                {source.source_type}
                {source.domain && ` (${source.domain})`}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-caption text-muted-foreground">
            Specifications and prices on this page are attributed to the sources above where recorded.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
