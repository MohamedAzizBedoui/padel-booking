"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

type Props = {
  courtId: string;
  courtName: string;
  price: number;
  clubId: string;
  clubName: string;
  date: string;
};

export default function CourtAvailability({
  courtId,
  courtName,
  price,
  clubId,
  clubName,
  date,
}: Props) {
  const router = useRouter();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedSlot, setSelectedSlot] =
    useState<Slot | null>(null);

  const [showBookingForm, setShowBookingForm] =
    useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [bookingError, setBookingError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadAvailability() {
      setLoading(true);
      setSelectedSlot(null);
      setBookingError(null);

      try {
        const response = await fetch(
          `/api/availability?courtId=${encodeURIComponent(
            courtId
          )}&date=${encodeURIComponent(date)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load availability");
        }

        const data = await response.json();

        setSlots(data.slots ?? []);
      } catch (error) {
        console.error("Availability error:", error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, [courtId, date]);

  async function handleBooking(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedSlot) {
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          courtId,
          clubId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create booking."
        );
      }

      router.push(`/bookings/${data.booking.id}`);
    } catch (error) {
      console.error("Booking error:", error);

      setBookingError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  function closeModal() {
    if (bookingLoading) {
      return;
    }

    setShowBookingForm(false);
    setBookingError(null);
    setSelectedSlot(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
  }

  if (loading) {
    return (
      <p className="mt-4 text-sm text-white/40">
        Loading availability...
      </p>
    );
  }

  return (
    <>
      <div className="mt-5">
        <p className="mb-3 text-xs uppercase tracking-wider text-white/40">
          Available times · 1h30
        </p>

        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot) => (
            <button
              key={`${slot.startTime}-${slot.endTime}`}
              type="button"
              disabled={!slot.available}
              onClick={() => {
                if (slot.available) {
                  setSelectedSlot(slot);
                  setBookingError(null);
                }
              }}
              className={`rounded-lg px-3 py-2 text-xs transition ${
                !slot.available
                  ? "cursor-not-allowed bg-white/5 text-white/20 line-through"
                  : selectedSlot?.startTime ===
                      slot.startTime &&
                    selectedSlot?.endTime ===
                      slot.endTime
                  ? "bg-[#b8f500] text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {slot.startTime} – {slot.endTime}
            </button>
          ))}
        </div>

        {selectedSlot && (
          <button
            type="button"
            onClick={() => {
              setBookingError(null);
              setShowBookingForm(true);
            }}
            className="mt-4 w-full rounded-xl bg-[#b8f500] py-3 text-sm font-semibold text-black transition hover:bg-[#c8ff33]"
          >
            Book {selectedSlot.startTime}
          </button>
        )}
      </div>

      {showBookingForm && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#b8f500]">
                  Confirm booking
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {clubName}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={bookingLoading}
                className="rounded-full p-2 text-white/40 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Booking details */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-white/40">
                  Court
                </span>

                <span className="text-right text-sm font-medium">
                  {courtName}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-sm text-white/40">
                  Date
                </span>

                <span className="text-right text-sm">
                  {date}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-sm text-white/40">
                  Time
                </span>

                <span className="text-right text-sm">
                  {selectedSlot.startTime} –{" "}
                  {selectedSlot.endTime}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4">
                <span className="text-sm text-white/40">
                  Duration
                </span>

                <span className="text-sm">
                  1h30
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4 border-t border-white/10 pt-3">
                <span className="text-sm text-white/40">
                  Total
                </span>

                <span className="font-semibold text-[#b8f500]">
                  {price} DT
                </span>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleBooking}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-xs text-white/50">
                  Full name
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Your full name"
                  required
                  disabled={bookingLoading}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#b8f500] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/50">
                  Phone number
                </label>

                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) =>
                    setCustomerPhone(event.target.value)
                  }
                  placeholder="+216 XX XXX XXX"
                  required
                  disabled={bookingLoading}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#b8f500] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/50">
                  Email{" "}
                  <span className="text-white/20">
                    (optional)
                  </span>
                </label>

                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) =>
                    setCustomerEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  disabled={bookingLoading}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#b8f500] disabled:opacity-50"
                />
              </div>

              {bookingError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {bookingError}
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full rounded-xl bg-[#b8f500] py-3.5 text-sm font-semibold text-black transition hover:bg-[#c8ff33] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookingLoading
                  ? "Confirming..."
                  : `Confirm booking · ${price} DT`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}