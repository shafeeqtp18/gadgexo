"use client";

import { useState } from "react";

type Source = {
  source_id: string;
  title: string;
  url: string;
  content: string;
};

type Evidence = {
  source_id: string;
  claim: string;
};

type Phone = {
  name: string;
  brand: string;
  availability_in_india: "available" | "uncertain" | "not_found";
  price_inr: number | null;
  source_ids: string[];
  evidence: Evidence[];
  notes: string;
};

type ResearchResult = {
  success: boolean;
  query: string;
  model: string;
  source_count: number;
  sources: Source[];
  research: {
    phones: Phone[];
    research_notes: string[];
    source_quality: {
      source_id: string;
      quality: "high" | "medium" | "low";
      reason: string;
    }[];
  };
  persisted: boolean;
  validation: {
    anti_hallucination: boolean;
    evidence_required: boolean;
    database_write: boolean;
  };
};

function formatPrice(price: number | null) {
  if (price === null) return "Price not found";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function availabilityLabel(
  status: Phone["availability_in_india"]
) {
  switch (status) {
    case "available":
      return "Available in India";
    case "uncertain":
      return "Uncertain";
    case "not_found":
      return "India availability not found";
  }
}

function qualityLabel(
  quality: "high" | "medium" | "low"
) {
  switch (quality) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
  }
}

export default function AdminAIAgentPage() {
  const [result, setResult] = useState<ResearchResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runResearch() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai-agent/research", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || "AI research request failed"
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6 p-6">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              AI Research Agent
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Research the latest smartphone information from
              trusted web sources.
            </p>
          </div>

          <button
            type="button"
            onClick={runResearch}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Researching..." : "Run Research"}
          </button>
        </div>
      </section>

      {/* Safety / POC status */}
      <section className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">
              Phase 11A Research Mode
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Research results are temporary. No product data is
              written to the database.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium">
            POC • No DB Write
          </span>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <h2 className="font-medium text-destructive">
            Research failed
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {error}
          </p>
        </section>
      )}

      {/* Loading */}
      {loading && (
        <section className="rounded-lg border bg-card p-8 text-center">
          <div className="text-sm text-muted-foreground">
            Searching web sources and extracting structured
            smartphone data...
          </div>
        </section>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Summary */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Model
              </p>
              <p className="mt-1 font-medium">
                {result.model}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Sources
              </p>
              <p className="mt-1 text-xl font-semibold">
                {result.source_count}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Phones Found
              </p>
              <p className="mt-1 text-xl font-semibold">
                {result.research.phones.length}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Database Write
              </p>
              <p className="mt-1 font-semibold">
                {result.persisted ? "Yes" : "No"}
              </p>
            </div>
          </section>

          {/* Query */}
          <section className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              Research query
            </p>

            <p className="mt-1 text-sm font-medium">
              {result.query}
            </p>
          </section>

          {/* Phones */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                Research Results
              </h2>

              <p className="text-sm text-muted-foreground">
                Extracted phones with source evidence.
              </p>
            </div>

            {result.research.phones.length === 0 ? (
              <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                No phones passed the evidence validation.
              </div>
            ) : (
              <div className="grid gap-4">
                {result.research.phones.map((phone) => (
                  <article
                    key={`${phone.name}-${phone.source_ids.join(
                      "-"
                    )}`}
                    className="rounded-lg border bg-card p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {phone.name}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {phone.brand}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border px-3 py-1 text-xs font-medium">
                          {availabilityLabel(
                            phone.availability_in_india
                          )}
                        </span>

                        <span className="rounded-full border px-3 py-1 text-xs font-medium">
                          {formatPrice(phone.price_inr)}
                        </span>
                      </div>
                    </div>

                    {/* Evidence */}
                    <div className="mt-5 space-y-3">
                      <h4 className="text-sm font-semibold">
                        Evidence
                      </h4>

                      {phone.evidence.map(
                        (evidence, index) => (
                          <div
                            key={`${evidence.source_id}-${index}`}
                            className="rounded-md border bg-muted/30 p-3"
                          >
                            <p className="text-xs font-medium text-muted-foreground">
                              {evidence.source_id}
                            </p>

                            <p className="mt-1 text-sm">
                              {evidence.claim}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    {/* Notes */}
                    {phone.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold">
                          Notes
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {phone.notes}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Source Quality */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                Source Quality
              </h2>

              <p className="text-sm text-muted-foreground">
                Quality assessment returned by the research
                agent.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <div className="divide-y">
                {result.research.source_quality.map(
                  (source) => (
                    <div
                      key={source.source_id}
                      className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {source.source_id}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {source.reason}
                        </p>
                      </div>

                      <span className="w-fit rounded-full border px-3 py-1 text-xs font-medium">
                        {qualityLabel(source.quality)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* Research Notes */}
          {result.research.research_notes.length > 0 && (
            <section className="rounded-lg border bg-card p-5">
              <h2 className="font-semibold">
                Research Notes
              </h2>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {result.research.research_notes.map(
                  (note, index) => (
                    <li key={index}>{note}</li>
                  )
                )}
              </ul>
            </section>
          )}

          {/* Sources */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                Research Sources
              </h2>

              <p className="text-sm text-muted-foreground">
                Web pages used for this research run.
              </p>
            </div>

            <div className="grid gap-3">
              {result.sources.map((source) => (
                <div
                  key={source.source_id}
                  className="rounded-lg border bg-card p-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border px-2 py-1 text-xs font-medium">
                        {source.source_id}
                      </span>

                      <span className="text-sm font-medium">
                        {source.title}
                      </span>
                    </div>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-sm text-primary underline underline-offset-4"
                    >
                      {source.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Validation */}
          <section className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">
              Safety Validation
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  Anti-hallucination
                </p>
                <p className="mt-1 font-medium">
                  {result.validation.anti_hallucination
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  Evidence required
                </p>
                <p className="mt-1 font-medium">
                  {result.validation.evidence_required
                    ? "Yes"
                    : "No"}
                </p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  Database write
                </p>
                <p className="mt-1 font-medium">
                  {result.validation.database_write
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Initial state */}
      {!result && !loading && !error && (
        <section className="rounded-lg border border-dashed p-10 text-center">
          <h2 className="font-medium">
            Ready to research
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Click “Run Research” to start the Phase 11A AI
            research pipeline.
          </p>
        </section>
      )}
    </main>
  );
}