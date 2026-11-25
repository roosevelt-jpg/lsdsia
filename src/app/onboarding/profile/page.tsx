import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AuthShell } from "@/components/auth/auth-shell";
import { LocationFields } from "@/components/onboarding/location-fields";
import { IdentityDocumentsFields } from "@/components/onboarding/identity-documents-fields";
import { getIdentityDocStatus, saveIdentityDocuments } from "@/lib/identity-docs";

const STEPS = [
  "Personal Information",
  "Training Details",
  "Identity Documents",
  "Additional Information",
  "Review & Finish",
];

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
    try {
      await saveIdentityDocuments({
        userId: session.id,
        actorId: session.id,
        formData,
        requireAll: !later,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Document upload failed";
      redirect(`/onboarding/profile?step=3&error=${encodeURIComponent(msg)}`);
    }
  } else if (step === 4) {
    data.howHeard = String(formData.get("howHeard") || "").trim() || null;
    data.additionalNotes = String(formData.get("additionalNotes") || "").trim() || null;
  }

  const nextStep = later ? step : Math.min(step + 1, 5);
  await prisma.profile.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      ...data,
      onboardingStep: later ? step : nextStep,
    },
    update: {
      ...data,
      onboardingStep: later ? step : step === 5 ? 5 : nextStep,
    },
  });

  if (later) redirect("/app");

  if (step >= 5) {
    await prisma.profile.update({
      where: { userId: session.id },
      data: { onboardingStep: 5, profileCompletedAt: new Date() },
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

  redirect(`/onboarding/profile?step=${step === 4 ? 5 : step + 1}`);
}

export default async function ProfileOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string }>;
}) {
  const session = await requireUser();
  const params = await searchParams;
  const profile = await prisma.profile.findUnique({ where: { userId: session.id } });
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const docs = await getIdentityDocStatus(session.id);
  const license = await prisma.licenseVerification.findUnique({ where: { userId: session.id } });

  // Migrate old 4-step progress: step 3 (additional) → 4, step 4 (review) → 5
  let rawStep = Number(params.step || profile?.onboardingStep || 1) || 1;
  if (!params.step && profile?.onboardingStep === 3 && profile.howHeard) rawStep = 4;
  if (!params.step && profile?.onboardingStep === 4 && profile.profileCompletedAt) rawStep = 5;
  const step = Math.min(5, Math.max(1, rawStep));
  const progress = (step / 5) * 100;

  return (
    <AuthShell
      headline="Complete Your Profile"
      imageSrc="/cms/mock-auth-instructors.jpg"
      bullets={[]}
      stepper={{ steps: STEPS, activeIndex: step - 1 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--steel)]">
        Step {step} of 5
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--mist)]">
        <div className="h-full rounded-full bg-[var(--navy)] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-[var(--navy)]">{STEPS[step - 1]}</h2>

      {params.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{params.error}</p>
      )}

      <form action={saveStep} className="mt-6 space-y-4" encType="multipart/form-data">
        <input type="hidden" name="step" value={step} />

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Full Name</label>
              <input
                name="name"
                defaultValue={user?.name ?? ""}
                required
                className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
              />
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
            <LocationFields
              defaultCountry={profile?.country || "United States"}
              defaultState={profile?.state || "Minnesota"}
              defaultCity={profile?.city || ""}
              defaultPhoneCountry={profile?.phoneCountry || "US"}
              defaultPhone={profile?.phone || ""}
            />
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
          <IdentityDocumentsFields
            requireFiles
            defaultLicenseState={license?.licenseState || profile?.state || ""}
            defaultLicenseNumber={license?.licenseNumber || ""}
            defaultPassportNumber={license?.passportNumber || ""}
            hasLicense={docs.hasLicense}
            hasPassportPhoto={docs.hasPassportPhoto}
            hasTravelPassport={docs.hasTravelPassport}
          />
        )}

        {step === 4 && (
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

        {step === 5 && (
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
              <strong>Location:</strong>{" "}
              {[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "—"}
            </p>
            <p>
              <strong>Goal:</strong> {profile?.trainingGoal || "—"}
            </p>
            <p>
              <strong>Experience:</strong> {profile?.experienceLevel || "—"}
            </p>
            <p>
              <strong>Documents:</strong>{" "}
              {[
                docs.hasLicense ? "Driver’s license" : null,
                docs.hasPassportPhoto ? "Passport photo" : null,
                docs.hasTravelPassport ? "Travel passport" : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Missing — go back to Identity Documents"}
            </p>
            <p className="text-[var(--steel)]">Confirm to finish onboarding and enter your dashboard.</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
          {step < 5 && (
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
                Continue to Identity Documents <ArrowRight className="h-4 w-4" />
              </>
            )}
            {step === 3 && (
              <>
                Continue to Additional Info <ArrowRight className="h-4 w-4" />
              </>
            )}
            {step === 4 && (
              <>
                Continue to Review <ArrowRight className="h-4 w-4" />
              </>
            )}
            {step === 5 && (
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
