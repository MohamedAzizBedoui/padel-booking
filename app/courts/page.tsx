import { prisma } from "@/lib/prisma";
import CourtAvailability from "./CourtAvailability";
import DateSelector from "./DateSelector";

type Court = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};

type Club = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  courts: Court[];
};

async function getClubs(city?: string): Promise<Club[]> {
  const clubs = await prisma.club.findMany({
    where: city
      ? {
          city: {
            equals: city,
            mode: "insensitive",
          },
        }
      : undefined,
    include: {
      courts: true,
    },
  });

  return clubs;
}

export default async function CourtsPage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string;
    date?: string;
  }>;
}) {
  const params = await searchParams;

  const location = params.location;

  const date =
    params.date ||
    new Date().toISOString().split("T")[0];

  const clubs = await getClubs(location);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/home"
            className="text-2xl font-bold tracking-tight"
          >
            PADEL
            <span className="text-[#b8f500]">
              BOOK
            </span>
          </a>

          <a
            href="/home"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Back to home
          </a>
        </div>
      </nav>

      {/* Search summary */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm uppercase tracking-widest text-[#b8f500]">
            Available courts
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Find your court
          </h1>

          <div className="mt-6 flex flex-wrap gap-3">
            {location && (
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70">
                Location:{" "}
                <span className="text-white">
                  {location}
                </span>
              </div>
            )}

            <DateSelector
              date={date}
              location={location}
            />

            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70">
              Duration:{" "}
              <span className="text-white">
                1h30
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-12">
          {clubs.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <h2 className="text-xl font-semibold">
                No clubs found
              </h2>

              <p className="mt-2 text-white/40">
                We don't have any padel clubs in{" "}
                {location || "this location"} yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="p-6 md:p-8">
                    {/* Club information */}
                    <div className="flex flex-col justify-between gap-6 md:flex-row">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {club.name}
                        </h2>

                        {club.address && (
                          <p className="mt-2 text-sm text-white/40">
                            {club.address}
                          </p>
                        )}

                        {club.description && (
                          <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
                            {club.description}
                          </p>
                        )}
                      </div>

                      <div className="text-sm text-white/40">
                        {club.courts.length} courts
                      </div>
                    </div>

                    {/* Courts */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {club.courts
                        .filter((court) => court.active)
                        .map((court) => (
                          <div
                            key={court.id}
                            className="rounded-2xl border border-white/10 bg-black/20 p-5"
                          >
                            {/* Court header */}
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                {court.name}
                              </h3>

                              <span className="text-sm text-[#b8f500]">
                                {court.price} DT
                              </span>
                            </div>

                            <p className="mt-3 text-xs text-white/30">
                              Per 1h30
                            </p>

                            {/* Availability */}
                            <CourtAvailability
                              courtId={court.id}
                              courtName={court.name}
                              price={court.price}
                              clubId={club.id}
                              clubName={club.name}
                              date={date}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}