import { chromium } from "playwright";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const ART = "/opt/cursor/artifacts";
const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: "admin@lifestar.academy" } });
if (!user) throw new Error("admin missing");
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
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addCookies([
  { name: "lsds_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true },
]);
const page = await context.newPage();
await page.goto("http://127.0.0.1:3047/admin", { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(ART, "admin_home.png"), fullPage: false });
await page.goto("http://127.0.0.1:3047/admin/quizzes", { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(ART, "admin_quizzes.png"), fullPage: false });
await browser.close();
console.log("admin shots done");
