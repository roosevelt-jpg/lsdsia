"use client";

type Props = {
  requireFiles?: boolean;
  defaultLicenseState?: string;
  defaultLicenseNumber?: string;
  defaultPassportNumber?: string;
  hasLicense?: boolean;
  hasPassportPhoto?: boolean;
  hasTravelPassport?: boolean;
};

export function IdentityDocumentsFields({
  requireFiles = true,
  defaultLicenseState = "",
  defaultLicenseNumber = "",
  defaultPassportNumber = "",
  hasLicense = false,
  hasPassportPhoto = false,
  hasTravelPassport = false,
}: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--steel)]">
        Upload clear photos or PDFs of your identity documents. Files stay in private storage (max 900KB each) for
        academy verification — they are not published on the open web.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">License state / region</label>
          <input
            name="licenseState"
            defaultValue={defaultLicenseState}
            placeholder="e.g. MN, ON, Greater London"
            className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">License number (optional)</label>
          <input
            name="licenseNumber"
            defaultValue={defaultLicenseNumber}
            className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">
          Driver’s license {hasLicense ? "(replace optional)" : ""}
        </label>
        <input
          name="licenseFile"
          type="file"
          accept="image/*,application/pdf"
          required={requireFiles && !hasLicense}
          className="block w-full text-sm text-[var(--navy)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--mist)] file:px-3 file:py-2 file:text-sm file:font-semibold"
        />
        {hasLicense && <p className="mt-1 text-xs text-emerald-700">License already on file — upload only to replace.</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">
          Passport-style photo {hasPassportPhoto ? "(replace optional)" : ""}
        </label>
        <input
          name="passportPhotoFile"
          type="file"
          accept="image/*"
          required={requireFiles && !hasPassportPhoto}
          className="block w-full text-sm text-[var(--navy)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--mist)] file:px-3 file:py-2 file:text-sm file:font-semibold"
        />
        <p className="mt-1 text-xs text-[var(--steel)]">Front-facing headshot used for your student ID card.</p>
        {hasPassportPhoto && (
          <p className="mt-1 text-xs text-emerald-700">Passport photo already on file — upload only to replace.</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">
          Travel passport copy {hasTravelPassport ? "(replace optional)" : ""}
        </label>
        <input
          name="travelPassportFile"
          type="file"
          accept="image/*,application/pdf"
          required={requireFiles && !hasTravelPassport}
          className="block w-full text-sm text-[var(--navy)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--mist)] file:px-3 file:py-2 file:text-sm file:font-semibold"
        />
        <p className="mt-1 text-xs text-[var(--steel)]">
          Bio / photo page of your traveling passport (or national ID passport booklet).
        </p>
        {hasTravelPassport && (
          <p className="mt-1 text-xs text-emerald-700">Travel passport already on file — upload only to replace.</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Passport number (optional)</label>
        <input
          name="passportNumber"
          defaultValue={defaultPassportNumber}
          className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
        />
      </div>
    </div>
  );
}
