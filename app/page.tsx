import { LogoMark } from "@/components/brand/logo-mark";
import { SITE_CONFIG } from "@/lib/config/site";

export default function HomePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <LogoMark className="text-4xl font-semibold tracking-tight sm:text-5xl" />
      <p className="max-w-xl text-muted-foreground">{SITE_CONFIG.tagline}</p>
      <p className="mt-8 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground">
        Phase 3 design system foundation — the real homepage lands in Phase 4
      </p>
    </div>
  );
}
