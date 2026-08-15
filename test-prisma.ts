import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

console.log(
  "DATABASE:",
  databaseUrl.replace(/:[^:@]+@/, ":***@")
);

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting Prisma connection...");
  console.log("Starting user lookup...");

  const user = await prisma.user.findUnique({
    where: {
      email: "mohamedazizbedoui2@gmail.com",
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log("User lookup finished.");
  console.log("USER:", user);
}

main()
  .catch((error) => {
    console.error("PRISMA ERROR:");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });