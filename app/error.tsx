"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            PADEL<span className="text-[#b8f500]">BOOK</span>
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-2xl px-6 py-24 text-center md:py-32">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 text-5xl mx-auto">
          !
        </div>

        <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
          Something went wrong
        </h1>

        <p className="mt-4 text-base leading-7 text-white/60">
          We encountered an unexpected error. Please try again or return to the
          home page.
        </p>

        {error.message && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">
              Error: {error.message}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-[#b8f500] px-6 py-3 font-semibold text-black transition hover:bg-[#a8e500]"
          >
            Try again
          </button>

          <a
            href="/home"
            className="rounded-lg border border-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Back to home
          </a>
        </div>
      </section>
    </main>
  );
}
