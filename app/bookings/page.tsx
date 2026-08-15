"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Booking = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  court: {
    name: string;
  };
  club: {
    name: string;
    city: string;
    address?: string | null;
  };
};

type BookingsResponse = {
  success: boolean;
  bookings?: Booking[];
  error?: string;
};

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  >("ALL");

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/bookings", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data: BookingsResponse = await response.json();
        const bookingsList = data.bookings || [];

        // Sort by date descending
        bookingsList.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setBookings(bookingsList);
        setFilteredBookings(bookingsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    // Load bookings immediately
    loadBookings();

    // Auto-refresh every 5 seconds to show latest prices
    const interval = setInterval(loadBookings, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter((booking) => booking.status === statusFilter)
      );
    }
  }, [statusFilter, bookings]);

  const getStatusColor = (
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) => {
    switch (status) {
      case "CONFIRMED":
        return "text-[#b8f500]";
      case "COMPLETED":
        return "text-green-400";
      case "CANCELLED":
        return "text-red-400";
      default:
        return "text-white/60";
    }
  };

  const getStatusBgColor = (
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-[#b8f500]/10";
      case "COMPLETED":
        return "bg-green-500/10";
      case "CANCELLED":
        return "bg-red-500/10";
      default:
        return "bg-white/5";
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/home"
            className="text-2xl font-bold tracking-tight"
          >
            PADEL<span className="text-[#b8f500]">BOOK</span>
          </a>

          <div className="flex gap-3">
            <a
              href="/courts"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Book a court
            </a>

            <a
              href="/home"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm uppercase tracking-widest text-[#b8f500]">
            My bookings
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Your reservations
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/60">
            View and manage all your padel court bookings
          </p>

          {/* Filter Tabs */}
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {(["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                    statusFilter === status
                      ? "border border-[#b8f500] bg-[#b8f500]/10 text-[#b8f500]"
                      : "border border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="h-4 w-48 rounded bg-white/10"></div>
                <div className="mt-4 h-3 w-96 rounded bg-white/10"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-white/60">No bookings found</p>

            <button
              onClick={() => router.push("/courts")}
              className="mt-6 rounded-lg bg-[#b8f500] px-6 py-2.5 font-semibold text-black transition hover:bg-[#a8e500]"
            >
              Book your first court
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#b8f500]/50 hover:bg-white/[0.05]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {booking.court.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBgColor(
                          booking.status
                        )} ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/60">
                      <div>
                        <span className="text-white/40">Club: </span>
                        <span className="text-white">{booking.club.name}</span>
                      </div>

                      <div>
                        <span className="text-white/40">City: </span>
                        <span className="text-white">{booking.club.city}</span>
                      </div>

                      <div>
                        <span className="text-white/40">Date: </span>
                        <span className="text-white">
                          {new Date(booking.date).toLocaleDateString("en-GB")}
                        </span>
                      </div>

                      <div>
                        <span className="text-white/40">Time: </span>
                        <span className="text-white">
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#b8f500]">
                      DT{booking.price}
                    </p>

                    <p className="mt-1 text-xs text-white/40">Total price</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
