"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Club = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  courts: Array<{
    id: string;
    name: string;
    price: number;
  }>;
};

type ClubsResponse = {
  success?: boolean;
  data?: Club[];
  error?: string;
};

export default function ClubsPage() {
  const router = useRouter();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    async function loadClubs() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/clubs", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch clubs");
        }

        const data: ClubsResponse = await response.json();
        const clubList = data.data || [];

        setClubs(clubList);
        setFilteredClubs(clubList);

        // Extract unique cities
        const uniqueCities = Array.from(
          new Set(clubList.map((club) => club.city))
        );
        setCities(uniqueCities);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    // Load clubs immediately
    loadClubs();

    // Auto-refresh every 5 seconds to show latest prices
    const interval = setInterval(loadClubs, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchCity) {
      setFilteredClubs(
        clubs.filter((club) =>
          club.city.toLowerCase().includes(searchCity.toLowerCase())
        )
      );
    } else {
      setFilteredClubs(clubs);
    }
  }, [searchCity, clubs]);

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

          <a
            href="/home"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Back to home
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm uppercase tracking-widest text-[#b8f500]">
            All clubs
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Browse padel clubs
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/60">
            Explore all available padel clubs, their locations, and available
            courts
          </p>

          {/* Search Filter */}
          <div className="mt-8">
            <div className="flex flex-col gap-4 md:flex-row">
              <input
                type="text"
                placeholder="Search by city..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-white/40 transition focus:border-[#b8f500] focus:outline-none focus:ring-1 focus:ring-[#b8f500]"
              />

              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white transition focus:border-[#b8f500] focus:outline-none focus:ring-1 focus:ring-[#b8f500]"
              >
                <option value="">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
              >
                <div className="h-6 w-48 rounded bg-white/10"></div>
                <div className="mt-4 h-4 w-96 rounded bg-white/10"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="text-center">
            <p className="text-white/60">No clubs found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 transition hover:border-[#b8f500]/50 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold">{club.name}</h2>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-widest text-white/40">
                          City
                        </span>
                        <p className="text-sm text-white/80">{club.city}</p>
                      </div>

                      {club.address && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-widest text-white/40">
                            Address
                          </span>
                          <p className="text-sm text-white/80">{club.address}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-widest text-white/40">
                          Courts
                        </span>
                        <p className="text-sm text-white/80">
                          {club.courts.length}
                        </p>
                      </div>
                    </div>

                    {club.description && (
                      <p className="mt-4 text-sm leading-6 text-white/60">
                        {club.description}
                      </p>
                    )}

                    {/* Courts List */}
                    <div className="mt-6">
                      <p className="text-xs uppercase tracking-widest text-white/40">
                        Available courts
                      </p>

                      <div className="mt-3 grid gap-2">
                        {club.courts.map((court) => (
                          <div
                            key={court.id}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                          >
                            <span className="text-sm font-medium">
                              {court.name}
                            </span>
                            <span className="text-sm text-[#b8f500]">
                              ${court.price}/h
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/courts")}
                  className="mt-6 w-full rounded-lg bg-[#b8f500] px-4 py-3 font-semibold text-black transition hover:bg-[#a8e500] md:w-auto"
                >
                  Book a court
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}