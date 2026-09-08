import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-semibold">No gadgets found.</h1>
      <p className="max-w-md text-muted-foreground">
        Try another model name or check the URL.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-gadgexo-gradient px-4 py-2 text-sm font-medium text-white"
      >
        Back to home
      </Link>
    </main>
  );
}
