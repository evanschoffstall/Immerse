import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema/index";
import { env } from "@/lib/env";

const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

export async function verifyDatabaseConnection(): Promise<void> {
  try {
    await db.execute(sql`SELECT 1`);
  } catch (error) {
    throw new Error("Failed to connect to database");
  }
}
