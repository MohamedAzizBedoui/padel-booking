import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Create or reuse the club owner
  const owner = await prisma.user.upsert({
    where: {
      email: "owner@padelbook.com",
    },
    update: {},
    create: {
      email: "owner@padelbook.com",
      name: "Padel Club Owner",
      password: "demo-password",
      role: "CLUB_OWNER",
    },
  });

  // Define clubs by city
  const clubsData = [
    {
      city: "Tunis",
      clubs: [
        {
          name: "Padel Arena Tunis",
          description: "Premium padel courts in Tunis center",
          address: "123 Avenue Habib Bourguiba, Tunis",
        },
        {
          name: "Elite Padel Club",
          description: "Modern facilities with professional courts",
          address: "456 Rue de la Liberté, Tunis",
        },
        {
          name: "Champions Padel",
          description: "Training center for padel enthusiasts",
          address: "789 Boulevard 9 Avril, Tunis",
        },
        {
          name: "Golden Court Tunis",
          description: "Luxury padel resort with amenities",
          address: "321 Avenue Mohamed V, Tunis",
        },
      ],
    },
    {
      city: "Sfax",
      clubs: [
        {
          name: "Sfax Padel Center",
          description: "Leading padel facility in Sfax",
          address: "100 Avenue Bourguiba, Sfax",
        },
        {
          name: "Pro Padel Sfax",
          description: "Professional courts for tournaments",
          address: "200 Rue Ali Belhouane, Sfax",
        },
        {
          name: "Star Court Sfax",
          description: "Family-friendly padel club",
          address: "300 Avenue de la République, Sfax",
        },
        {
          name: "Victory Padel",
          description: "Premium training and recreation",
          address: "400 Rue de Kairouan, Sfax",
        },
      ],
    },
    {
      city: "Sousse",
      clubs: [
        {
          name: "Sousse Padel Club",
          description: "Beachfront padel courts",
          address: "50 Avenue Mohamed Bourguiba, Sousse",
        },
        {
          name: "Coast Padel Resort",
          description: "Luxury resort with padel facilities",
          address: "75 Rue de la Plage, Sousse",
        },
        {
          name: "Tennis Padel Sousse",
          description: "Multi-sport facility with padel courts",
          address: "150 Avenue de la Corniche, Sousse",
        },
        {
          name: "Sunset Court Sousse",
          description: "Recreation and tournament venue",
          address: "200 Rue Farhat Hached, Sousse",
        },
      ],
    },
    {
      city: "Ariana",
      clubs: [
        {
          name: "Ariana Padel Complex",
          description: "Modern padel complex in Ariana",
          address: "111 Avenue de la Liberté, Ariana",
        },
        {
          name: "Active Padel Ariana",
          description: "Community padel center",
          address: "222 Rue Ali Belhouane, Ariana",
        },
        {
          name: "Summit Padel Club",
          description: "Premium membership-based club",
          address: "333 Avenue Mohamed Ali, Ariana",
        },
        {
          name: "Force Court Ariana",
          description: "Training academy and recreation",
          address: "444 Rue de la Paix, Ariana",
        },
      ],
    },
    {
      city: "monastir",
      clubs: [
        {
          name: "Monastir Padel Sports",
          description: "Sports complex with padel courts",
          address: "50 Avenue Habib Bourguiba, Monastir",
        },
        {
          name: "Green Padel Monastir",
          description: "Eco-friendly padel facility",
          address: "100 Rue Mohamed Ali, Monastir",
        },
        {
          name: "Valley Court Monastir",
          description: "Scenic padel courts in Monastir",
          address: "150 Avenue de l'Indépendance, Monastir",
        },
        {
          name: "Horizon Padel Club",
          description: "Family and professional courts",
          address: "200 Rue de la Source, Monastir",
        },
      ],
    },
  ];

  // Create clubs for each city
  for (const cityData of clubsData) {
    for (const clubData of cityData.clubs) {
      let club = await prisma.club.findFirst({
        where: {
          name: clubData.name,
        },
      });

      if (!club) {
        club = await prisma.club.create({
          data: {
            name: clubData.name,
            description: clubData.description,
            address: clubData.address,
            city: cityData.city,
            ownerId: owner.id,

            courts: {
              create: [
                {
                  name: "Court 1",
                  price: 80,
                  active: true,
                },
                {
                  name: "Court 2",
                  price: 80,
                  active: true,
                },
                {
                  name: "Court 3",
                  price: 90,
                  active: true,
                },
                {
                  name: "Court 4",
                  price: 90,
                  active: true,
                },
              ],
            },
          },
        });

        console.log(`✅ Created club: ${club.name} (${cityData.city})`);
      } else {
        console.log(`⏭️  Club already exists: ${club.name}`);
      }
    }
  }

  console.log("✅ Database seeding completed!");
  console.log("📊 Summary: 5 cities with 4 clubs each = 20 clubs total");
  console.log("   Each club has 4 courts");
}

main()
  .catch((error) => {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });