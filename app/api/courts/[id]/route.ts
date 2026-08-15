import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * PATCH /api/courts/[id]
 * 
 * Update a court's details (price, name, etc)
 * Only the court owner or admin can update
 */
export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { price, name } = body;

    // Validate input
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return NextResponse.json(
        { success: false, error: "Invalid price" },
        { status: 400 }
      );
    }

    // Find the court and its club
    const court = await prisma.court.findUnique({
      where: { id },
      include: { club: true },
    });

    if (!court) {
      return NextResponse.json(
        { success: false, error: "Court not found" },
        { status: 404 }
      );
    }

    // Check authorization (only club owner or admin can update)
    if (court.club.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update court
    const updatedCourt = await prisma.court.update({
      where: { id },
      data: {
        ...(price !== undefined && { price }),
        ...(name && { name }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Court updated successfully",
      court: updatedCourt,
    });
  } catch (error) {
    console.error("Update court error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update court",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courts/[id]
 * 
 * Get a specific court's details
 */
export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    const court = await prisma.court.findUnique({
      where: { id },
      include: { club: true },
    });

    if (!court) {
      return NextResponse.json(
        { success: false, error: "Court not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      court,
    });
  } catch (error) {
    console.error("Get court error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch court",
      },
      { status: 500 }
    );
  }
}
