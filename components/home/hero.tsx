"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/search/search-input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/primitives";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/smartphones${params}`);
  }

  return (
    <div className="border-b border-border bg-gradient-to-b from-primary/10 to-transparent">
      <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <h1 className="max-w-2xl text-h1 sm:text-display">
          Find the Perfect Gadget for Your Next Upgrade
        </h1>
        <p className="max-w-xl text-body text-muted-foreground">
          Compare specs, prices, and gadgets from trusted sources — all in one place.
        </p>

        <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search smartphones, brands, or features..."
            aria-label="Search gadgets"
            className="flex-1"
          />
          <Button type="submit" size="lg">Search</Button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline">
            <a href="/smartphones">Explore Smartphones</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="/compare">Compare Gadgets</a>
          </Button>
        </div>
      </Container>
    </div>
  );
}
