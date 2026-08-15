import Link from "next/link";

export default function NotFound() {
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
          ?
        </div>

        <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
          Page not found
        </h1>

        <p className="mt-4 text-base leading-7 text-white/60">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or deleted.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/home"
            className="rounded-lg bg-[#b8f500] px-6 py-3 font-semibold text-black transition hover:bg-[#a8e500]"
          >
            Back to home
          </Link>

          <Link
            href="/courts"
            className="rounded-lg border border-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Browse courts
          </Link>
        </div>
      </section>
    </main>
  );
}
