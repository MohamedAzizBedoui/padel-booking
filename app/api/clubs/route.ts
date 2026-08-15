import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city");

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

    return NextResponse.json(clubs);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}