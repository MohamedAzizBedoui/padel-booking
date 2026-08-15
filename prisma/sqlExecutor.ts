import "dotenv/config";
import { prisma } from "../lib/prisma";

/**
 * ============================================
 * SQL QUERY EXECUTOR
 * ============================================
 * 
 * Edit the SQL query below and run:
 * npx tsx ./prisma/sqlExecutor.ts
 * 
 * Examples:
 * - Update all court prices to 80: UPDATE "Court" SET price = 80;
 * - Get all courts: SELECT * FROM "Court";
 * - Delete a booking: DELETE FROM "Booking" WHERE id = 'booking-id';
 */

async function executeSqlQuery() {
  try {
    // ============================================
    // 🔧 EDIT YOUR SQL QUERY HERE
    // ============================================
    const sqlQuery = `
      UPDATE "Court" SET price = 80;
    `;
    // ============================================

    console.log("🚀 Executing SQL query...");
    console.log("Query:", sqlQuery.trim());
    console.log("---");

    // Execute the raw SQL query
    const result = await prisma.$executeRawUnsafe(sqlQuery);

    console.log("✅ Query executed successfully!");
    console.log("Rows affected:", result);
  } catch (error) {
    console.error("❌ Error executing query:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

executeSqlQuery();
