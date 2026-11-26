import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveDatabaseUrl() {
  const configured = process.env.DATABASE_URL;
  if (configured?.startsWith("postgres://") || configured?.startsWith("postgresql://")) {
    return configured;
  }

  // On Vercel the deploy filesystem is read-only; copy the built SQLite into /tmp for R/W.
  // Key the dest file by deployment id so each deploy gets a fresh seeded DB (avoids stale /tmp).
  if (process.env.VERCEL) {
    const source = path.join(process.cwd(), "prisma", "deploy.db");
    const deployId = process.env.VERCEL_DEPLOYMENT_ID || "local";
    const dest = path.join("/tmp", `lsds-deploy-${deployId}.db`);
    try {
      if (fs.existsSync(source)) {
        if (!fs.existsSync(dest) || fs.statSync(source).mtimeMs > fs.statSync(dest).mtimeMs) {
          fs.copyFileSync(source, dest);
        }
        return `file:${dest}`;
      }
    } catch (err) {
      console.error("Failed to stage SQLite deploy DB in /tmp", err);
    }
  }

  return configured || "file:./dev.db";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
