import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * If the database has zero users, create admin + demo from env passwords.
 * Used on Vercel when the build seeded schema only (passwords were not set yet).
 */
export async function ensureLoginUsers(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    const count = await prisma.user.count();
    if (count > 0) return { ok: true };

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@lifestar.academy").toLowerCase();
    const demoEmail = (process.env.DEMO_EMAIL || "demo@lifestar.academy").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const demoPassword = process.env.DEMO_PASSWORD;

    if (!adminPassword || !demoPassword) {
      return {
        ok: false,
        error:
          "No login accounts exist yet. In Vercel → Settings → Environment Variables set AUTH_SECRET, ADMIN_PASSWORD, and DEMO_PASSWORD, then Redeploy (or try login again after saving the env vars).",
      };
    }

    let professional = await prisma.enrollmentLevel.findUnique({ where: { code: "professional" } });
    if (!professional) {
      professional = await prisma.enrollmentLevel.create({
        data: {
          code: "professional",
          name: "Professional",
          description: "Full online track plus Minnesota campus practical package.",
          sortOrder: 2,
        },
      });
    }

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Life Star Admin",
        role: "admin",
        passwordHash: await bcrypt.hash(adminPassword, 10),
        profile: { create: { phone: "(651) 555-0100", city: "St. Paul", state: "MN" } },
      },
    });

    await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Demo Candidate",
        role: "candidate",
        passwordHash: await bcrypt.hash(demoPassword, 10),
        profile: {
          create: {
            phone: "(612) 555-0199",
            city: "Minneapolis",
            state: "MN",
          },
        },
        enrollments: {
          create: { levelId: professional.id, status: "active" },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "bootstrap.login_users",
        metaJson: JSON.stringify({ adminEmail, demoEmail }),
      },
    });

    console.log("bootstrap-users: created admin and demo accounts from env");
    return { ok: true };
  } catch (err) {
    console.error("ensureLoginUsers", err);
    return {
      ok: false,
      error:
        "Could not create login accounts. Confirm AUTH_SECRET / ADMIN_PASSWORD / DEMO_PASSWORD are set in Vercel and the database is reachable.",
    };
  }
}
