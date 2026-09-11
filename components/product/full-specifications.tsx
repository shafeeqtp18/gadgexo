"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { formatSpecValue } from "@/lib/catalogue/spec-format";
import type { DetailSpecGroup } from "@/lib/db/product-detail";

export function FullSpecifications({
  specGroups,
}: {
  specGroups: DetailSpecGroup[];
}) {
  if (specGroups.length === 0) {
    return null;
  }

  const firstGroup = specGroups[0];

  return (
    <div>
      <h2 className="mb-3 text-h3">Full Specifications</h2>

      <Accordion
        type="multiple"
        defaultValue={firstGroup ? [firstGroup.id] : []}
      >
        {specGroups.map((group) => (
          <AccordionItem key={group.id} value={group.id}>
            <AccordionTrigger>{group.name}</AccordionTrigger>

            <AccordionContent>
              <dl className="flex flex-col divide-y divide-border">
                {group.specs.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex items-center justify-between gap-4 py-2"
                  >
                    <dt className="text-small text-muted-foreground">
                      {spec.name}
                    </dt>

                    <dd className="flex items-center gap-2 text-small font-medium">
                      {formatSpecValue(spec.value, spec.unit)}

                      {spec.verification_status === "conflicting" && (
                        <span
                          className="text-caption font-normal text-warning"
                          title="Sources disagree on this value"
                        >
                          ⚠
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
