"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

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

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        /*
         * Load authenticated session.
         */
        const sessionResponse = await fetch(
          "/api/auth/session",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!sessionResponse.ok) {
          router.replace("/");
          return;
        }

        const sessionData =
          await sessionResponse.json();

        if (!sessionData?.user) {
          router.replace("/");
          return;
        }

        setUser({
          id: sessionData.user.id,
          name: sessionData.user.name ?? null,
          email: sessionData.user.email,
          role: sessionData.user.role ?? "USER",
        });

        /*
         * Load the user's bookings.
         *
         * This uses the exact existing
         * /api/bookings endpoint.
         */
        const bookingsResponse = await fetch(
          "/api/bookings",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (bookingsResponse.status === 401) {
          router.replace("/");
          return;
        }

        const bookingsData: BookingsResponse =
          await bookingsResponse.json();

        if (
          !bookingsResponse.ok ||
          !bookingsData.success
        ) {
          throw new Error(
            bookingsData.error ||
              "Failed to load your bookings."
          );
        }

        setBookings(
          bookingsData.bookings ?? []
        );
      } catch (err) {
        console.error(
          "Profile loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  /*
   * Find only genuinely upcoming confirmed bookings.
   *
   * We compare the booking date + start time,
   * not just the date.
   */
  const upcomingBookings = useMemo(() => {
    const now = new Date();

    return bookings
      .filter((booking) => {
        if (booking.status !== "CONFIRMED") {
          return false;
        }

        const bookingStart = createBookingDate(
          booking.date,
          booking.startTime
        );

        return bookingStart > now;
      })
      .sort((a, b) => {
        const dateA = createBookingDate(
          a.date,
          a.startTime
        );

        const dateB = createBookingDate(
          b.date,
          b.startTime
        );

        return (
          dateA.getTime() -
          dateB.getTime()
        );
      });
  }, [bookings]);

  const nextBooking =
    upcomingBookings[0] ?? null;

  /*
   * Booking statistics.
   */
  const confirmedCount = bookings.filter(
    (booking) =>
      booking.status === "CONFIRMED"
  ).length;

  const completedCount = bookings.filter(
    (booking) =>
      booking.status === "COMPLETED"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) =>
      booking.status === "CANCELLED"
  ).length;

  function formatDate(dateValue: string) {
    return new Date(
      dateValue
    ).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getInitials(
    name: string | null
  ) {
    if (!name) {
      return "U";
    }

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  function handleLogout() {
    /*
     * We use NextAuth's built-in signout endpoint
     * without adding another authentication system.
     */
    window.location.href =
      "/api/auth/signout?callbackUrl=/";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070707] text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#b8f500]" />

          <p className="mt-4 text-sm text-white/30">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#b8f500]/5 blur-[140px]" />

        <div className="absolute right-0 top-[35%] h-[400px] w-[400px] rounded-full bg-[#b8f500]/[0.025] blur-[140px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 bg-[#070707]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <button
            type="button"
            onClick={() =>
              router.push("/home")
            }
            className="text-left"
          >
            <div className="text-xl font-black tracking-[-0.04em]">
              PADEL
              <span className="text-[#b8f500]">
                BOOK
              </span>
            </div>

            <div className="text-[8px] uppercase tracking-[0.3em] text-white/20">
              Play. Book. Repeat.
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/bookings")
              }
              className="hidden rounded-full px-4 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white sm:block"
            >
              My bookings
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b8f500]/20 bg-[#b8f500]/10 text-sm font-bold text-[#b8f500]">
              {getInitials(user.name)}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        {/* Header */}
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#b8f500]">
            Account
          </p>

          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">
                My profile
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/35 md:text-base">
                Manage your account and keep track
                of your PadelBook activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/home")
              }
              className="w-full rounded-xl border border-white/10 px-6 py-3.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white md:w-auto"
            >
              ← Back to home
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Profile card */}
        <section className="mt-10">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.025]">
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#b8f500] text-2xl font-black text-black">
                  {getInitials(user.name)}
                </div>

                {/* User information */}
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b8f500]">
                    Player account
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {user.name || "PadelBook Player"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-white/35">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Account details */}
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                <ProfileDetail
                  label="Full name"
                  value={
                    user.name ||
                    "Not provided"
                  }
                />

                <ProfileDetail
                  label="Email address"
                  value={user.email}
                />

                <ProfileDetail
                  label="Account type"
                  value={
                    user.role === "ADMIN"
                      ? "Administrator"
                      : "Player"
                  }
                />

                <ProfileDetail
                  label="Booking status"
                  value={
                    confirmedCount > 0
                      ? `${confirmedCount} confirmed`
                      : "No active bookings"
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Booking statistics */}
        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/25">
              Activity
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Your bookings
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              number={confirmedCount}
              label="Confirmed"
              accent
            />

            <StatCard
              number={completedCount}
              label="Completed"
            />

            <StatCard
              number={cancelledCount}
              label="Cancelled"
            />
          </div>
        </section>

        {/* Upcoming booking */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                Next match
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Upcoming booking
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/bookings")
              }
              className="text-sm text-white/35 transition hover:text-[#b8f500]"
            >
              View all →
            </button>
          </div>

          {nextBooking ? (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/bookings/${nextBooking.id}`
                )
              }
              className="group w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.025] text-left transition hover:border-[#b8f500]/20 hover:bg-white/[0.04]"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#b8f500]/20 bg-[#b8f500]/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#b8f500]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b8f500]" />
                      Confirmed
                    </span>

                    <h3 className="mt-5 text-2xl font-bold">
                      {nextBooking.club.name}
                    </h3>

                    <p className="mt-1 text-sm text-white/35">
                      {nextBooking.club.city}

                      {nextBooking.club.address
                        ? ` · ${nextBooking.club.address}`
                        : ""}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-2xl font-bold text-[#b8f500]">
                      {nextBooking.price} DT
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-white/20">
                      Total
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <BookingDetail
                    label="Date"
                    value={formatDate(
                      nextBooking.date
                    )}
                  />

                  <BookingDetail
                    label="Time"
                    value={`${nextBooking.startTime} – ${nextBooking.endTime}`}
                  />

                  <BookingDetail
                    label="Court"
                    value={
                      nextBooking.court.name
                    }
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-white/35">
                    View booking details
                  </span>

                  <span className="text-sm font-medium text-[#b8f500] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b8f500]/10 text-xl text-[#b8f500]">
                +
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No upcoming booking
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/30">
                You don't have a confirmed
                upcoming match. Find a court and
                book your next game.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/courts")
                }
                className="mt-6 rounded-xl bg-[#b8f500] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#c8ff33]"
              >
                Find a court
              </button>
            </div>
          )}
        </section>

        {/* Account actions */}
        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/25">
              Account
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Quick actions
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ActionCard
              number="01"
              title="My bookings"
              description="View all your reservations"
              onClick={() =>
                router.push("/bookings")
              }
            />

            <ActionCard
              number="02"
              title="Book a court"
              description="Find your next available court"
              onClick={() =>
                router.push("/courts")
              }
            />
          </div>
        </section>

        {/* Logout */}
        <section className="mt-10">
          <div className="rounded-[1.75rem] border border-red-500/10 bg-red-500/[0.025] p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold">
                  Sign out
                </p>

                <p className="mt-1 text-xs leading-5 text-white/25">
                  Sign out of your PadelBook account
                  on this device.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-500/20 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
              >
                Sign out
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-white/10 pt-8">
          <div className="flex flex-col justify-between gap-4 pb-8 text-xs text-white/20 sm:flex-row">
            <div className="font-bold tracking-tight">
              PADEL
              <span className="text-[#b8f500]">
                BOOK
              </span>
            </div>

            <div>
              © {new Date().getFullYear()} PadelBook
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/home")
              }
              className="text-left transition hover:text-white/50 sm:text-right"
            >
              Back to home
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

/*
 * Creates the actual booking date/time.
 *
 * The booking API stores the calendar date separately
 * from startTime, so we combine them here for accurate
 * upcoming-booking detection.
 */
function createBookingDate(
  dateValue: string,
  timeValue: string
) {
  const date = new Date(dateValue);

  const [hours, minutes] = timeValue
    .split(":")
    .map(Number);

  date.setHours(hours, minutes, 0, 0);

  return date;
}

/* ---------------------------------- */
/* Components                         */
/* ---------------------------------- */

function ProfileDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/20">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-medium text-white/75">
        {value}
      </p>
    </div>
  );
}

function StatCard({
  number,
  label,
  accent = false,
}: {
  number: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p
        className={`text-3xl font-bold ${
          accent
            ? "text-[#b8f500]"
            : "text-white"
        }`}
      >
        {number}
      </p>

      <p className="mt-2 text-xs uppercase tracking-wider text-white/25">
        {label}
      </p>
    </div>
  );
}

function BookingDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/20">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-white/75">
        {value}
      </p>
    </div>
  );
}

function ActionCard({
  number,
  title,
  description,
  onClick,
}: {
  number: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#b8f500]/20 hover:bg-white/[0.04]"
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold tracking-widest text-[#b8f500]">
          {number}
        </span>

        <span className="text-white/20 transition group-hover:translate-x-1 group-hover:text-[#b8f500]">
          →
        </span>
      </div>

      <h3 className="mt-8 text-base font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-sm text-white/30">
        {description}
      </p>
    </button>
  );
}