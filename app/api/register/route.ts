import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { salonName, name, email, phone } = body;

    if (!salonName || !name || !email) {
      return NextResponse.json(
        { error: "Verplichte velden ontbreken" },
        { status: 400 }
      );
    }

    // Check of email al bestaat
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is al in gebruik" },
        { status: 400 }
      );
    }

    // Genereer unieke slug
    let slug = generateSlug(salonName);
    let slugExists = await prisma.salon.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(salonName)}-${counter}`;
      slugExists = await prisma.salon.findUnique({ where: { slug } });
      counter++;
    }

    // Maak user + salon aan in één transactie
    const result = await prisma.$transaction(async (tx) => {
      // 1. Maak user aan
      const user = await tx.user.create({
        data: {
          email,
          name,
          phone,
          role: "OWNER",
        },
      });

      // 2. Maak salon aan
      const salon = await tx.salon.create({
        data: {
          name: salonName,
          slug,
          ownerId: user.id,
          // Default openingstijden (ma-za 9-17, zo dicht)
          openingHours: {
            create: [
              { dayOfWeek: 0, openTime: "10:00", closeTime: "17:00", isClosed: true }, // Zondag
              { dayOfWeek: 1, openTime: "09:00", closeTime: "17:00", isClosed: false }, // Maandag
              { dayOfWeek: 2, openTime: "09:00", closeTime: "17:00", isClosed: false }, // Dinsdag
              { dayOfWeek: 3, openTime: "09:00", closeTime: "17:00", isClosed: false }, // Woensdag
              { dayOfWeek: 4, openTime: "09:00", closeTime: "21:00", isClosed: false }, // Donderdag (koopavond)
              { dayOfWeek: 5, openTime: "09:00", closeTime: "17:00", isClosed: false }, // Vrijdag
              { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false }, // Zaterdag
            ],
          },
        },
      });

      return { user, salon };
    });

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      salonId: result.salon.id,
      slug: result.salon.slug,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij de registratie" },
      { status: 500 }
    );
  }
}
