import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// DIRECT_URL = Supabase direct connection (no pgBouncer)
// Used only by Prisma CLI for migrations and introspection.
// Runtime queries use DATABASE_URL (pooled) via PrismaPg adapter in src/lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
