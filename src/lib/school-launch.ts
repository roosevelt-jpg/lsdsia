/** Guidance checklist for opening a commercial driving school (not legal advice). */
export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
] as const;

export type ChecklistState = Record<string, boolean>;

export const SCHOOL_LAUNCH_STEPS = [
  {
    id: "choose_state",
    title: "Choose your operating state",
    body: "Pick the U.S. state where you plan to open. Requirements differ by DMV / DPS / licensing board.",
  },
  {
    id: "entity_formation",
    title: "Form a business entity",
    body: "Most states expect an LLC or corporation before applying. File with the Secretary of State and keep formation documents.",
  },
  {
    id: "ein_bank",
    title: "EIN and business banking",
    body: "Obtain an EIN from the IRS and open a business account for tuition and insurance payments.",
  },
  {
    id: "insurance_bond",
    title: "Insurance and surety bond",
    body: "Commercial auto / liability coverage and any required surety bond for student contracts — amounts vary by state.",
  },
  {
    id: "facility_vehicles",
    title: "Facility and training vehicles",
    body: "Secure a classroom/office location and dual-control vehicles that meet state equipment and marking rules.",
  },
  {
    id: "instructor_staffing",
    title: "Licensed instructors",
    body: "Staff with instructors who hold the state’s commercial driver-training instructor credentials (Life Star prepares you for this path).",
  },
  {
    id: "state_application",
    title: "State DMV / DPS school application",
    body: "Complete the official driving-school operator application for your state. Life Star coaches you on the packet — we do not file on your behalf or give legal advice.",
  },
  {
    id: "inspection_ready",
    title: "Inspection readiness",
    body: "Prepare for a state inspection of records, vehicles, and facilities before the operating license is issued.",
  },
] as const;

export const SCHOOL_DOC_KINDS = [
  { kind: "state_application", label: "State school / operator application draft" },
  { kind: "entity_docs", label: "Entity formation documents" },
  { kind: "bond_insurance", label: "Bond / insurance certificates" },
  { kind: "facility", label: "Facility lease or ownership proof" },
  { kind: "instructor_roster", label: "Instructor roster / licenses" },
  { kind: "other", label: "Other supporting document" },
] as const;

export function parseChecklist(json: string | null | undefined): ChecklistState {
  try {
    return json ? (JSON.parse(json) as ChecklistState) : {};
  } catch {
    return {};
  }
}

export function checklistProgress(checklist: ChecklistState) {
  const total = SCHOOL_LAUNCH_STEPS.length;
  const done = SCHOOL_LAUNCH_STEPS.filter((s) => checklist[s.id]).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}
