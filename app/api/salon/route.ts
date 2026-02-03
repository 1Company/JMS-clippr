import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { salonName, phone, street, city, postalCode, userId } = body;

    if (!salonName) {
      return NextResponse.json({ error: "Salon name required" }, { status: 400 });
    }

    // Generate unique slug
    let slug = generateSlug(salonName);
    let slugExists = await prisma.salon.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(salonName)}-${counter}`;
      slugExists = await prisma.salon.findUnique({ where: { slug } });
      counter++;
    }

    // Create salon with opening hours
    const salon = await prisma.salon.create({
      data: {
        name: salonName,
        slug,
        phone,
        street,
        city,
        postalCode,
        ownerId: userId || session.user.id,
        openingHours: {
          create: [
            { dayOfWeek: 0, openTime: "10:00", closeTime: "17:00", isClosed: true },
            { dayOfWeek: 1, openTime: "09:00", closeTime: "17:00", isClosed: false },
            { dayOfWeek: 2, openTime: "09:00", closeTime: "17:00", isClosed: false },
            { dayOfWeek: 3, openTime: "09:00", closeTime: "17:00", isClosed: false },
            { dayOfWeek: 4, openTime: "09:00", closeTime: "21:00", isClosed: false },
            { dayOfWeek: 5, openTime: "09:00", closeTime: "17:00", isClosed: false },
            { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false },
          ],
        },
      },
    });

    return NextResponse.json(salon);
  } catch (error) {
    console.error("Create salon error:", error);
    return NextResponse.json(
      { error: "Failed to create salon" },
      { status: 500 }
    );
  }
}
