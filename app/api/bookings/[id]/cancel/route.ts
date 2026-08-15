import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found",
        },
        { status: 404 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Booking is already cancelled",
        },
        { status: 400 }
      );
    }

    const cancelledBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel booking",
      },
      { status: 500 }
    );
  }
}