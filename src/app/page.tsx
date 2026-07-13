import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold">CV App</h1>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Login
          </Link>
          <Link
            href="/cvs"
            className="rounded-full border border-border px-5 py-2 text-sm font-medium"
          >
            Open app
          </Link>
        </div>
      </div>
    </main>
  );
}
