"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Deliberately never renders `error.message` or any error detail to the
  // user — security foundation requirement (Master Context §16): no
  // internal information leaks through error output.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong.</h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium"
      >
        Retry
      </button>
    </main>
  );
}
