"use client";

import { useState } from "react";

type Source = {
  source_id: string;
  title: string;
  url: string;
  content?: string;
};

type SourceQuality = {
  source_id: string;
  quality: "high" | "medium" | "low";
  reason: string;
};

type Evidence = {
  source_id: string;
  claim: string;
};

type FieldConfidence = {
  value: string;
  score: number;
  level: string;
  reason: string;
};

type SourceVerification = {
  source_id: string;
  verified: boolean;
  trust_score: number;
  trust_level: string;
  domain_type: string;
  reason: string;
};

type Verification = {
  verified: boolean;
  overall_score: number;
  overall_level: string;
  review_required: boolean;
  model: FieldConfidence;
  price: FieldConfidence;
  india_availability: FieldConfidence;
  launch_date: FieldConfidence;
  source_verifications: SourceVerification[];
  reasons: string[];
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
  launch_date: string | null;
  india_launch_date: string | null;
  source_ids: string[];
  evidence: Evidence[];
  notes: string;
  verification?: Verification;
};

type ResearchData = {
  query: string;
  research_date: string;
  phones: Phone[];
  research_notes: string[];
  source_quality: SourceQuality[];
};

type ResearchResult = {
  success?: boolean;
  phase?: string;
  query?: string;
  model?: string;
  research_date?: string;
  source_count?: number;
  sources?: Source[];
  research?: ResearchData;
  verification_summary?: {
    phones_found?: number;
    verified_phones?: number;
    review_required?: number;
    average_confidence?: number;
    confidence_system?: string;
    database_write?: boolean;
  };
  persisted?: boolean;
  validation?: {
    anti_hallucination?: boolean;
    evidence_required?: boolean;
    date_aware?: boolean;
    india_availability_verified_from_sources?: boolean;
    source_verification?: boolean;
    confidence_scoring?: boolean;
    database_write?: boolean;
  };
  usage?: {
    tavily_searches?: number;
    tavily_max_results?: number;
    credit_saver?: boolean;
    note?: string;
  };
  error?: string;
};

const DEFAULT_QUERY =
  "Find the latest Samsung smartphones available in India.";

export default function AdminAiAgentPage() {
  const [brand, setBrand] = useState("Samsung");
  const [category, setCategory] = useState("Smartphones");
  const [market, setMarket] = useState("India");

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function buildPresetQuery() {
    const builtQuery = `Find the latest ${brand} ${category.toLowerCase()} available in ${market}.`;

    setQuery(builtQuery);
    setError("");
  }

  async function runResearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter a research query.");
      return;
    }

    if (trimmedQuery.length > 500) {
      setError("Research query must be 500 characters or less.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ai-agent/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmedQuery,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Research request failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Research request failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(price: number | null) {
    if (price === null || price === undefined) {
      return "Not found";
    }

    return `₹${price.toLocaleString("en-IN")}`;
  }

  function availabilityLabel(value?: string) {
    if (!value) return "Unknown";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function qualityLabel(value?: string) {
    if (!value) return "Unknown";

    return value.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
  }

  const research = result?.research;
  const phones = research?.phones ?? [];
  const sourceQuality = research?.source_quality ?? [];

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            AI Research Agent
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Research gadget information using web evidence
            and AI extraction.
          </p>
        </div>

        {/* Research Request */}
        <section className="rounded-xl border bg-card p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Research Request
            </h2>

            <p className="text-sm text-muted-foreground">
              Create a custom research request or build one
              using the options below.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {/* Brand */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Brand
              </label>

              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option>Samsung</option>
                <option>Apple</option>
                <option>OnePlus</option>
                <option>Xiaomi</option>
                <option>Oppo</option>
                <option>Vivo</option>
                <option>Realme</option>
                <option>Google</option>
                <option>Motorola</option>
                <option>Nothing</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option>Smartphones</option>
                <option>Tablets</option>
                <option>Laptops</option>
                <option>Smartwatches</option>
                <option>Earbuds</option>
                <option>Cameras</option>
              </select>
            </div>

            {/* Market */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Market
              </label>

              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option>India</option>
                <option>UAE</option>
                <option>USA</option>
                <option>UK</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={buildPresetQuery}
            className="mt-4 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Build Query from Options
          </button>

          {/* Query */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Research Query
            </label>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full resize-y rounded-md border bg-background px-3 py-3 text-sm"
              placeholder="Example: Find the latest Samsung smartphones available in India."
            />

            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>
                Custom query is sent to the research API.
              </span>

              <span>
                {query.length}/500
              </span>
            </div>
          </div>

          {/* Run */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={runResearch}
              disabled={loading}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading
                ? "Researching..."
                : "Run Research"}
            </button>

            <span className="text-xs text-muted-foreground">
              One Tavily search per research request.
            </span>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </section>

        {/* Phase */}
        <section className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                Phase 11C Research Mode
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Research results are temporary. No product
                data is written to the database.
              </p>
            </div>

            <span className="rounded-full border px-3 py-1 text-xs">
              POC • No DB Write
            </span>
          </div>
        </section>

        {/* Results */}
        {result && (
          <>
            {/* Summary */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              <SummaryCard
                label="Model"
                value={result.model || "Unknown"}
              />

              <SummaryCard
                label="Sources"
                value={result.source_count ?? result.sources?.length ?? 0}
              />

              <SummaryCard
                label="Phones Found"
                value={
                  result.verification_summary
                    ?.phones_found ??
                  phones.length
                }
              />

              <SummaryCard
                label="Verified"
                value={
                  result.verification_summary
                    ?.verified_phones ?? 0
                }
              />

              <SummaryCard
                label="Tavily Searches"
                value={
                  result.usage?.tavily_searches ?? 0
                }
              />

            </section>

            {/* Query */}
            <section className="rounded-xl border bg-card p-5">
              <p className="text-xs text-muted-foreground">
                Research query
              </p>

              <p className="mt-1 break-words font-medium">
                {result.query ||
                  research?.query ||
                  query}
              </p>
            </section>

            {/* Research Results */}
            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">
                  Research Results
                </h2>

                <p className="text-sm text-muted-foreground">
                  Extracted phones with source evidence
                  and verification.
                </p>
              </div>

              {phones.length === 0 ? (
                <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                  No phones were returned by the research
                  validation.
                </div>
              ) : (
                <div className="space-y-4">

                  {phones.map((phone, index) => (
                    <article
                      key={`${phone.name}-${index}`}
                      className="rounded-xl border bg-card p-5"
                    >

                      {/* Phone Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">

                        <div>
                          <h3 className="text-lg font-bold">
                            {phone.name}
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {phone.brand} •{" "}
                            {category} •{" "}
                            {market}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">

                          <span className="rounded-full border px-3 py-1 text-xs">
                            {availabilityLabel(
                              phone.availability_in_india
                            )}
                          </span>

                          {phone.verification && (
                            <span className="rounded-full border px-3 py-1 text-xs">
                              {phone.verification.verified
                                ? "Verified"
                                : "Review Required"}
                            </span>
                          )}

                        </div>
                      </div>

                      {/* Main Fields */}
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <InfoCard
                          label="Price"
                          value={formatPrice(
                            phone.price_inr
                          )}
                        />

                        <InfoCard
                          label="Launch Date"
                          value={
                            phone.launch_date ||
                            "Not found"
                          }
                        />

                        <InfoCard
                          label="India Launch"
                          value={
                            phone.india_launch_date ||
                            "Not found"
                          }
                        />

                        <InfoCard
                          label="Confidence"
                          value={
                            phone.verification
                              ? `${phone.verification.overall_score} • ${qualityLabel(
                                  phone.verification.overall_level
                                )}`
                              : "—"
                          }
                        />

                      </div>

                      {/* Verification */}
                      {phone.verification && (
                        <div className="mt-5">

                          <h4 className="font-semibold">
                            Verification
                          </h4>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            <InfoCard
                              label="Model"
                              value={`${phone.verification.model.score} • ${qualityLabel(
                                phone.verification.model.level
                              )}`}
                            />

                            <InfoCard
                              label="Price"
                              value={`${phone.verification.price.score} • ${qualityLabel(
                                phone.verification.price.level
                              )}`}
                            />

                            <InfoCard
                              label="India Availability"
                              value={`${phone.verification.india_availability.score} • ${qualityLabel(
                                phone.verification.india_availability.level
                              )}`}
                            />

                            <InfoCard
                              label="Launch Date"
                              value={`${phone.verification.launch_date.score} • ${qualityLabel(
                                phone.verification.launch_date.level
                              )}`}
                            />

                          </div>

                        </div>
                      )}

                      {/* Verification Reasons */}
                      {phone.verification?.reasons &&
                        phone.verification.reasons.length > 0 && (
                          <div className="mt-5">

                            <h4 className="font-semibold">
                              Verification Reasons
                            </h4>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">

                              {phone.verification.reasons.map(
                                (reason, reasonIndex) => (
                                  <li key={reasonIndex}>
                                    {reason}
                                  </li>
                                )
                              )}

                            </ul>
                          </div>
                        )}

                      {/* Evidence */}
                      {phone.evidence.length > 0 && (
                        <div className="mt-5">

                          <h4 className="font-semibold">
                            Evidence
                          </h4>

                          <div className="mt-2 space-y-2">

                            {phone.evidence.map(
                              (item, evidenceIndex) => (
                                <div
                                  key={`${item.source_id}-${evidenceIndex}`}
                                  className="rounded-lg border p-3"
                                >

                                  <p className="text-xs font-medium">
                                    {item.source_id}
                                  </p>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {item.claim}
                                  </p>

                                </div>
                              )
                            )}

                          </div>
                        </div>
                      )}

                      {/* Source IDs */}
                      {phone.source_ids.length > 0 && (
                        <div className="mt-5">

                          <h4 className="font-semibold">
                            Source IDs
                          </h4>

                          <div className="mt-2 flex flex-wrap gap-2">

                            {phone.source_ids.map(
                              (sourceId) => (
                                <span
                                  key={sourceId}
                                  className="rounded-full border px-3 py-1 text-xs"
                                >
                                  {sourceId}
                                </span>
                              )
                            )}

                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {phone.notes && (
                        <div className="mt-5">

                          <h4 className="font-semibold">
                            Notes
                          </h4>

                          <p className="mt-2 text-sm text-muted-foreground">
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
            <section>

              <div className="mb-3">
                <h2 className="text-lg font-semibold">
                  Source Quality
                </h2>

                <p className="text-sm text-muted-foreground">
                  Quality assessment returned by the
                  research agent.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border bg-card">

                {sourceQuality.length > 0 ? (
                  sourceQuality.map((source) => (
                    <div
                      key={source.source_id}
                      className="border-b p-4 last:border-b-0"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">
                          <p className="font-medium">
                            {source.source_id}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {source.reason}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border px-3 py-1 text-xs">
                          {qualityLabel(
                            source.quality
                          )}
                        </span>

                      </div>

                    </div>
                  ))
                ) : (
                  <div className="p-5 text-sm text-muted-foreground">
                    No source quality data returned.
                  </div>
                )}

              </div>
            </section>

            {/* Research Sources */}
            <section>

              <div className="mb-3">
                <h2 className="text-lg font-semibold">
                  Research Sources
                </h2>

                <p className="text-sm text-muted-foreground">
                  Web pages used for this research run.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border bg-card">

                {result.sources &&
                result.sources.length > 0 ? (
                  result.sources.map((source) => (
                    <div
                      key={source.source_id}
                      className="border-b p-4 last:border-b-0"
                    >

                      <p className="font-medium">
                        {source.source_id}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {source.title}
                      </p>

                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block truncate text-xs text-primary hover:underline"
                        >
                          {source.url}
                        </a>
                      )}

                    </div>
                  ))
                ) : (
                  <div className="p-5 text-sm text-muted-foreground">
                    No sources returned.
                  </div>
                )}

              </div>
            </section>

            {/* Research Notes */}
            {research?.research_notes &&
              research.research_notes.length > 0 && (
                <section className="rounded-xl border bg-card p-5">

                  <h2 className="font-semibold">
                    Research Notes
                  </h2>

                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">

                    {research.research_notes.map(
                      (note, index) => (
                        <li key={index}>
                          {note}
                        </li>
                      )
                    )}

                  </ul>

                </section>
              )}

            {/* Verification Summary */}
            {result.verification_summary && (
              <section className="rounded-xl border bg-card p-5">

                <h2 className="font-semibold">
                  Verification Summary
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  <InfoCard
                    label="Phones Found"
                    value={
                      result.verification_summary
                        .phones_found ?? 0
                    }
                  />

                  <InfoCard
                    label="Verified"
                    value={
                      result.verification_summary
                        .verified_phones ?? 0
                    }
                  />

                  <InfoCard
                    label="Review Required"
                    value={
                      result.verification_summary
                        .review_required ?? 0
                    }
                  />

                  <InfoCard
                    label="Average Confidence"
                    value={
                      result.verification_summary
                        .average_confidence ?? 0
                    }
                  />

                </div>

                {result.verification_summary
                  .confidence_system && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    System:{" "}
                    {
                      result.verification_summary
                        .confidence_system
                    }
                  </p>
                )}

              </section>
            )}

            {/* Safety Validation */}
            <section className="rounded-xl border bg-card p-5">

              <h2 className="font-semibold">
                Safety Validation
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <ValidationItem
                  label="Source Verification"
                  value={
                    result.validation
                      ?.source_verification
                  }
                />

                <ValidationItem
                  label="Confidence Scoring"
                  value={
                    result.validation
                      ?.confidence_scoring
                  }
                />

                <ValidationItem
                  label="Date Aware"
                  value={
                    result.validation?.date_aware
                  }
                />

                <ValidationItem
                  label="Database Write"
                  value={
                    result.validation?.database_write
                  }
                />

              </div>
            </section>

            {/* Credit Saver */}
            <section className="rounded-xl border bg-card p-5">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="font-semibold">
                    Credit Saver
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.usage?.note ||
                      "One Tavily search is used per research request."}
                  </p>
                </div>

                <span className="rounded-full border px-3 py-1 text-xs">
                  {result.usage?.credit_saver
                    ? "Enabled"
                    : "Unknown"}
                </span>

              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}

function ValidationItem({
  label,
  value,
}: {
  label: string;
  value?: boolean;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value === true
          ? "Yes"
          : value === false
          ? "No"
          : "—"}
      </p>
    </div>
  );
}