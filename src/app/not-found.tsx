import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | MacroCalculators",
};

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for may have moved or no longer exists.</p>
      <Link className="mt-6 inline-block underline" href="/">Return to the homepage</Link>
    </main>
  );
}
