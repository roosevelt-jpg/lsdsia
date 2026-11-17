import { chromium } from "playwright";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const ART =
  fs.existsSync("/opt/cursor/artifacts")
    ? "/opt/cursor/artifacts"
    : path.join(process.cwd(), "artifacts");
fs.mkdirSync(ART, { recursive: true });

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: "demo@lifestar.academy" } });
if (!user) throw new Error("demo user missing — run db:seed");
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "lsds-dev-auth-secret-change-me-in-production"
);
const token = await new SignJWT({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
})
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("14d")
  .sign(secret);
await prisma.$disconnect();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await context.addCookies([
  {
    name: "lsds_session",
    value: token,
    domain: "127.0.0.1",
    path: "/",
    httpOnly: true,
  },
]);

async function shot(url, name) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  const out = path.join(ART, name);
  await page.screenshot({ path: out, fullPage: false });
  console.log("wrote", out);
  await page.close();
}

await shot("http://127.0.0.1:3047/", "landing_hero.png");
await shot("http://127.0.0.1:3047/pricing", "pricing_levels.png");
await shot("http://127.0.0.1:3047/app", "candidate_dashboard.png");
await shot("http://127.0.0.1:3047/app/learn", "learn_catalog.png");
await shot("http://127.0.0.1:3047/app/store", "store_catalog.png");
await shot("http://127.0.0.1:3047/admin", "admin_overview.png");

await browser.close();
console.log("done");
