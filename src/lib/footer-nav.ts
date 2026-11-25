export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

/** Footer menus matching the homepage mock (Programs / Admissions / Students / About). */
export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Programs",
    links: [
      { label: "Instructor Certification", href: "/programs#certification" },
      { label: "License Preparation", href: "/programs#license" },
      { label: "Business Launch Program", href: "/programs#business" },
      { label: "All Programs", href: "/programs" },
    ],
  },
  {
    title: "Admissions",
    links: [
      { label: "Apply Now", href: "/signup" },
      { label: "Requirements", href: "/admissions" },
      { label: "Tuition & Fees", href: "/pricing" },
      { label: "Scholarships", href: "/admissions" },
    ],
  },
  {
    title: "Students",
    links: [
      { label: "Student Portal", href: "/app" },
      { label: "Course Access", href: "/app/learn" },
      { label: "Academic Calendar", href: "/students" },
      { label: "Support", href: "/app/support" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Our Instructors", href: "/about" },
      { label: "Minnesota Campus", href: "/about" },
      { label: "Contact Us", href: "/about#contact" },
    ],
  },
];

export function parseFooterColumns(raw: string | null | undefined): FooterColumn[] {
  try {
    const parsed = raw ? (JSON.parse(raw) as FooterColumn[]) : null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* fall through */
  }
  return DEFAULT_FOOTER_COLUMNS;
}
