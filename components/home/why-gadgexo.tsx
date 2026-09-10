import { ShieldCheck, Link2, TrendingUp, GitCompare, RefreshCw, IndianRupee } from "lucide-react";
import { Container, Section, Grid } from "@/components/layout/primitives";

const PILLARS = [
  { icon: ShieldCheck, title: "Verified Specs", description: "Every spec is tracked with a verification status — never presented as fact without a source." },
  { icon: Link2, title: "Source-backed Data", description: "Product information is tied to where it came from, not guessed." },
  { icon: TrendingUp, title: "Price History", description: "Track how prices change over time across retailers." },
  { icon: GitCompare, title: "Easy Comparison", description: "Compare specs and prices side by side before you decide." },
  { icon: RefreshCw, title: "Actively Maintained", description: "The catalog is reviewed and updated by our team — not left to go stale." },
  { icon: IndianRupee, title: "India-focused Pricing", description: "Prices in INR, from retailers that actually ship in India." },
] as const;

export function WhyGadgexo() {
  return (
    <Section className="py-10 sm:py-12">
      <Container>
        <h2 className="mb-6 text-h2">Why GadGexo</h2>
        <Grid cols={3} gap="lg">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="flex flex-col gap-2">
              <pillar.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="text-h3">{pillar.title}</h3>
              <p className="text-small text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
