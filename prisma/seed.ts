import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Clippr database...\n");

  // 1. Create user (Arnold)
  const user = await prisma.user.upsert({
    where: { email: "ahuisman5005@gmail.com" },
    update: {},
    create: {
      email: "ahuisman5005@gmail.com",
      name: "Arnold Huisman",
      phone: "+31647103459",
      role: "OWNER",
    },
  });
  console.log("✅ User:", user.email);

  // 2. Create salon
  const salon = await prisma.salon.upsert({
    where: { slug: "kapsalon-arnhem" },
    update: {},
    create: {
      name: "Kapsalon Arnhem",
      slug: "kapsalon-arnhem",
      description: "De gezelligste kapsalon van Arnhem. Vakkundige knipbeurten in een relaxte sfeer.",
      phone: "026 351 2000",
      email: "info@kapsalonarnhem.nl",
      street: "Korenmarkt 12",
      city: "Arnhem",
      postalCode: "6811 GW",
      ownerId: user.id,
      bufferMinutes: 5,
    },
  });
  console.log("✅ Salon:", salon.name, `(/book/${salon.slug})`);

  // 3. Opening hours (ma-za open, zo gesloten)
  const hours = [
    { day: 0, open: "10:00", close: "17:00", closed: true },  // Zondag - dicht
    { day: 1, open: "09:00", close: "18:00", closed: false },  // Maandag
    { day: 2, open: "09:00", close: "18:00", closed: false },  // Dinsdag
    { day: 3, open: "09:00", close: "20:00", closed: false },  // Woensdag (koopavond)
    { day: 4, open: "09:00", close: "20:00", closed: false },  // Donderdag (koopavond)
    { day: 5, open: "09:00", close: "18:00", closed: false },  // Vrijdag
    { day: 6, open: "09:00", close: "17:00", closed: false },  // Zaterdag
  ];

  // Delete existing opening hours for this salon
  await prisma.openingHours.deleteMany({ where: { salonId: salon.id } });

  for (const h of hours) {
    await prisma.openingHours.create({
      data: {
        salonId: salon.id,
        dayOfWeek: h.day,
        openTime: h.open,
        closeTime: h.close,
        isClosed: h.closed,
      },
    });
  }
  console.log("✅ Opening hours: ma-za open, zo dicht");

  // 4. Service categories
  const catKnippen = await prisma.serviceCategory.upsert({
    where: { id: "cat-knippen" },
    update: {},
    create: { id: "cat-knippen", name: "Knippen", sortOrder: 1, salonId: salon.id },
  });
  const catKleuren = await prisma.serviceCategory.upsert({
    where: { id: "cat-kleuren" },
    update: {},
    create: { id: "cat-kleuren", name: "Kleuren", sortOrder: 2, salonId: salon.id },
  });
  const catStyling = await prisma.serviceCategory.upsert({
    where: { id: "cat-styling" },
    update: {},
    create: { id: "cat-styling", name: "Styling", sortOrder: 3, salonId: salon.id },
  });
  const catVerzorging = await prisma.serviceCategory.upsert({
    where: { id: "cat-verzorging" },
    update: {},
    create: { id: "cat-verzorging", name: "Verzorging", sortOrder: 4, salonId: salon.id },
  });
  console.log("✅ Categorieën: Knippen, Kleuren, Styling, Verzorging");

  // 5. Services
  const services = await Promise.all([
    prisma.service.upsert({ where: { id: "svc-dames-knippen" }, update: {}, create: { id: "svc-dames-knippen", name: "Dames knippen", description: "Wassen, knippen en föhnen", duration: 45, price: 42.50, sortOrder: 1, salonId: salon.id, categoryId: catKnippen.id } }),
    prisma.service.upsert({ where: { id: "svc-heren-knippen" }, update: {}, create: { id: "svc-heren-knippen", name: "Heren knippen", description: "Knippen en stylen", duration: 30, price: 28.00, sortOrder: 2, salonId: salon.id, categoryId: catKnippen.id } }),
    prisma.service.upsert({ where: { id: "svc-kinder-knippen" }, update: {}, create: { id: "svc-kinder-knippen", name: "Kinder knippen", description: "t/m 12 jaar", duration: 25, price: 19.50, sortOrder: 3, salonId: salon.id, categoryId: catKnippen.id } }),
    prisma.service.upsert({ where: { id: "svc-pony-knippen" }, update: {}, create: { id: "svc-pony-knippen", name: "Pony bijknippen", description: "Alleen de pony", duration: 10, price: 8.00, sortOrder: 4, salonId: salon.id, categoryId: catKnippen.id } }),
    prisma.service.upsert({ where: { id: "svc-highlights" }, update: {}, create: { id: "svc-highlights", name: "Highlights", description: "Folies of balayage", duration: 90, price: 85.00, sortOrder: 1, salonId: salon.id, categoryId: catKleuren.id } }),
    prisma.service.upsert({ where: { id: "svc-kleuring" }, update: {}, create: { id: "svc-kleuring", name: "Volledige kleuring", description: "Uitgroei of volledig", duration: 75, price: 65.00, sortOrder: 2, salonId: salon.id, categoryId: catKleuren.id } }),
    prisma.service.upsert({ where: { id: "svc-toner" }, update: {}, create: { id: "svc-toner", name: "Toner / Gloss", description: "Glanzende kleurrefresh", duration: 30, price: 35.00, sortOrder: 3, salonId: salon.id, categoryId: catKleuren.id } }),
    prisma.service.upsert({ where: { id: "svc-bruidskapper" }, update: {}, create: { id: "svc-bruidskapper", name: "Bruidskapsel", description: "Inclusief proefkapsel", duration: 120, price: 150.00, sortOrder: 1, salonId: salon.id, categoryId: catStyling.id } }),
    prisma.service.upsert({ where: { id: "svc-opsteken" }, update: {}, create: { id: "svc-opsteken", name: "Feestkapsel / Opsteken", description: "Gala, bruiloft, feest", duration: 60, price: 55.00, sortOrder: 2, salonId: salon.id, categoryId: catStyling.id } }),
    prisma.service.upsert({ where: { id: "svc-treatment" }, update: {}, create: { id: "svc-treatment", name: "Haar behandeling", description: "Keratine of deep conditioning", duration: 45, price: 45.00, sortOrder: 1, salonId: salon.id, categoryId: catVerzorging.id } }),
    prisma.service.upsert({ where: { id: "svc-wassen-fohnen" }, update: {}, create: { id: "svc-wassen-fohnen", name: "Wassen & Föhnen", description: "Zonder knippen", duration: 30, price: 25.00, sortOrder: 2, salonId: salon.id, categoryId: catVerzorging.id } }),
  ]);
  console.log(`✅ ${services.length} behandelingen aangemaakt`);

  // 6. Staff
  const staffData = [
    { id: "staff-lisa", name: "Lisa de Vries", phone: "06 12345678", color: "#8B5CF6", order: 1 },
    { id: "staff-mark", name: "Mark Jansen", phone: "06 23456789", color: "#3B82F6", order: 2 },
    { id: "staff-sara", name: "Sara Bakker", phone: "06 34567890", color: "#EC4899", order: 3 },
    { id: "staff-tom", name: "Tom de Groot", phone: "06 45678901", color: "#10B981", order: 4 },
  ];

  const staffMembers = [];
  for (const s of staffData) {
    const member = await prisma.staff.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        displayName: s.name,
        phone: s.phone,
        color: s.color,
        sortOrder: s.order,
        salonId: salon.id,
      },
    });
    staffMembers.push(member);
  }
  console.log(`✅ ${staffMembers.length} medewerkers: Lisa, Mark, Sara, Tom`);

  // 7. Staff schedules
  await prisma.staffSchedule.deleteMany({
    where: { staffId: { in: staffMembers.map(s => s.id) } },
  });

  for (const member of staffMembers) {
    for (let day = 0; day <= 6; day++) {
      // Everyone works Mon-Fri, Sara also Sat, nobody on Sunday
      let isWorking = day >= 1 && day <= 5;
      if (member.id === "staff-sara" && day === 6) isWorking = true; // Sara works Saturday
      if (member.id === "staff-tom" && day === 1) isWorking = false; // Tom vrij op maandag

      await prisma.staffSchedule.create({
        data: {
          staffId: member.id,
          dayOfWeek: day,
          isWorking,
          startTime: day === 6 ? "09:00" : "09:00",
          endTime: day === 6 ? "17:00" : (day === 3 || day === 4 ? "20:00" : "18:00"),
        },
      });
    }
  }
  console.log("✅ Werkroosters ingesteld");

  // 8. Staff-Service koppelingen
  await prisma.staffService.deleteMany({
    where: { staffId: { in: staffMembers.map(s => s.id) } },
  });

  // Lisa: alles behalve heren knippen
  // Mark: knippen (dames + heren + kinder + pony)
  // Sara: alles (colorist + knippen + styling)
  // Tom: knippen + verzorging
  const staffSkills: Record<string, string[]> = {
    "staff-lisa": ["svc-dames-knippen", "svc-kinder-knippen", "svc-pony-knippen", "svc-highlights", "svc-kleuring", "svc-toner", "svc-bruidskapper", "svc-opsteken", "svc-treatment", "svc-wassen-fohnen"],
    "staff-mark": ["svc-dames-knippen", "svc-heren-knippen", "svc-kinder-knippen", "svc-pony-knippen", "svc-wassen-fohnen"],
    "staff-sara": ["svc-dames-knippen", "svc-heren-knippen", "svc-kinder-knippen", "svc-pony-knippen", "svc-highlights", "svc-kleuring", "svc-toner", "svc-bruidskapper", "svc-opsteken", "svc-treatment", "svc-wassen-fohnen"],
    "staff-tom": ["svc-dames-knippen", "svc-heren-knippen", "svc-kinder-knippen", "svc-pony-knippen", "svc-treatment", "svc-wassen-fohnen"],
  };

  for (const [staffId, serviceIds] of Object.entries(staffSkills)) {
    for (const serviceId of serviceIds) {
      await prisma.staffService.create({ data: { staffId, serviceId } });
    }
  }
  console.log("✅ Staff-service koppelingen");

  // 9. Customers
  const customers = await Promise.all([
    prisma.customer.upsert({ where: { salonId_email: { salonId: salon.id, email: "emma@gmail.com" } }, update: {}, create: { name: "Emma van Dijk", email: "emma@gmail.com", phone: "06 11111111", salonId: salon.id, notes: "Voorkeur voor Lisa" } }),
    prisma.customer.upsert({ where: { salonId_email: { salonId: salon.id, email: "jan@outlook.nl" } }, update: {}, create: { name: "Jan Smit", email: "jan@outlook.nl", phone: "06 22222222", salonId: salon.id } }),
    prisma.customer.upsert({ where: { salonId_email: { salonId: salon.id, email: "sophie@hotmail.com" } }, update: {}, create: { name: "Sophie Mulder", email: "sophie@hotmail.com", phone: "06 33333333", salonId: salon.id, notes: "Allergie voor bepaalde kleurstoffen" } }),
    prisma.customer.upsert({ where: { salonId_email: { salonId: salon.id, email: "peter@gmail.com" } }, update: {}, create: { name: "Peter Visser", email: "peter@gmail.com", phone: "06 44444444", salonId: salon.id } }),
    prisma.customer.upsert({ where: { salonId_email: { salonId: salon.id, email: "anna@icloud.com" } }, update: {}, create: { name: "Anna de Boer", email: "anna@icloud.com", phone: "06 55555555", salonId: salon.id } }),
    prisma.customer.upsert({ where: { salonId_email: { salonId: salon.id, email: "thomas@ziggo.nl" } }, update: {}, create: { name: "Thomas Hendriks", email: "thomas@ziggo.nl", phone: "06 66666666", salonId: salon.id } }),
    prisma.customer.upsert({ where: { salonId_email: { salonId: salon.id, email: "lisa.k@gmail.com" } }, update: {}, create: { name: "Lisa Kramer", email: "lisa.k@gmail.com", phone: "06 77777777", salonId: salon.id, notes: "Wil altijd thee" } }),
    prisma.customer.upsert({ where: { salonId_email: { salonId: salon.id, email: "rob@werk.nl" } }, update: {}, create: { name: "Rob Willems", email: "rob@werk.nl", phone: "06 88888888", salonId: salon.id } }),
  ]);
  console.log(`✅ ${customers.length} klanten aangemaakt`);

  // 10. Bookings - mix of past and upcoming
  // Delete existing bookings to avoid conflicts
  await prisma.booking.deleteMany({ where: { salonId: salon.id } });

  const now = new Date();
  const bookings = [];

  // Helper to create a date at specific time
  const makeDate = (daysFromNow: number, hour: number, minute: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const makeEndDate = (start: Date, durationMin: number) => {
    return new Date(start.getTime() + durationMin * 60000);
  };

  // Today's bookings
  const todayBookingsData = [
    { start: makeDate(0, 9, 0), svc: "svc-dames-knippen", staff: "staff-lisa", customer: customers[0], price: 42.50, dur: 45 },
    { start: makeDate(0, 9, 30), svc: "svc-heren-knippen", staff: "staff-mark", customer: customers[1], price: 28.00, dur: 30 },
    { start: makeDate(0, 10, 0), svc: "svc-highlights", staff: "staff-sara", customer: customers[2], price: 85.00, dur: 90 },
    { start: makeDate(0, 10, 0), svc: "svc-kinder-knippen", staff: "staff-tom", customer: customers[3], price: 19.50, dur: 25 },
    { start: makeDate(0, 11, 0), svc: "svc-dames-knippen", staff: "staff-lisa", customer: customers[4], price: 42.50, dur: 45 },
    { start: makeDate(0, 13, 0), svc: "svc-kleuring", staff: "staff-sara", customer: customers[5], price: 65.00, dur: 75 },
    { start: makeDate(0, 14, 0), svc: "svc-heren-knippen", staff: "staff-mark", customer: customers[6], price: 28.00, dur: 30 },
    { start: makeDate(0, 15, 0), svc: "svc-treatment", staff: "staff-tom", customer: customers[7], price: 45.00, dur: 45 },
  ];

  // Upcoming bookings (next days)
  const upcomingData = [
    { start: makeDate(1, 9, 0), svc: "svc-dames-knippen", staff: "staff-lisa", customer: customers[4], price: 42.50, dur: 45 },
    { start: makeDate(1, 10, 0), svc: "svc-bruidskapper", staff: "staff-sara", customer: customers[0], price: 150.00, dur: 120 },
    { start: makeDate(1, 11, 0), svc: "svc-heren-knippen", staff: "staff-mark", customer: customers[1], price: 28.00, dur: 30 },
    { start: makeDate(1, 14, 0), svc: "svc-highlights", staff: "staff-lisa", customer: customers[2], price: 85.00, dur: 90 },
    { start: makeDate(2, 9, 30), svc: "svc-dames-knippen", staff: "staff-sara", customer: customers[5], price: 42.50, dur: 45 },
    { start: makeDate(2, 10, 0), svc: "svc-heren-knippen", staff: "staff-tom", customer: customers[3], price: 28.00, dur: 30 },
    { start: makeDate(2, 11, 0), svc: "svc-opsteken", staff: "staff-lisa", customer: customers[6], price: 55.00, dur: 60 },
    { start: makeDate(3, 9, 0), svc: "svc-kleuring", staff: "staff-sara", customer: customers[7], price: 65.00, dur: 75 },
    { start: makeDate(3, 13, 0), svc: "svc-wassen-fohnen", staff: "staff-mark", customer: customers[4], price: 25.00, dur: 30 },
    { start: makeDate(4, 10, 0), svc: "svc-toner", staff: "staff-lisa", customer: customers[0], price: 35.00, dur: 30 },
    { start: makeDate(5, 9, 0), svc: "svc-dames-knippen", staff: "staff-tom", customer: customers[2], price: 42.50, dur: 45 },
    { start: makeDate(5, 11, 0), svc: "svc-highlights", staff: "staff-sara", customer: customers[5], price: 85.00, dur: 90 },
    { start: makeDate(6, 10, 0), svc: "svc-heren-knippen", staff: "staff-mark", customer: customers[1], price: 28.00, dur: 30 },
    { start: makeDate(7, 9, 0), svc: "svc-bruidskapper", staff: "staff-lisa", customer: customers[6], price: 150.00, dur: 120 },
  ];

  // Past bookings (for stats)
  const pastData = [
    { start: makeDate(-1, 9, 0), svc: "svc-dames-knippen", staff: "staff-lisa", customer: customers[0], price: 42.50, dur: 45 },
    { start: makeDate(-1, 10, 0), svc: "svc-heren-knippen", staff: "staff-mark", customer: customers[1], price: 28.00, dur: 30 },
    { start: makeDate(-1, 11, 0), svc: "svc-highlights", staff: "staff-sara", customer: customers[2], price: 85.00, dur: 90 },
    { start: makeDate(-2, 9, 0), svc: "svc-kleuring", staff: "staff-sara", customer: customers[5], price: 65.00, dur: 75 },
    { start: makeDate(-2, 14, 0), svc: "svc-dames-knippen", staff: "staff-lisa", customer: customers[4], price: 42.50, dur: 45 },
    { start: makeDate(-3, 10, 0), svc: "svc-heren-knippen", staff: "staff-tom", customer: customers[3], price: 28.00, dur: 30 },
  ];

  const allBookings = [...todayBookingsData, ...upcomingData, ...pastData];

  for (const b of allBookings) {
    const booking = await prisma.booking.create({
      data: {
        salonId: salon.id,
        serviceId: b.svc,
        staffId: b.staff,
        customerId: b.customer.id,
        guestName: b.customer.name,
        guestEmail: b.customer.email,
        guestPhone: b.customer.phone || null,
        startTime: b.start,
        endTime: makeEndDate(b.start, b.dur),
        price: b.price,
        duration: b.dur,
        status: "CONFIRMED",
        source: "ONLINE",
      },
    });
    bookings.push(booking);
  }
  console.log(`✅ ${bookings.length} boekingen (${todayBookingsData.length} vandaag, ${upcomingData.length} komend, ${pastData.length} afgelopen)`);

  // 11. One vacation for Sara (next week)
  await prisma.vacation.deleteMany({ where: { staffId: "staff-sara" } });
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
  const nextFriday = new Date(nextMonday);
  nextFriday.setDate(nextMonday.getDate() + 4);

  await prisma.vacation.create({
    data: {
      staffId: "staff-sara",
      startDate: nextMonday,
      endDate: nextFriday,
      reason: "Skivakantie 🎿",
    },
  });
  console.log("✅ Vakantie: Sara volgende week (skivakantie)");

  console.log("\n🎉 Database seeded! Login: ahuisman5005@gmail.com");
  console.log(`📱 Booking page: /book/kapsalon-arnhem`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
