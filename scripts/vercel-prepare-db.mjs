/**
 * Prepares a SQLite file for Vercel builds when DATABASE_URL is unset or file-based.
 * Seeds admin/demo users when ADMIN_PASSWORD + DEMO_PASSWORD are present in the environment.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const deployDb = path.join(root, "prisma", "deploy.db");
const url = process.env.DATABASE_URL || "";

const usingPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://");
if (usingPostgres) {
  console.log("vercel-prepare-db: Postgres DATABASE_URL detected — skipping SQLite prepare.");
  process.exit(0);
}

process.env.DATABASE_URL = `file:${deployDb}`;
fs.mkdirSync(path.dirname(deployDb), { recursive: true });
if (fs.existsSync(deployDb)) fs.unlinkSync(deployDb);

console.log(`vercel-prepare-db: creating ${deployDb}`);
execSync("npx prisma db push --skip-generate", {
  stdio: "inherit",
  env: process.env,
});

if (process.env.ADMIN_PASSWORD && process.env.DEMO_PASSWORD) {
  console.log("vercel-prepare-db: seeding users from ADMIN_*/DEMO_* env…");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env });
} else {
  console.warn(
    "vercel-prepare-db: ADMIN_PASSWORD / DEMO_PASSWORD not set — schema only. Login will fail until you set them and redeploy (or use Postgres + seed).",
  );
}
