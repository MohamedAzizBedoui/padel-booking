"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CancelBookingPage() {
  const params = useParams();
  const router = useRouter();

  const bookingId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancelBooking() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(bookingId)}/cancel`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to cancel booking"
        );
      }

      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

      setLoading(false);
    }
  }

  function keepBooking() {
    router.push(`/bookings/${bookingId}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <a
            href="/home"
            className="text-2xl font-bold tracking-tight"
          >
            PADEL<span className="text-[#b8f500]">BOOK</span>
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-lg px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">
            !
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-red-400">
            Cancel booking
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Are you sure?
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/40">
            Cancelling this booking will make the court
            available again for other players.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Booking reference
            </p>

            <p className="mt-2 break-all font-mono text-sm text-white/60">
              {bookingId}
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={cancelBooking}
              disabled={loading}
              className="w-full rounded-xl bg-red-500 py-3.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Cancelling..."
                : "Yes, cancel booking"}
            </button>

            <button
              type="button"
              onClick={keepBooking}
              disabled={loading}
              className="w-full rounded-xl border border-white/10 py-3.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep my booking
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}