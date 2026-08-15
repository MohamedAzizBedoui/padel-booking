
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_SLOTS = [
  ["09:00", "10:30"],
  ["10:30", "12:00"],
  ["12:00", "13:30"],
  ["13:30", "15:00"],
  ["15:00", "16:30"],
  ["16:30", "18:00"],
  ["18:00", "19:30"],
  ["19:30", "21:00"],
  ["21:00", "22:30"],
] as const;

/**
 * GET /api/bookings
 *
 * Returns the bookings belonging to the currently
 * authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        court: true,
        club: true,
      },
      orderBy: [
        {
          date: "asc",
        },
        {
          startTime: "asc",
        },
      ],
    });

    // Auto-mark past CONFIRMED bookings as COMPLETED
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    for (const booking of bookings) {
      if (booking.status === "CONFIRMED") {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);

        // If booking date is in the past, mark as COMPLETED
        if (bookingDate < now) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: "COMPLETED" },
          });

          // Update the booking object in memory for response
          booking.status = "COMPLETED";
        }
      }
    }

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bookings.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 *
 * Creates a booking for the currently authenticated user.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to book a court.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      date,
      startTime,
      endTime,
      courtId,
      clubId,
    } = body;

    /*
     * Validate required fields.
     */
    if (
      !customerName ||
      !customerPhone ||
      !date ||
      !startTime ||
      !endTime ||
      !courtId ||
      !clubId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required booking information.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate date format.
     */
    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date.",
        },
        { status: 400 }
      );
    }

    const [year, month, day] = date
      .split("-")
      .map(Number);

    const selectedDate = new Date(
      Date.UTC(year, month - 1, day)
    );

    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate booking slot.
     */
    const validSlot = VALID_SLOTS.some(
      ([validStart, validEnd]) =>
        validStart === startTime &&
        validEnd === endTime
    );

    if (!validSlot) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid booking time. All bookings must be 1h30.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate the court.
     */
    const court = await prisma.court.findUnique({
      where: {
        id: courtId,
      },
    });

    if (!court) {
      return NextResponse.json(
        {
          success: false,
          error: "Court not found.",
        },
        { status: 404 }
      );
    }

    if (!court.active) {
      return NextResponse.json(
        {
          success: false,
          error: "This court is not available.",
        },
        { status: 400 }
      );
    }

    /*
     * Make sure the court belongs to the selected club.
     */
    if (court.clubId !== clubId) {
      return NextResponse.json(
        {
          success: false,
          error: "Court does not belong to this club.",
        },
        { status: 400 }
      );
    }

    /*
     * Prevent booking a slot in the past.
     */
    const [hours, minutes] = startTime
      .split(":")
      .map(Number);

    const bookingStart = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0,
      0
    );

    if (bookingStart <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot book a time slot that has already passed.",
        },
        { status: 400 }
      );
    }

    /*
     * Find bookings for this court on this date.
     *
     * CANCELLED bookings do not block the slot.
     */
    const startOfDay = new Date(
      Date.UTC(year, month - 1, day)
    );

    const startOfNextDay = new Date(
      Date.UTC(year, month - 1, day + 1)
    );  

    const existingBooking =
      await prisma.booking.findFirst({
        where: {
          courtId,
          date: {
            gte: startOfDay,
            lt: startOfNextDay,
          },
          startTime,
          endTime,
          status: "CONFIRMED",
        },
      });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This time slot has already been booked.",
        },
        { status: 409 }
      );
    }

    /*
     * Create the booking.
     *
     * userId comes directly from the authenticated
     * NextAuth session.
     */
    const booking = await prisma.booking.create({
      data: {
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        customerEmail: customerEmail
          ? String(customerEmail).trim().toLowerCase()
          : null,

        date: selectedDate,

        startTime,
        endTime,

        price: court.price,

        status: "CONFIRMED",

        courtId,
        clubId,

        userId: session.user.id,
      },

      include: {
        court: true,
        club: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create booking.",
      },
      { status: 500 }
    );
  }
}

