import pg from "pg";

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

console.log(
  "DATABASE:",
  databaseUrl.replace(/:[^:@]+@/, ":***@")
);

async function test() {
  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,

    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Connecting with pg Client...");

    await client.connect();

    console.log("CONNECTED!");

    const result = await client.query("SELECT NOW() AS now");

    console.log("QUERY SUCCESS:");
    console.log(result.rows);
  } catch (error) {
    console.error("CONNECTION FAILED:");
    console.error(error);
  } finally {
    await client.end().catch(() => {});
  }
}

test();