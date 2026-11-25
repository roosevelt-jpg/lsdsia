import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  Award,
  CalendarDays,
  Clock,
  Globe2,
  MapPin,
  BadgeCheck,
  Play,
  ClipboardList,
  FolderOpen,
  LifeBuoy,
  Download,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { savePrivateUpload } from "@/lib/private-uploads";
import { getCertificateForUser } from "@/lib/certificate";
import { loadCmsSite, resolveCmsImage } from "@/lib/cms";
import { loadStudentIdPayload } from "@/lib/student-id";
import { StudentIdCard } from "@/components/student-id-card";

export const dynamic = "force-dynamic";

async function uploadIdPhoto(formData: FormData) {
  "use server";
  const session = await requireUser(["candidate", "admin", "coach"]);
  const file = formData.get("idPhoto");
  if (!(file instanceof File) || file.size <= 0) {
    redirect("/app?photoError=" + encodeURIComponent("Choose a passport-style photo to upload."));
  }
  if (!file.type.startsWith("image/")) {
    redirect("/app?photoError=" + encodeURIComponent("ID photo must be an image (JPG or PNG)."));
  }
  try {
    const upload = await savePrivateUpload({ userId: session.id, kind: "student_id_photo", file });
    await prisma.profile.upsert({
      where: { userId: session.id },
      create: { userId: session.id, idPhotoUploadId: upload.id },
      update: { idPhotoUploadId: upload.id },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    redirect("/app?photoError=" + encodeURIComponent(msg));
  }
  redirect("/app?photoOk=1#student-id");
}

function pct(n: number, d: number) {
  if (d <= 0) return 0;
  return Math.round((n / d) * 100);
}

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ photoError?: string; photoOk?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;

  const [user, site, media, modules, certificate, idPayload, bookings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: {
        enrollments: { include: { level: true }, orderBy: { startedAt: "desc" } },
        entitlements: true,
        lessonProgress: true,
        quizAttempts: { where: { submittedAt: { not: null } }, orderBy: { submittedAt: "desc" }, take: 5 },
        profile: true,
        schoolLaunchPlan: true,
      },
    }),
    loadCmsSite(),
    prisma.cmsMedia.findMany(),
    prisma.module.findMany({
      orderBy: { sortOrder: "asc" },
      include: { lessons: { orderBy: { sortOrder: "asc" } } },
      take: 3,
    }),
    getCertificateForUser(session.id),
    loadStudentIdPayload(session.id),
    prisma.practicumBooking.findMany({
      where: { userId: session.id },
      include: { session: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const mediaMap = Object.fromEntries(media.map((m) => [m.key, `/api/cms-media/${m.key}`]));
  const heroBg = resolveCmsImage(site.dashboardHeroBgUrl, mediaMap) || site.dashboardHeroBgUrl;
  const heroPerson =
    resolveCmsImage(site.dashboardHeroPersonUrl, mediaMap) || site.dashboardHeroPersonUrl;
  const continueThumb =
    resolveCmsImage(site.dashboardContinueThumbUrl, mediaMap) || site.dashboardContinueThumbUrl;

  const firstName = session.name.split(" ")[0] || session.name;
  const lessonEntitlements = user?.entitlements.filter((e) => e.lessonId) ?? [];
  const completedLessons = user?.lessonProgress.filter((p) => p.completedAt) ?? [];
  const completedIds = new Set(completedLessons.map((p) => p.lessonId));
  const overallProgress = pct(completedLessons.length, Math.max(lessonEntitlements.length, 1));

  const courseCards = modules.map((mod, idx) => {
    const total = mod.lessons.length || 1;
    const done = mod.lessons.filter((l) => completedIds.has(l.id)).length;
    const progress = pct(done, total);
    const thumbs = ["/cms/dashboard/course-1.jpg", "/cms/dashboard/course-2.jpg", "/cms/dashboard/course-3.jpg"];
    const current = Math.min(done + 1, total);
    return {
      id: mod.id,
      title: mod.title,
      slug: mod.slug,
      thumb: thumbs[idx] || thumbs[0]!,
      progress,
      status:
        progress === 0
          ? `Module 1 of ${total} • Not Started`
          : progress >= 100
            ? `Module ${total} of ${total} • Completed`
            : `Module ${current} of ${total} • In Progress`,
      href:
        progress === 0
          ? `/app/learn/${mod.slug}/${mod.lessons[0]?.slug || ""}`
          : `/app/learn/${mod.slug}/${mod.lessons[Math.min(done, total - 1)]?.slug || ""}`,
      cta: progress === 0 ? "Start Course" : progress >= 100 ? "Review" : "Continue",
    };
  });

  // Next incomplete lesson across modules
  let nextLesson: { title: string; href: string; meta: string } | null = null;
  let lessonOrdinal = 0;
  let lessonTotal = 0;
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      lessonTotal += 1;
      if (!nextLesson) lessonOrdinal += 1;
      if (!nextLesson && !completedIds.has(lesson.id)) {
        nextLesson = {
          title: lesson.title,
          href: `/app/learn/${mod.slug}/${lesson.slug}`,
          meta: `Lesson ${lessonOrdinal} of ${Math.max(lessonTotal + mod.lessons.length - 1, 8)} | ~12 min`,
        };
      }
    }
  }
  if (!nextLesson && modules[0]?.lessons[0]) {
    const l = modules[0].lessons[0];
    nextLesson = {
      title: l.title,
      href: `/app/learn/${modules[0].slug}/${l.slug}`,
      meta: "Lesson 1 of 8 | ~12 min",
    };
  }

  const upcoming = bookings.filter((b) => b.status === "requested" || b.status === "confirmed");
  const learningHours = Math.max(1, Math.round(completedLessons.length * 1.5 + lessonEntitlements.length * 0.5));

  const enrollment = idPayload?.enrollment ?? user?.enrollments[0] ?? null;
  const photoUrl = user?.profile?.idPhotoUploadId
    ? `/api/private-uploads/${user.profile.idPhotoUploadId}`
    : null;

  const donut = overallProgress;
  const circumference = 2 * Math.PI * 42;
  const dash = (donut / 100) * circumference;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl text-white shadow-[0_16px_40px_rgba(11,31,51,0.18)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(105deg, rgba(8,24,48,0.92) 0%, rgba(11,40,80,0.78) 48%, rgba(11,40,80,0.45) 100%), url(${heroBg})`,
          }}
        />
        <div className="relative grid gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:px-8 lg:py-10">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Welcome Back, {firstName}! 👋</h1>
            <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">{site.dashboardHeroSubtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={(site as { dashboardHeroCtaHref?: string }).dashboardHeroCtaHref || nextLesson?.href || "/app/learn"}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--amber)] to-[#f0b92a] px-4 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:brightness-105"
              >
                {(site as { dashboardHeroCtaLabel?: string }).dashboardHeroCtaLabel || "Continue Learning"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={(site as { dashboardHeroSecondaryHref?: string }).dashboardHeroSecondaryHref || "#progress"}
                className="inline-flex items-center gap-2 rounded-lg border border-white/70 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <BarChart3 className="h-4 w-4" />{" "}
                {(site as { dashboardHeroSecondaryLabel?: string }).dashboardHeroSecondaryLabel ||
                  "View My Progress"}
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-white/90 sm:gap-6">
              <li className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-[var(--amber)]" /> Learn Online Worldwide
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--amber)]" /> Train at Our Minnesota Campus
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[var(--amber)]" /> Get Licensed & Start Your Business
              </li>
            </ul>
          </div>
          <div className="relative hidden justify-end lg:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPerson}
              alt="Life Star instructor"
              className="max-h-64 w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Enrolled Courses",
            value: String(Math.max(courseCards.length, user?.enrollments.length || 0)),
            icon: GraduationCap,
            tone: "bg-sky-50 text-sky-700",
          },
          {
            label: "Overall Progress",
            value: `${overallProgress}%`,
            icon: BarChart3,
            tone: "bg-amber-50 text-amber-700",
          },
          {
            label: "Certificate Earned",
            value: certificate ? "1" : "0",
            icon: Award,
            tone: "bg-violet-50 text-violet-700",
          },
          {
            label: "Upcoming Sessions",
            value: String(upcoming.length),
            icon: CalendarDays,
            tone: "bg-blue-50 text-blue-700",
          },
          {
            label: "Total Learning Time",
            value: `${learningHours} hrs`,
            icon: Clock,
            tone: "bg-slate-100 text-slate-700",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[var(--navy)]/8">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-2xl font-bold text-[var(--navy)]">{s.value}</p>
              <p className="text-xs text-[var(--steel)]">{s.label}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        {/* LEFT */}
        <div className="space-y-6">
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[var(--navy)]">My Enrolled Courses</h2>
              <Link href="/app/learn" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
                View All Courses →
              </Link>
            </div>
            <ul className="space-y-4">
              {(courseCards.length ? courseCards : [
                {
                  id: "placeholder",
                  title: "Driving Instructor Certification Program",
                  thumb: "/cms/dashboard/course-1.jpg",
                  progress: 0,
                  status: "Module 1 of 8 • Not Started",
                  href: "/app/learn",
                  cta: "Start Course",
                  slug: "",
                },
              ]).map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-[var(--navy)]/8 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.thumb} alt="" className="h-14 w-20 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--navy)]">{c.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--steel)]">{c.status}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--mist)]">
                      <div className="h-full rounded-full bg-[#2b6cb0]" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                  <Link
                    href={c.href}
                    className="rounded-lg bg-[#2b6cb0] px-3 py-2 text-xs font-bold text-white hover:bg-[#245a96]"
                  >
                    {c.cta} {c.cta !== "Start Course" ? "→" : ""}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[var(--navy)]/8">
            <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
              <div className="relative min-h-36 bg-[var(--navy)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={continueThumb} alt="" className="h-full w-full object-cover opacity-90" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--navy)]">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              </div>
              <div className="flex flex-col justify-center p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--steel)]">Continue Learning</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--navy)]">
                  Next Lesson: {nextLesson?.title || "The Role of a Driving Instructor"}
                </h3>
                <p className="mt-1 text-sm text-[var(--steel)]">{nextLesson?.meta || "Lesson 5 of 8 | 12 min"}</p>
                <Link
                  href={nextLesson?.href || "/app/learn"}
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--amber)] px-4 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)]"
                >
                  <Play className="h-4 w-4 fill-current" /> Resume Lesson
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/app/practicum", label: "Book a Practical Training", icon: CalendarDays },
              { href: "/app/quiz", label: "Take an Assessment", icon: ClipboardList },
              { href: "/app/resources", label: "Download Resources", icon: FolderOpen },
              { href: "/app/support", label: "Get Support", icon: LifeBuoy },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3 rounded-xl border border-[var(--navy)]/12 bg-white px-4 py-3 text-sm font-semibold text-[var(--navy)] shadow-sm hover:border-[#2b6cb0]/40"
                >
                  <Icon className="h-4 w-4 text-[#2b6cb0]" />
                  {a.label}
                </Link>
              );
            })}
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <section id="progress" className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
            <h2 className="text-lg font-bold text-[var(--navy)]">Your Learning Progress</h2>
            <div className="mt-4 flex items-center gap-5">
              <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e8eef3" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#2b6cb0"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="52" textAnchor="middle" className="fill-[var(--navy)] text-[18px] font-bold">
                  {donut}%
                </text>
              </svg>
              <ul className="space-y-2 text-sm text-[var(--navy)]">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> {Math.max(courseCards.length, 1)} Courses Enrolled
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>{" "}
                  {courseCards.filter((c) => c.progress >= 100).length || (overallProgress >= 100 ? 1 : 0)} Course
                  Completed
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-[#2b6cb0]" />{" "}
                  {courseCards.filter((c) => c.progress > 0 && c.progress < 100).length || completedLessons.length}{" "}
                  Modules In Progress
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-slate-300" />{" "}
                  {Math.max(0, lessonEntitlements.length - completedLessons.length)} Modules Remaining
                </li>
              </ul>
            </div>
            <p className="mt-3 text-center text-xs font-semibold text-[var(--steel)]">{donut}% Course Completion</p>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--navy)]">Upcoming Sessions</h2>
              <Link href="/app/practicum" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
                View Calendar →
              </Link>
            </div>
            <ul className="space-y-3">
              {upcoming.length === 0 && (
                <>
                  <li className="flex items-center gap-3 rounded-lg border border-[var(--navy)]/8 p-3">
                    <div className="rounded-md bg-[#2b6cb0]/10 px-2 py-1 text-center text-[10px] font-bold uppercase text-[#2b6cb0]">
                      Soon
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--navy)]">Live Q&A: Instructor Licensing Prep</p>
                      <p className="text-xs text-[var(--steel)]">Book a practicum or info session</p>
                    </div>
                    <Link href="/app/practicum" className="rounded-md bg-[#2b6cb0] px-3 py-1.5 text-xs font-bold text-white">
                      Join
                    </Link>
                  </li>
                  <li className="flex items-center gap-3 rounded-lg border border-[var(--navy)]/8 p-3">
                    <div className="rounded-md bg-[#2b6cb0]/10 px-2 py-1 text-center text-[10px] font-bold uppercase text-[#2b6cb0]">
                      MN
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--navy)]">Minnesota Campus Info Session</p>
                      <p className="text-xs text-[var(--steel)]">Campus practical orientation</p>
                    </div>
                    <Link href="/app/practicum" className="rounded-md bg-[#2b6cb0] px-3 py-1.5 text-xs font-bold text-white">
                      Join
                    </Link>
                  </li>
                </>
              )}
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center gap-3 rounded-lg border border-[var(--navy)]/8 p-3">
                  <div className="rounded-md bg-[#2b6cb0]/10 px-2 py-1 text-center text-[10px] font-bold uppercase text-[#2b6cb0]">
                    {b.session.startDate || "TBD"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--navy)]">{b.session.title}</p>
                    <p className="text-xs capitalize text-[var(--steel)]">{b.status}</p>
                  </div>
                  <Link href="/app/practicum" className="rounded-md bg-[#2b6cb0] px-3 py-1.5 text-xs font-bold text-white">
                    Join
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--navy)]">My Certificates</h2>
              <Link href="/app/certificate" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
                View All →
              </Link>
            </div>
            {certificate ? (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--navy)]/8 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-[var(--amber)]">
                  <Award className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--navy)]">{certificate.programName}</p>
                  <p className="text-xs text-[var(--steel)]">
                    Completed on{" "}
                    {certificate.completedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Link
                  href="/app/certificate"
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--navy)]/15 px-2.5 py-1.5 text-xs font-semibold text-[var(--navy)]"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--navy)]/15 p-4 text-sm text-[var(--steel)]">
                No certificate yet. Complete your program and pass assessments to earn one.{" "}
                <Link href="/app/quiz" className="font-semibold text-[#2b6cb0] underline">
                  Take an assessment
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Student ID retained */}
      <section id="student-id" className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[var(--navy)]/8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--amber)]">Campus credential</p>
            <h2 className="text-lg font-bold text-[var(--navy)]">Student identity card</h2>
          </div>
          <Link href="/app/onboarding/license" className="text-sm font-semibold text-[#2b6cb0] hover:underline">
            License verification →
          </Link>
        </div>
        {params.photoError && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{params.photoError}</p>
        )}
        {params.photoOk && (
          <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">ID photo saved privately.</p>
        )}
        {enrollment ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <StudentIdCard
              data={{
                studentName: session.name,
                enrollmentNumber: enrollment.enrollmentNumber,
                programName: enrollment.level.name,
                enrolledAt: enrollment.startedAt,
                completedAt: enrollment.completedAt,
                photoUrl,
              }}
            />
            <form action={uploadIdPhoto} className="max-w-sm text-sm text-[var(--steel)]">
              <p className="font-medium text-[var(--navy)]">{photoUrl ? "Replace ID photo" : "Add passport-style photo"}</p>
              <input name="idPhoto" type="file" accept="image/*" required className="mt-2 block w-full text-sm" />
              <button type="submit" className="mt-2 rounded-lg bg-[var(--navy)] px-3 py-2 text-xs font-bold text-white">
                Upload
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-[var(--steel)]">
            Select a learning path to issue your enrollment ID.{" "}
            <Link href="/app/enroll" className="font-semibold text-[#2b6cb0] underline">
              Choose enrollment level
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
