import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { seedCms } from "../src/lib/cms-seed";

const prisma = new PrismaClient();

type QuizBankItem = {
  number: number;
  prompt: string;
  type: string;
  choices: string[] | null;
  correctIndex: number | null;
  acceptedKeywords: string[] | null;
  explanation: string;
  topic: string;
};

const MODULES = [
  {
    slug: "becoming-licensed",
    title: "Becoming a licensed instructor in Minnesota",
    description:
      "History of licensing after 1-1-68, purpose of the rules, and who regulates commercial schools and instructors.",
    lessons: [
      {
        slug: "history-and-purpose",
        title: "Licensing history and purpose of the rules",
        summary: "When instructors first needed licenses and why the rules exist.",
        bodyMarkdown: `## Licensed after January 1, 1968

Commercial driver training instructors were first required to be licensed by the State of Minnesota after **January 1, 1968**.

## Purpose of the rules

The rules carry out the legislature's mandate to **regulate and license** commercial driver training schools and instructors.

## Who regulates

The Minnesota Department of Public Safety (DPS) / Commissioner oversees licensing under Minnesota Statutes **171.33–171.41** and Rules **7411.0100–7411.2000**.

### Check your understanding
- First licensing date: after **1-1-68**
- Purpose: legislative mandate to regulate/license schools and instructors
- Regulator: DPS / Commissioner`,
      },
      {
        slug: "who-regulates",
        title: "DPS authority and your path to licensure",
        summary: "How Life Star prepares you for written, road, and campus laboratory work.",
        bodyMarkdown: `## Your hybrid path with Life Star

1. Complete online modules and practice exams here.
2. Build your MN DPS instructor application preparation packet.
3. Travel to **Life Star Driving School — Minnesota main campus** for laboratory / practical competencies under Minnesota Rules Part **7411.0630**.

Life Star coaches you through classroom knowledge online, then hosts on-campus practical training in Minnesota.`,
      },
    ],
  },
  {
    slug: "qualifications-admin",
    title: "Instructor qualifications & license administration",
    description:
      "Age and driving history, vision, tests, surrender, duplicates, and renewal timing.",
    lessons: [
      {
        slug: "qualifications",
        title: "Qualifications, vision, and driving record",
        summary: "Core eligibility: licensed driver years, 20/40 vision, clean record.",
        bodyMarkdown: `## Core qualifications

- Licensed driver for at least **3 years**
- Minimum vision: **20/40 corrected**
- Driving record for the last **3 years** clear of **revocations, suspensions, and cancellations**

## Tests

Applicants must pass **written** and **road** tests. Fail once → retake when prepared. Fail a second time → wait **6 months**.`,
      },
      {
        slug: "license-admin",
        title: "Surrender, duplicates, and renewal",
        summary: "10-day surrender, $5 duplicate, $50 annual renewal window.",
        bodyMarkdown: `## Administration rules

- Surrender your instructor license to the Commissioner within **10 days** when required
- Duplicate license: affidavit to the Commissioner; fee **$5**
- License expires **1 year** from issuance; renewal fee **$50**
- Apply for renewal **at least 10 days** and **no more than 30 days** before expiration`,
      },
    ],
  },
  {
    slug: "vehicles-operations",
    title: "Training vehicles, contracts & school operations",
    description: "Insurance minimums, Student Driver signs, contracts, free lessons, accident reporting.",
    lessons: [
      {
        slug: "vehicles-insurance",
        title: "Vehicles, signs, and insurance minimums",
        summary: "BI 100/300, PD, medical, UM, and Student Driver identification.",
        bodyMarkdown: `## Training vehicle insurance (minimums)

- Bodily injury: **$100,000 / $300,000**
- Property damage: **$50,000**
- Medical: **$20,000**
- Uninsured motorist: statutory minimum

## Student Driver signs

Signs must appear on the **front and rear** of the training vehicle with letter size and color contrast that remain readable to other drivers.`,
      },
      {
        slug: "contracts-operations",
        title: "Contracts, free lessons, routes, and accidents",
        summary: "Written contracts, hour caps, advertising rules, road-test routes.",
        bodyMarkdown: `## Contracts

- A written **contract** is required before any training
- Contract typically limited to **10 hours** behind-the-wheel, renewable by mutual agreement
- Excess of **30 hours** needs Commissioner approval

## Free lessons

An instructor may give free lessons; a school may **not advertise** free lessons.

## Road-test routes

No instruction on roadways or routes used for state driver license road tests.

## Accidents

The instructor is responsible; report through the school and to the Commissioner as required.`,
      },
    ],
  },
  {
    slug: "traffic-knowledge",
    title: "Traffic law & licensing knowledge",
    description: "Right-of-way, signs, speed, alcohol, and the Smith System.",
    lessons: [
      {
        slug: "smith-system",
        title: "The Smith System",
        summary: "Five seeing habits that keep instructors and students safer.",
        bodyMarkdown: `## Five points of the Smith System

1. Aim high in steering
2. Get the big picture
3. Keep your eyes moving
4. Leave yourself an out
5. Make sure they see you

These habits appear throughout the instructor exam and campus laboratory evaluations.`,
      },
      {
        slug: "traffic-law-core",
        title: "Core traffic law for instructors",
        summary: "Speed, alcohol, parking distances, and right-of-way themes from the Q&A bank.",
        bodyMarkdown: `## Study focus

Work the full practice exam after this module. High-yield themes include:

- Right-of-way at intersections and uncontrolled crossings
- Speed law and posted limits
- Alcohol and impairment rules
- Parking and stopping distances
- Sign recognition and pavement markings

Use review mode after each attempt to lock in the Q&A key language.`,
      },
    ],
  },
  {
    slug: "campus-prep",
    title: "Campus practical prep",
    description: "Travel to Minnesota, laboratory competencies, daily hour caps.",
    lessons: [
      {
        slug: "travel-and-lab",
        title: "Travel checklist and laboratory overview",
        summary: "What to bring to Minnesota and how laboratory days are structured.",
        bodyMarkdown: `## Minnesota campus intensives

Practical training happens at **Life Star Driving School — Minnesota main campus**. Candidates travel for laboratory competencies under **7411.0630**.

## Daily hour caps (from materials)

- Classroom: max **3 hours/day**
- Behind-the-wheel: max **2 hours/day**

## Bring

- Valid driver license and records as requested
- Application packet draft (export from this academy)
- Notebook, comfortable driving attire, weather-ready layers`,
      },
    ],
  },
  {
    slug: "application-workshop",
    title: "Application workshop",
    description: "Walk through every field on the MN DPS instructor application (PS36008-10).",
    lessons: [
      {
        slug: "ps36008-walkthrough",
        title: "PS36008-10 field walkthrough",
        summary: "Part A identification and Part B certifications — preparation only.",
        bodyMarkdown: `## Important disclaimer

This academy packet is a **Life Star preparation packet**. You still file the official MN DPS form **PS36008-10**.

## Part A — Identification

Name, birth date, address, DL number, SSN (masked in our UI), phone, employing commercial school (pre-filled Life Star), education/training table with classroom and laboratory competency dates for **7411.0630**.

## Part B — Certifications

Applicant certification of qualifications / driving history, privacy notice referencing M.S. **13.04**, and acknowledgment that fees are non-refundable if the application is disapproved.

Use **Application** in the academy to complete fields and export a PDF for your records.`,
      },
    ],
  },
];

const LEVELS = [
  {
    code: "foundation",
    name: "Foundation",
    description: "Core instructor-license knowledge track with essential Minnesota campus practicals.",
    sortOrder: 1,
    lessonCents: 4900,
    packageCents: 49900,
  },
  {
    code: "professional",
    name: "Professional",
    description: "Full online track plus the standard Minnesota campus practical package.",
    sortOrder: 2,
    lessonCents: 3900,
    packageCents: 79900,
  },
  {
    code: "operator",
    name: "School Operator",
    description: "Full track with extended practicals and an operator-focused campus intensive.",
    sortOrder: 3,
    lessonCents: 2900,
    packageCents: 119900,
  },
];

/** Life Star program tuition (same for every enrollment level). Checkout collects the down payment. */
const TRAINING_PROGRAMS = [
  {
    code: "btw-training",
    name: "Behind-the-wheel training",
    description:
      "On-campus behind-the-wheel / laboratory training at Life Star’s Minnesota main campus (7411.0630 competencies).",
    durationDays: 5,
    locationNote: "Life Star Driving School — Minnesota main campus",
    amountCents: 700_000, // $7,000
    downPaymentPercent: 50,
    installmentMonths: 3,
  },
  {
    code: "classroom-sessions",
    name: "Classroom sessions",
    description:
      "Instructor classroom sessions at Life Star Driving School — Minnesota main campus.",
    durationDays: 10,
    locationNote: "Life Star Driving School — Minnesota main campus",
    amountCents: 1_500_000, // $15,000
    downPaymentPercent: 50,
    installmentMonths: 5,
  },
];

async function main() {
  console.log("Seeding Life Star Academy…");

  await prisma.attemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.practicumBooking.deleteMany();
  await prisma.practicumSession.deleteMany();
  await prisma.applicationDocument.deleteMany();
  await prisma.applicationPacket.deleteMany();
  await prisma.schoolLaunchDocument.deleteMany();
  await prisma.schoolLaunchPlan.deleteMany();
  await prisma.licenseVerification.deleteMany();
  await prisma.privateUpload.deleteMany();
  await prisma.competencyRecord.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.entitlement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lessonPrice.deleteMany();
  await prisma.practicalPrice.deleteMany();
  await prisma.levelPackage.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.practicalSku.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.enrollmentLevel.deleteMany();
  await prisma.schoolSetting.deleteMany();

  await prisma.schoolSetting.create({
    data: {
      id: "default",
      name: "Life Star Driving School",
      address: "Life Star Driving School — Minnesota main campus",
      supportEmail: "academy@lifestardrivingschool.example",
      supportPhone: "(651) 555-0147",
      programDirectorName: process.env.PROGRAM_DIRECTOR_NAME || "Alex Rivera",
      schoolRegistrationId: process.env.LSDS_SCHOOL_REGISTRATION_ID || "LSDS-MN-REG-PENDING",
      operatorLicenseId: process.env.LSDS_OPERATOR_LICENSE_ID || "MN-OP-LICENSE-PENDING",
    },
  });

  const levelRows = [];
  for (const level of LEVELS) {
    levelRows.push(
      await prisma.enrollmentLevel.create({
        data: {
          code: level.code,
          name: level.name,
          description: level.description,
          sortOrder: level.sortOrder,
        },
      })
    );
  }

  const programRows = [];
  for (const program of TRAINING_PROGRAMS) {
    const sku = await prisma.practicalSku.create({
      data: {
        code: program.code,
        name: program.name,
        description: program.description,
        durationDays: program.durationDays,
        locationNote: program.locationNote,
        downPaymentPercent: program.downPaymentPercent,
        installmentMonths: program.installmentMonths,
      },
    });
    programRows.push(sku);
    for (const level of levelRows) {
      await prisma.practicalPrice.create({
        data: {
          practicalSkuId: sku.id,
          levelId: level.id,
          amountCents: program.amountCents,
        },
      });
    }
  }
  const btwSku = programRows.find((p) => p.code === "btw-training")!;

  for (let i = 0; i < LEVELS.length; i++) {
    await prisma.levelPackage.create({
      data: {
        levelId: levelRows[i].id,
        name: `${LEVELS[i].name} online package`,
        description: `All online lessons for the ${LEVELS[i].name} level. Classroom sessions and behind-the-wheel training are sold separately with payment plans.`,
        amountCents: LEVELS[i].packageCents,
        includesAllLessons: true,
        includesPracticalSkuId: null,
      },
    });
  }

  const lessonIds: string[] = [];
  for (let mi = 0; mi < MODULES.length; mi++) {
    const mod = MODULES[mi];
    const moduleRow = await prisma.module.create({
      data: {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        sortOrder: mi + 1,
      },
    });
    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li];
      const lessonRow = await prisma.lesson.create({
        data: {
          moduleId: moduleRow.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          bodyMarkdown: lesson.bodyMarkdown,
          sortOrder: li + 1,
        },
      });
      lessonIds.push(lessonRow.id);
      for (let i = 0; i < LEVELS.length; i++) {
        await prisma.lessonPrice.create({
          data: {
            lessonId: lessonRow.id,
            levelId: levelRows[i].id,
            amountCents: LEVELS[i].lessonCents,
          },
        });
      }
    }
  }

  const campus = "7240 Brooklyn Blvd, Minneapolis, MN";
  await prisma.practicumSession.createMany({
    data: [
      {
        practicalSkuId: btwSku.id,
        title: "Spring Minnesota BTW intensive",
        startDate: "2026-04-13",
        endDate: "2026-04-17",
        startTime: "08:00",
        endTime: "17:00",
        kind: "practicum",
        location: campus,
        instructorName: "John Addo",
        capacity: 8,
        notes: "Arrive Sunday evening; behind-the-wheel Mon–Fri.",
      },
      {
        practicalSkuId: btwSku.id,
        title: "Summer Minnesota BTW intensive",
        startDate: "2026-07-20",
        endDate: "2026-07-24",
        startTime: "08:00",
        endTime: "17:00",
        kind: "practicum",
        location: campus,
        instructorName: "John Addo",
        capacity: 8,
        notes: "Bring application packet draft and DL records.",
      },
      {
        practicalSkuId: btwSku.id,
        title: "Fall Minnesota BTW intensive",
        startDate: "2026-10-12",
        endDate: "2026-10-16",
        startTime: "08:00",
        endTime: "17:00",
        kind: "practicum",
        location: campus,
        instructorName: "John Addo",
        capacity: 6,
        notes: "Cooler weather — pack layers for outdoor range work.",
      },
      {
        practicalSkuId: btwSku.id,
        title: "Campus range day",
        startDate: "2026-05-09",
        endDate: "2026-05-09",
        startTime: "09:00",
        endTime: "15:00",
        kind: "campus",
        location: campus,
        instructorName: "John Addo",
        capacity: 10,
        notes: "Range and observation — phone +1 763-390-7637.",
      },
      {
        practicalSkuId: btwSku.id,
        title: "New student orientation",
        startDate: "2026-03-28",
        endDate: "2026-03-28",
        startTime: "10:00",
        endTime: "12:00",
        kind: "info",
        location: campus,
        instructorName: "John Addo",
        capacity: 20,
        notes: "Campus walkthrough and practicum overview.",
      },
    ],
  });

  const quizBankPath = path.join(process.cwd(), "prisma", "data", "quiz-bank.json");
  const bank = JSON.parse(fs.readFileSync(quizBankPath, "utf8")) as QuizBankItem[];
  const quiz = await prisma.quiz.create({
    data: {
      slug: "instructor-practice-exam",
      title: "Minnesota instructor practice exam",
      description:
        "Full practice set cleaned from the Instructor Quiz / Q&A materials. Pass mark 80%. Soft timer ~4 hours.",
      passPercent: 80,
      timeLimitMinutes: 240,
    },
  });
  for (const q of bank) {
    await prisma.question.create({
      data: {
        quizId: quiz.id,
        number: q.number,
        prompt: q.prompt,
        type: q.type,
        choicesJson: q.choices ? JSON.stringify(q.choices) : null,
        correctIndex: q.correctIndex,
        acceptedKeywords: q.acceptedKeywords ? JSON.stringify(q.acceptedKeywords) : null,
        explanation: q.explanation,
        topic: q.topic,
        // Curate a sample set into the admin-only Q&A slideshow (candidates never see this).
        inAdminSlides: q.number <= 25,
      },
    });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@lifestar.academy").toLowerCase();
  const demoEmail = (process.env.DEMO_EMAIL || "demo@lifestar.academy").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const demoPassword = process.env.DEMO_PASSWORD;
  if (!adminPassword || !demoPassword) {
    throw new Error(
      "ADMIN_PASSWORD and DEMO_PASSWORD must be set in the environment (see .env.example). Seed refuses hardcoded defaults.",
    );
  }

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Life Star Admin",
      role: "admin",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      profile: { create: { phone: "(651) 555-0100", city: "St. Paul", state: "MN" } },
    },
  });

  const professional = levelRows.find((l) => l.code === "professional")!;
  const demo = await prisma.user.create({
    data: {
      email: demoEmail,
      name: "Demo Candidate",
      role: "candidate",
      passwordHash: await bcrypt.hash(demoPassword, 10),
      profile: {
        create: {
          phone: "(612) 555-0199",
          address1: "100 Demo Ave",
          city: "Minneapolis",
          state: "MN",
          zip: "55401",
        },
      },
      enrollments: {
        create: {
          levelId: professional.id,
          status: "active",
          enrollmentNumber: `LS-${new Date().getFullYear()}-DEMO01`,
        },
      },
      applicationPacket: {
        create: {
          fullName: "Demo Candidate",
          employingSchoolName: "Life Star Driving School",
          employingSchoolAddress: "Minnesota main campus",
          completenessPercent: 15,
        },
      },
    },
  });

  // Grant first two modules' lessons to demo so learn flow is usable without Stripe
  const firstLessons = lessonIds.slice(0, 4);
  for (const lessonId of firstLessons) {
    await prisma.entitlement.create({
      data: { userId: demo.id, lessonId },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "seed.complete",
      metaJson: JSON.stringify({
        levels: LEVELS.length,
        lessons: lessonIds.length,
        questions: bank.length,
        demoEmail,
        adminEmail,
      }),
    },
  });

  console.log(`Seeded ${lessonIds.length} lessons, ${bank.length} questions.`);
  console.log(`Admin: ${adminEmail} / (ADMIN_PASSWORD)`);
  console.log(`Demo:  ${demoEmail} / (DEMO_PASSWORD) on Professional with ${firstLessons.length} unlocked lessons`);

  await seedCms(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
