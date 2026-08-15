
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type BookingsResponse = {
  success: boolean;
  bookings?: Booking[];
  error?: string;
};

type Club = {
  id: string;
  name: string;
  city: string;
};

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
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

        if (!data.success) {
          console.error(
            "Dashboard request failed:",
            data.error
          );
          return;
        }

        const bookings = data.bookings ?? [];

        /*
         * The API stores the booking date as UTC midnight:
         *
         * 2026-08-15T00:00:00.000Z
         *
         * We only need the calendar date, so extract YYYY-MM-DD
         * directly instead of converting the date through the
         * browser timezone.
         */
        function getBookingDateTime(item: Booking): Date {
          const datePart = item.date.slice(0, 10);

          return new Date(
            `${datePart}T${item.startTime}:00`
          );
        }

        const now = new Date();

        const upcoming = bookings
          .filter((item) => {
            if (item.status !== "CONFIRMED") {
              return false;
            }

            const bookingDateTime =
              getBookingDateTime(item);

            return bookingDateTime.getTime() >= now.getTime();
          })
          .sort((a, b) => {
            return (
              getBookingDateTime(a).getTime() -
              getBookingDateTime(b).getTime()
            );
          });

        if (!cancelled) {
          setBooking(upcoming[0] ?? null);
        }

        /*
         * Load the authenticated session.
         */
        const sessionResponse = await fetch(
          "/api/auth/session",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (
          !cancelled &&
          sessionResponse.ok
        ) {
          const sessionData =
            await sessionResponse.json();

          if (sessionData?.user) {
            setUser({
              id: sessionData.user.id,
              name: sessionData.user.name ?? null,
              email: sessionData.user.email,
              role: sessionData.user.role,
            });
          }
        }
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    /*
     * Refresh bookings periodically so a booking created
     * elsewhere appears on the dashboard automatically.
     */
    const interval = setInterval(
      loadDashboard,
      10000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router]);

  useEffect(() => {
    async function loadCities() {
      try {
        setCitiesLoading(true);

        const response = await fetch(
          "/api/clubs",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to load clubs for location search."
          );
          return;
        }

        const data = await response.json();

        const clubs: Club[] =
          data.clubs ??
          data.data ??
          (Array.isArray(data) ? data : []);

        const uniqueCities = Array.from(
          new Set(
            clubs
              .map((club) => club.city)
              .filter(
                (city): city is string =>
                  Boolean(city)
              )
          )
        ).sort();

        setCities(uniqueCities);
      } catch (error) {
        console.error(
          "Failed to load cities:",
          error
        );
      } finally {
        setCitiesLoading(false);
      }
    }

    loadCities();

    const interval = setInterval(
      loadCities,
      5000
    );

    return () =>
      clearInterval(interval);
  }, []);

  function formatDate(dateValue: string) {
    return new Date(dateValue).toLocaleDateString(
      "en-GB",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function handleSearch() {
    const params = new URLSearchParams();

    if (location) {
      params.set("location", location);
    }

    if (date) {
      params.set("date", date);
    }

    const query = params.toString();

    router.push(
      query
        ? `/courts?${query}`
        : "/courts"
    );
  }

  function getTodayString() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070707] text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#b8f500]" />

          <p className="mt-4 text-sm text-white/30">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#b8f500]/5 blur-[140px]" />

        <div className="absolute right-0 top-[35%] h-[400px] w-[400px] rounded-full bg-[#b8f500]/[0.025] blur-[140px]" />
      </div>

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

            <button
              type="button"
              onClick={() =>
                router.push("/profile")
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold transition hover:border-[#b8f500]/30 hover:bg-[#b8f500]/10"
            >
              {(user?.name?.[0] ?? "U").toUpperCase()}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#b8f500]">
            Player dashboard
          </p>

          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">
                Welcome back
                {user?.name
                  ? `, ${user.name.split(" ")[0]}`
                  : ""}
                .
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/35 md:text-base">
                Ready to play? Find an available
                court, choose your time, and get your
                next match booked.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/courts")
              }
              className="w-full rounded-xl bg-[#b8f500] px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-[#c8ff33] md:w-auto"
            >
              Book a court
              <span className="ml-3">
                →
              </span>
            </button>
          </div>
        </section>

        <section className="mt-10">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                  Quick search
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Find a court
                </h2>
              </div>

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#b8f500]/10 text-[#b8f500] sm:flex">
                ↗
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <div className="relative">
                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 transition hover:border-[#b8f500]/30 hover:bg-white/[0.05]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-sm text-white/40">
                    ⌖
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-white/20">
                      Location
                    </p>

                    <select
                      value={location}
                      onChange={(event) =>
                        setLocation(
                          event.target.value
                        )
                      }
                      className="mt-1 w-full cursor-pointer appearance-none bg-transparent text-sm text-white/65 outline-none"
                    >
                      <option
                        value=""
                        className="bg-[#111111] text-white"
                      >
                        {citiesLoading
                          ? "Loading cities..."
                          : "Any city"}
                      </option>

                      {cities.map((city) => (
                        <option
                          key={city}
                          value={city}
                          className="bg-[#111111] text-white"
                        >
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-xs text-white/20">
                    ▼
                  </span>
                </label>
              </div>

              <div className="relative">
                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 transition hover:border-[#b8f500]/30 hover:bg-white/[0.05]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-sm text-white/40">
                    ◷
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-white/20">
                      Date
                    </p>

                    <input
                      type="date"
                      value={date}
                      min={getTodayString()}
                      onChange={(event) =>
                        setDate(
                          event.target.value
                        )
                      }
                      className="mt-1 w-full cursor-pointer bg-transparent text-sm text-white/65 outline-none [color-scheme:dark]"
                    />
                  </div>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-xl bg-white/[0.07] px-7 py-3 text-sm font-medium transition hover:bg-[#b8f500] hover:text-black"
              >
                Search
              </button>
            </div>

            {(location || date) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/25">
                  Searching:
                </span>

                {location && (
                  <button
                    type="button"
                    onClick={() =>
                      setLocation("")
                    }
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition hover:border-[#b8f500]/30 hover:text-[#b8f500]"
                  >
                    {location} ×
                  </button>
                )}

                {date && (
                  <button
                    type="button"
                    onClick={() =>
                      setDate("")
                    }
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition hover:border-[#b8f500]/30 hover:text-[#b8f500]"
                  >
                    {formatDate(date)} ×
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                Your next match
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

          {booking ? (
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.025]">
              <div className="grid lg:grid-cols-[1fr_280px]">
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#b8f500]/20 bg-[#b8f500]/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#b8f500]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#b8f500]" />
                        Confirmed
                      </span>

                      <h3 className="mt-5 text-2xl font-bold">
                        {booking.club.name}
                      </h3>

                      <p className="mt-1 text-sm text-white/35">
                        {booking.club.city}

                        {booking.club.address
                          ? ` · ${booking.club.address}`
                          : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#b8f500]">
                        {booking.price} DT
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
                        booking.date
                      )}
                    />

                    <BookingDetail
                      label="Time"
                      value={`${booking.startTime} – ${booking.endTime}`}
                    />

                    <BookingDetail
                      label="Court"
                      value={booking.court.name}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/bookings/${booking.id}`
                      )
                    }
                    className="mt-6 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    View booking
                  </button>
                </div>

                <div className="border-t border-white/10 bg-white/[0.02] p-6 lg:border-l lg:border-t-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                    Get ready
                  </p>

                  <p className="mt-3 text-sm leading-6 text-white/40">
                    Your court is reserved. Arrive a
                    few minutes early and enjoy your
                    match.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/courts")
                    }
                    className="mt-6 text-sm font-medium text-[#b8f500] transition hover:text-[#d0ff4a]"
                  >
                    Book another court →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b8f500]/10 text-xl text-[#b8f500]">
                +
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No upcoming booking
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/30">
                Your next match is waiting. Find an
                available court and book your preferred
                time.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/courts")
                }
                className="mt-6 rounded-xl bg-[#b8f500] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#c8ff33]"
              >
                Find a new booking
              </button>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/25">
              Quick actions
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              What do you need?
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <ActionCard
              number="01"
              title="Book a court"
              description="Find available courts"
              onClick={() =>
                router.push("/courts")
              }
            />

            <ActionCard
              number="02"
              title="My bookings"
              description="View your reservations"
              onClick={() =>
                router.push("/bookings")
              }
            />

            <ActionCard
              number="03"
              title="My profile"
              description="Manage your account"
              onClick={() =>
                router.push("/profile")
              }
            />
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                Explore
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Popular clubs
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/courts")
              }
              className="text-sm text-white/35 transition hover:text-[#b8f500]"
            >
              View all →
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ClubCard
              name="Padel Arena Tunis"
              city="Tunis"
              price="From 80 DT"
              onClick={() =>
                router.push(
                  "/courts?location=Tunis"
                )
              }
            />

            <ClubCard
              name="Sfax Padel Center"
              city="Sfax"
              price="From 80 DT"
              onClick={() =>
                router.push(
                  "/courts?location=Sfax"
                )
              }
            />

            <ClubCard
              name="Sousse Padel Club"
              city="Sousse"
              price="From 80 DT"
              onClick={() =>
                router.push(
                  "/courts?location=Sousse"
                )
              }
            />
          </div>
        </section>

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
                router.push("/profile")
              }
              className="text-left transition hover:text-white/50 sm:text-right"
            >
              Account settings
            </button>
          </div>
        </footer>
      </div>
    </main>
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

function ClubCard({
  name,
  city,
  price,
  onClick,
  disabled = false,
}: {
  name: string;
  city: string;
  price: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] text-left transition ${
        disabled
          ? "cursor-default opacity-50"
          : "hover:-translate-y-1 hover:border-white/20"
      }`}
    >
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.015]">
        <div className="absolute inset-5 rounded-xl border border-[#b8f500]/10">
          <div className="absolute left-1/2 top-0 h-full w-px bg-[#b8f500]/10" />
        </div>

        {!disabled && (
          <div className="absolute right-4 top-4 rounded-full bg-[#b8f500] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-black">
            Available
          </div>
        )}

        <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[0.2em] text-white/20">
          PADEL COURT
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">
              {name}
            </h3>

            <p className="mt-1 text-xs text-white/30">
              {city}
            </p>
          </div>

          <span className="text-xs text-white/40">
            {price}
          </span>
        </div>

        {!disabled && (
          <div className="mt-5 text-xs font-medium text-white/35 transition group-hover:text-[#b8f500]">
            View courts →
          </div>
        )}
      </div>
    </button>
  );
}