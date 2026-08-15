
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BookingStatus =
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Booking = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: BookingStatus;
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

function getBookingDateTime(
  date: string,
  time: string
) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const bookingDate = new Date(date);

  bookingDate.setHours(hours, minutes, 0, 0);

  return bookingDate;
}

function isUpcoming(booking: Booking) {
  if (booking.status !== "CONFIRMED") {
    return false;
  }

  return (
    getBookingDateTime(
      booking.date,
      booking.startTime
    ).getTime() > Date.now()
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "ALL" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
    >("ALL");

  const loadBookings = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/bookings", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to fetch bookings."
        );
      }

      const data: BookingsResponse =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Failed to fetch bookings."
        );
      }

      setBookings(data.bookings ?? []);
    } catch (err) {
      console.error("Bookings page error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBookings();

    function handleFocus() {
      loadBookings();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadBookings]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(isUpcoming)
      .sort(
        (a, b) =>
          getBookingDateTime(
            a.date,
            a.startTime
          ).getTime() -
          getBookingDateTime(
            b.date,
            b.startTime
          ).getTime()
      );
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status === "COMPLETED" ||
          (
            booking.status === "CONFIRMED" &&
            !isUpcoming(booking)
          )
      )
      .sort(
        (a, b) =>
          getBookingDateTime(
            b.date,
            b.startTime
          ).getTime() -
          getBookingDateTime(
            a.date,
            a.startTime
          ).getTime()
      );
  }, [bookings]);

  const cancelledBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status === "CANCELLED"
      )
      .sort(
        (a, b) =>
          getBookingDateTime(
            b.date,
            b.startTime
          ).getTime() -
          getBookingDateTime(
            a.date,
            a.startTime
          ).getTime()
      );
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "ALL") {
      return bookings;
    }

    if (statusFilter === "CONFIRMED") {
      return upcomingBookings;
    }

    if (statusFilter === "COMPLETED") {
      return completedBookings;
    }

    return cancelledBookings;
  }, [
    statusFilter,
    bookings,
    upcomingBookings,
    completedBookings,
    cancelledBookings,
  ]);

  const getStatusColor = (
    status: BookingStatus
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
    status: BookingStatus
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

  function BookingCard({
    booking,
  }: {
    booking: Booking;
  }) {
    return (
      <Link
        href={`/bookings/${booking.id}`}
        className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#b8f500]/50 hover:bg-white/[0.05]"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold">
                {booking.court.name}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBgColor(
                  booking.status
                )} ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>

            <p className="mt-2 text-sm text-white/40">
              {booking.club.name}
            </p>

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-white/40">
                  City:{" "}
                </span>

                <span className="text-white">
                  {booking.club.city}
                </span>
              </div>

              <div>
                <span className="text-white/40">
                  Date:{" "}
                </span>

                <span className="text-white">
                  {formatDate(booking.date)}
                </span>
              </div>

              <div>
                <span className="text-white/40">
                  Time:{" "}
                </span>

                <span className="text-white">
                  {booking.startTime} –{" "}
                  {booking.endTime}
                </span>
              </div>

              <div>
                <span className="text-white/40">
                  Duration:{" "}
                </span>

                <span className="text-white">
                  1h30
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-2xl font-bold text-[#b8f500]">
              {booking.price} DT
            </p>

            <p className="mt-1 text-xs text-white/40">
              Total price
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/home"
            className="text-2xl font-bold tracking-tight"
          >
            PADEL
            <span className="text-[#b8f500]">
              BOOK
            </span>
          </Link>

          <div className="flex gap-3">
            <Link
              href="/courts"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Book a court
            </Link>

            <Link
              href="/home"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm uppercase tracking-widest text-[#b8f500]">
            My bookings
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Your reservations
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/60">
            View and manage your padel court
            bookings.
          </p>

          <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {(
              [
                "ALL",
                "CONFIRMED",
                "COMPLETED",
                "CANCELLED",
              ] as const
            ).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(status)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  statusFilter === status
                    ? "border border-[#b8f500] bg-[#b8f500]/10 text-[#b8f500]"
                    : "border border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                {status === "CONFIRMED"
                  ? "UPCOMING"
                  : status}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="h-5 w-48 rounded bg-white/10" />

                <div className="mt-4 h-4 w-72 rounded bg-white/10" />

                <div className="mt-3 h-4 w-56 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadBookings();
              }}
              className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            >
              Try again
            </button>
          </div>
        ) : statusFilter === "ALL" ? (
          <div className="space-y-10">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#b8f500]">
                    Upcoming
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Upcoming bookings
                  </h2>
                </div>

                <span className="text-sm text-white/40">
                  {upcomingBookings.length}
                </span>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                  <p className="text-white/50">
                    You have no upcoming bookings.
                  </p>

                  <Link
                    href="/courts"
                    className="mt-5 inline-block rounded-xl bg-[#b8f500] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#c8ff33]"
                  >
                    Book a court
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map(
                    (booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {completedBookings.length > 0 && (
              <div>
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-widest text-green-400">
                    History
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Completed bookings
                  </h2>
                </div>

                <div className="space-y-4">
                  {completedBookings.map(
                    (booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {cancelledBookings.length > 0 && (
              <div>
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-widest text-red-400">
                    Cancelled
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Cancelled bookings
                  </h2>
                </div>

                <div className="space-y-4">
                  {cancelledBookings.map(
                    (booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-white/50">
              No{" "}
              {statusFilter === "CONFIRMED"
                ? "upcoming"
                : statusFilter.toLowerCase()}{" "}
              bookings found.
            </p>

            <Link
              href="/courts"
              className="mt-6 inline-block rounded-xl bg-[#b8f500] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-[#c8ff33]"
            >
              Book a court
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
