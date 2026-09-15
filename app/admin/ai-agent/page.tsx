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
  availability_in_india:
    | "available"
    | "upcoming"
    | "announced"
    | "uncertain"
    | "not_found";
  price_inr: number | null;
  launch_date?: string | null;
  india_launch_date?: string | null;
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
    date_aware?: boolean;
  };
  usage?: {
    tavily_searches?: number;
    tavily_max_results?: number;
    credit_saver?: boolean;
    note?: string;
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
    case "upcoming":
      return "Upcoming in India";
    case "announced":
      return "Announced";
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

function availabilityClass(
  status: Phone["availability_in_india"]
) {
  switch (status) {
    case "available":
      return "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400";

    case "upcoming":
      return "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400";

    case "announced":
      return "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400";

    case "uncertain":
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";

    case "not_found":
      return "border-muted bg-muted text-muted-foreground";
  }
}

export default function AdminAIAgentPage() {
  const [query, setQuery] = useState(
    "Find the latest Samsung smartphones available in India."
  );

  const [brand, setBrand] = useState("Samsung");
  const [category, setCategory] = useState("Smartphones");
  const [market, setMarket] = useState("India");

  const [result, setResult] =
    useState<ResearchResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runResearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter a research query.");
      return;
    }

    if (trimmedQuery.length > 500) {
      setError(
        "Research query must be 500 characters or less."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        "/api/ai-agent/research",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            query: trimmedQuery,
          }),
        }
      );

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

  function buildPresetQuery() {
    const generatedQuery = `Find the latest ${brand} ${category.toLowerCase()} available in ${market}.`;

    setQuery(generatedQuery);
    setError(null);
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
              Research gadget information from web sources
              and extract structured data with evidence.
            </p>
          </div>
        </div>
      </section>

      {/* Research Controls */}
      <section className="rounded-lg border bg-card p-5">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">
              Research Request
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a custom research request or use the
              options below to build one.
            </p>
          </div>

          {/* Brand / Category / Market */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label
                htmlFor="brand"
                className="text-sm font-medium"
              >
                Brand
              </label>

              <select
                id="brand"
                value={brand}
                onChange={(e) =>
                  setBrand(e.target.value)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="Samsung">
                  Samsung
                </option>

                <option value="Apple">
                  Apple
                </option>

                <option value="OnePlus">
                  OnePlus
                </option>

                <option value="Xiaomi">
                  Xiaomi
                </option>

                <option value="Oppo">
                  Oppo
                </option>

                <option value="Vivo">
                  Vivo
                </option>

                <option value="Realme">
                  Realme
                </option>

                <option value="Google">
                  Google
                </option>

                <option value="Motorola">
                  Motorola
                </option>

                <option value="Nothing">
                  Nothing
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="Smartphones">
                  Smartphones
                </option>

                <option value="Tablets">
                  Tablets
                </option>

                <option value="Laptops">
                  Laptops
                </option>

                <option value="Smartwatches">
                  Smartwatches
                </option>

                <option value="Earbuds">
                  Earbuds
                </option>

                <option value="Cameras">
                  Cameras
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="market"
                className="text-sm font-medium"
              >
                Market
              </label>

              <select
                id="market"
                value={market}
                onChange={(e) =>
                  setMarket(e.target.value)
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="India">
                  India
                </option>

                <option value="United Arab Emirates">
                  UAE
                </option>

                <option value="United States">
                  USA
                </option>

                <option value="United Kingdom">
                  UK
                </option>
              </select>
            </div>
          </div>

          {/* Generate preset */}
          <div>
            <button
              type="button"
              onClick={buildPresetQuery}
              className="rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Build Query from Options
            </button>
          </div>

          {/* Custom query */}
          <div className="space-y-2">
            <label
              htmlFor="research-query"
              className="text-sm font-medium"
            >
              Research Query
            </label>

            <textarea
              id="research-query"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              maxLength={500}
              rows={4}
              placeholder="Example: Find the latest Samsung smartphones available in India."
              className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Custom research is sent to the Phase 11B
                research API.
              </span>

              <span>
                {query.length}/500
              </span>
            </div>
          </div>

          {/* Run */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={runResearch}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Researching..."
                : "Run Research"}
            </button>

            <span className="text-xs text-muted-foreground">
              One Tavily search per research request.
            </span>
          </div>
        </div>
      </section>

      {/* Safety / Phase status */}
      <section className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">
              Phase 11B Research Mode
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Research results are temporary. No product
              data is written to the database.
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
            Searching web sources and extracting
            structured gadget data...
          </div>
        </section>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Summary */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                Tavily Searches
              </p>

              <p className="mt-1 text-xl font-semibold">
                {result.usage?.tavily_searches ?? 1}
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

          {/* Credit Saver */}
          {result.usage && (
            <section className="rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-medium">
                    Credit Saver
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.usage.note ||
                      "One web search is used per research request."}
                  </p>
                </div>

                <span className="w-fit rounded-full border px-3 py-1 text-xs font-medium">
                  {result.usage.credit_saver
                    ? "Enabled"
                    : "Standard"}
                </span>
              </div>
            </section>
          )}

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
                Extracted gadgets with source evidence.
              </p>
            </div>

            {result.research.phones.length === 0 ? (
              <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                No phones passed the evidence validation.
              </div>
            ) : (
              <div className="grid gap-4">
                {result.research.phones.map(
                  (phone) => (
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
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${availabilityClass(
                              phone.availability_in_india
                            )}`}
                          >
                            {availabilityLabel(
                              phone.availability_in_india
                            )}
                          </span>

                          <span className="rounded-full border px-3 py-1 text-xs font-medium">
                            {formatPrice(
                              phone.price_inr
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Dates */}
                      {(phone.launch_date ||
                        phone.india_launch_date) && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {phone.launch_date && (
                            <div className="rounded-md border p-3">
                              <p className="text-xs text-muted-foreground">
                                Launch Date
                              </p>

                              <p className="mt-1 text-sm font-medium">
                                {phone.launch_date}
                              </p>
                            </div>
                          )}

                          {phone.india_launch_date && (
                            <div className="rounded-md border p-3">
                              <p className="text-xs text-muted-foreground">
                                India Launch Date
                              </p>

                              <p className="mt-1 text-sm font-medium">
                                {
                                  phone.india_launch_date
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Evidence */}
                      <div className="mt-5 space-y-3">
                        <h4 className="text-sm font-semibold">
                          Evidence
                        </h4>

                        {phone.evidence.length ===
                        0 ? (
                          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
                            No evidence returned.
                          </div>
                        ) : (
                          phone.evidence.map(
                            (
                              evidence,
                              index
                            ) => (
                              <div
                                key={`${evidence.source_id}-${index}`}
                                className="rounded-md border bg-muted/30 p-3"
                              >
                                <p className="text-xs font-medium text-muted-foreground">
                                  {
                  