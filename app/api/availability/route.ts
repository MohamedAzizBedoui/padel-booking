import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SLOTS = [
  ["09:00", "10:30"],
  ["10:30", "12:00"],
  ["12:00", "13:30"],
  ["13:30", "15:00"],
  ["15:00", "16:30"],
  ["16:30", "18:00"],
  ["18:00", "19:30"],
  ["19:30", "21:00"],
  ["21:00", "22:30"],
];

export async function GET(request: NextRequest) {
  try {
    const courtId = request.nextUrl.searchParams.get("courtId");
    const date = request.nextUrl.searchParams.get("date");

    if (!courtId || !date) {
      return NextResponse.json(
        { error: "courtId and date are required" },
        { status: 400 }
      );
    }

    // Parse requested calendar date
    const [year, month, day] = date.split("-").map(Number);

    if (
      !year ||
      !month ||
      !day ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    /*
     * Database dates are stored in UTC.
     * Search the entire requested calendar day.
     */
    const startOfDay = new Date(
      Date.UTC(year, month - 1, day)
    );

    const startOfNextDay = new Date(
      Date.UTC(year, month - 1, day + 1)
    );

    /*
     * Get existing bookings for this court and day.
     *
     * CANCELLED bookings do not block the slot.
     */
    const bookings = await prisma.booking.findMany({
      where: {
        courtId,
        date: {
          gte: startOfDay,
          lt: startOfNextDay,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    /*
     * Current local time.
     *
     * Your booking system is operating in Tunisia,
     * so we compare the requested calendar date/time
     * against Tunisia time.
     */
    const now = new Date();

    const tunisiaDateFormatter = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Africa/Tunis",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

    const tunisiaTimeFormatter = new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: "Africa/Tunis",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    );

    const currentTunisiaDate =
      tunisiaDateFormatter.format(now);

    const currentTunisiaTime =
      tunisiaTimeFormatter.format(now);

    /*
     * Determine whether the requested date is:
     *
     * - in the past
     * - today
     * - in the future
     */
    const requestedDateNumber = Number(
      date.replaceAll("-", "")
    );

    const todayDateNumber = Number(
      currentTunisiaDate.replaceAll("-", "")
    );

    const dateIsPast =
      requestedDateNumber < todayDateNumber;

    const dateIsToday =
      requestedDateNumber === todayDateNumber;

    const slots = SLOTS.map(([startTime, endTime]) => {
      /*
       * Check whether this exact slot is already booked.
       */
      const booked = bookings.some(
        (booking) =>
          booking.startTime === startTime &&
          booking.endTime === endTime
      );

      /*
       * A slot is in the past if:
       *
       * - the selected date is before today
       * OR
       * - the selected date is today and its start time
       *   has already passed.
       */
      const timeHasPassed =
        dateIsPast ||
        (dateIsToday && startTime <= currentTunisiaTime);

      return {
        startTime,
        endTime,

        /*
         * Available only when:
         *
         * 1. It isn't already booked
         * 2. It hasn't already passed
         */
        available: !booked && !timeHasPassed,
      };
    });

    return NextResponse.json({
      courtId,
      date,
      durationMinutes: 90,
      slots,
    });
  } catch (error) {
    console.error("Availability error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch availability",
      },
      { status: 500 }
    );
  }
}