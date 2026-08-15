import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingPage({ params }: Props) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
    include: {
      court: true,
      club: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const formattedDate = booking.date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cancelled = booking.status === "CANCELLED";
  const canCancel = booking.status === "CONFIRMED";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <a
            href="/home"
            className="text-2xl font-bold tracking-tight"
          >
            PADEL<span className="text-[#b8f500]">BOOK</span>
          </a>

          <a
            href="/courts"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Find another court
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-2xl px-6 py-12 md:py-20">
        <div className="text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
              cancelled
                ? "bg-red-500/10 text-red-400"
                : booking.status === "COMPLETED"
                ? "bg-green-500/10 text-green-400"
                : "bg-[#b8f500] text-black"
            }`}
          >
            {cancelled ? "×" : booking.status === "COMPLETED" ? "✓" : "✓"}
          </div>

          <p
            className={`mt-6 text-xs uppercase tracking-[0.2em] ${
              cancelled
                ? "text-red-400"
                : booking.status === "COMPLETED"
                ? "text-green-400"
                : "text-[#b8f500]"
            }`}
          >
            {cancelled
              ? "Booking cancelled"
              : booking.status === "COMPLETED"
              ? "Booking completed"
              : "Booking confirmed"}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            {cancelled
              ? "Your booking was cancelled"
              : booking.status === "COMPLETED"
              ? "Booking completed"
              : "You're booked"}
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/40">
            {cancelled
              ? "This booking is no longer active."
              : booking.status === "COMPLETED"
              ? "This booking has been completed."
              : "Your court has been successfully reserved."}
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 p-6">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Club
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              {booking.club.name}
            </h2>

            {booking.club.address && (
              <p className="mt-1 text-sm text-white/40">
                {booking.club.address}
              </p>
            )}
          </div>

          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/40">
                Court
              </span>

              <span className="text-sm font-medium">
                {booking.court.name}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/40">
                Date
              </span>

              <span className="text-right text-sm">
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/40">
                Time
              </span>

              <span className="text-sm">
                {booking.startTime} – {booking.endTime}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/40">
                Duration
              </span>

              <span className="text-sm">
                1h30
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
              <span className="text-sm text-white/40">
                Total
              </span>

              <span className="text-lg font-semibold text-[#b8f500]">
                {booking.price} DT
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 p-6">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Customer
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-white/40">
                  Name
                </span>

                <span className="text-right text-sm">
                  {booking.customerName}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-white/40">
                  Phone
                </span>

                <span className="text-right text-sm">
                  {booking.customerPhone}
                </span>
              </div>

              {booking.customerEmail && (
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-white/40">
                    Email
                  </span>

                  <span className="max-w-[60%] break-all text-right text-sm">
                    {booking.customerEmail}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 p-6">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Booking reference
            </p>

            <p className="mt-2 break-all font-mono text-sm text-white/60">
              {booking.id}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="/home"
            className="flex-1 rounded-xl border border-white/10 py-3.5 text-center text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Back to home
          </a>

          {canCancel && (
            <a
              href={`/bookings/${booking.id}/cancel`}
              className="flex-1 rounded-xl border border-red-500/20 py-3.5 text-center text-sm text-red-400 transition hover:bg-red-500/10"
            >
              Cancel booking
            </a>
          )}
        </div>
      </section>
    </main>
  );
}