import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AuthShell } from "@/components/auth/auth-shell";

const STEPS = ["Personal Information", "Training Details", "Additional Information", "Review & Finish"];

async function saveStep(formData: FormData) {
  "use server";
  const session = await requireUser();
  const step = Number(formData.get("step") || 1);
  const later = formData.get("later") === "1";

  const data: Record<string, string | number | Date | null> = {};

  if (step === 1) {
    const name = String(formData.get("name") || "").trim();
    if (name) await prisma.user.update({ where: { id: session.id }, data: { name } });
    data.phone = String(formData.get("phone") || "").trim() || null;
    data.phoneCountry = String(formData.get("phoneCountry") || "US").trim() || "US";
    data.dateOfBirth = String(formData.get("dateOfBirth") || "").trim() || null;
    data.country = String(formData.get("country") || "").trim() || null;
    data.state = String(formData.get("state") || "").trim() || null;
    data.city = String(formData.get("city") || "").trim() || null;
  } else if (step === 2) {
    data.trainingGoal = String(formData.get("trainingGoal") || "").trim() || null;
    data.experienceLevel = String(formData.get("experienceLevel") || "").trim() || null;
  } else if (step === 3) {
    data.howHeard = String(formData.get("howHeard") || "").trim() || null;
    data.additionalNotes = String(formData.get("additionalNotes") || "").trim() || null;
  }

  const nextStep = later ? step : Math.min(step + 1, 4);
  await prisma.profile.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      ...data,
      onboardingStep: later ? step : nextStep,
      ...(step === 4 || (!later && step === 3)
        ? {}
        : {}),
    },
    update: {
      ...data,
      onboardingStep: later ? step : step === 4 ? 4 : nextStep,
    },
  });

  if (later) redirect("/app");

  if (step >= 4) {
    await prisma.profile.update({
      where: { userId: session.id },
      data: { onboardingStep: 4, profileCompletedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "onboarding.profile_completed",
        metaJson: JSON.stringify({}),
      },
    });
    redirect("/onboarding/welcome");
  }

  // After step 3 continue goes to step 4 review; after confirming step 4 finishes
  redirect(`/onboarding/profile?step=${step === 3 ? 4 : step + 1}`);
}

export default async function ProfileOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;
  const profile = await prisma.profile.findUnique({ where: { userId: session.id } });
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const step = Math.min(4, Math.max(1, Number(params.step || profile?.onboardingStep || 1) || 1));
  const progress = (step / 4) * 100;

  return (
    <AuthShell
      headline="Complete Your Profile"
      imageSrc="/cms/auth-instructors.jpg"
      bullets={[]}
      stepper={{ steps: STEPS, activeIndex: step - 1 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--steel)]">
        Step {step} of 4
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--mist)]">
        <div className="h-full rounded-full bg-[var(--navy)] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-[var(--navy)]">{STEPS[step - 1]}</h2>

      <form action={saveStep} className="mt-6 space-y-4">
        <input type="hidden" name="step" value={step} />

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Full Name</label>
              <input
                name="name"
                defaultValue={user?.name ?? ""}
                required
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Phone Number</label>
              <div className="flex gap-2">
                <select
                  name="phoneCountry"
                  defaultValue={profile?.phoneCountry || "US"}
                  className="h-11 rounded-lg border border-[var(--navy)]/15 px-2 text-sm"
                >
                  <option value="US">🇺🇸 +1</option>
                  <option value="CA">🇨🇦 +1</option>
                  <option value="GB">🇬🇧 +44</option>
                  <option value="NG">🇳🇬 +234</option>
                  <option value="GH">🇬🇭 +233</option>
                  <option value="OTHER">Other</option>
                </select>
                <input
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                defaultValue={profile?.dateOfBirth ?? ""}
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Country</label>
              <select
                name="country"
                defaultValue={profile?.country || "United States"}
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm"
              >
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Nigeria</option>
                <option>Ghana</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">State/Province</label>
              <input
                name="state"
                defaultValue={profile?.state ?? "Minnesota"}
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">City</label>
              <input
                name="city"
                defaultValue={profile?.city ?? ""}
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Training goal</label>
              <select
                name="trainingGoal"
                defaultValue={profile?.trainingGoal || "instructor-certification"}
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm"
              >
                <option value="instructor-certification">Become a certified driving instructor</option>
                <option value="license-prep">Instructor license preparation</option>
                <option value="school-launch">Launch my own driving school</option>
                <option value="professional-development">Professional development</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Experience level</label>
              <select
                name="experienceLevel"
                defaultValue={profile?.experienceLevel || "beginner"}
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm"
              >
                <option value="beginner">New to instructor training</option>
                <option value="some">Some teaching or driving-school experience</option>
                <option value="licensed">Already licensed elsewhere</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">How did you hear about us?</label>
              <select
                name="howHeard"
                defaultValue={profile?.howHeard || "web"}
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm"
              >
                <option value="web">Website / search</option>
                <option value="referral">Referral</option>
                <option value="social">Social media</option>
                <option value="campus">Minnesota campus visit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Additional notes</label>
              <textarea
                name="additionalNotes"
                defaultValue={profile?.additionalNotes ?? ""}
                className="min-h-24 w-full rounded-lg border border-[var(--navy)]/15 px-3 py-2 text-sm outline-none ring-[var(--amber)] focus:ring-2"
                placeholder="Anything we should know before you start?"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 rounded-xl bg-[var(--mist)] p-4 text-sm text-[var(--navy)]">
            <p>
              <strong>Name:</strong> {user?.name}
            </p>
            <p>
              <strong>Email:</strong> {session.email}
            </p>
            <p>
              <strong>Phone:</strong> {profile?.phone || "—"} ({profile?.phoneCountry || "US"})
            </p>
            <p>
              <strong>Location:</strong> {[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "—"}
            </p>
            <p>
              <strong>Goal:</strong> {profile?.trainingGoal || "—"}
            </p>
            <p>
              <strong>Experience:</strong> {profile?.experienceLevel || "—"}
            </p>
            <p className="text-[var(--steel)]">Confirm to finish onboarding and enter your dashboard.</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
          {step < 4 && (
            <button
              type="submit"
              name="later"
              value="1"
              className="rounded-lg border border-[var(--navy)]/20 px-4 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--mist)]"
            >
              Save & Continue Later
            </button>
          )}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--amber)] px-4 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:bg-[var(--amber-hot)] sm:ml-auto"
          >
            {step === 1 && (
              <>
                Continue to Training Details <ArrowRight className="h-4 w-4" />
              </>
            )}
            {step === 2 && (
              <>
                Continue to Additional Info <ArrowRight className="h-4 w-4" />
              </>
            )}
            {step === 3 && (
              <>
                Continue to Review <ArrowRight className="h-4 w-4" />
              </>
            )}
            {step === 4 && (
              <>
                Finish & Enter Academy <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
