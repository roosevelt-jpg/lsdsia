import type { PrismaClient } from "@prisma/client";
import { DEFAULT_ADMIN_DASHBOARD } from "@/lib/admin-dashboard-cms";

/** Default marketing CMS content matching the hi-res ChatGPT homepage / auth / dashboard mocks. */
export async function seedCms(prisma: PrismaClient) {
  await prisma.cmsMedia.deleteMany();
  await prisma.cmsTestimonial.deleteMany();
  await prisma.cmsStat.deleteMany();
  await prisma.cmsProgramCard.deleteMany();
  await prisma.cmsSection.deleteMany();
  await prisma.cmsPage.deleteMany();
  await prisma.cmsNavItem.deleteMany();
  await prisma.cmsSite.deleteMany();

  await prisma.cmsSite.create({
    data: {
      id: "default",
      brandName: "LIFE STAR INSTRUCTORS ACADEMY",
      tagline: "International Driving Instructor Training & Licensing",
      logoUrl: "/cms/logo-full-light.png",
      logoMarkUrl: "/cms/logo-mark.svg",
      headerTagline: "International Driving Instructor Training & Licensing",
      headerMetaLeft: "Worldwide Online Learning",
      headerMetaRight: "Minnesota Campus, USA",
      applyCtaLabel: "Apply Now",
      applyCtaHref: "/signup",
      loginCtaLabel: "Login",
      themeJson: JSON.stringify({
        navy: "#0B1F33",
        navyDeep: "#061526",
        amber: "#E6A817",
        amberHot: "#F0B92A",
        heroGradient: "linear-gradient(115deg,#061526 0%,#0B3A6E 55%,#1256A0 100%)",
        ctaGradient: "linear-gradient(115deg,#0B3A6E 0%,#1256A0 100%)",
        primaryBtnBg: "#E6A817",
        primaryBtnText: "#061526",
        secondaryBtnBorder: "#FFFFFF",
        secondaryBtnText: "#FFFFFF",
      }),
      contactAddress: "Minnesota Campus, 1234 Life Star Drive, Minneapolis, MN 55420, USA",
      contactPhone: "+1 (612) 555-0147",
      contactEmail: "info@lifestarinstructorsacademy.com",
      ownerName: "John Addo",
      footerBlurb:
        "International driving instructor training, licensing preparation and driving school business support.",
      copyrightText: "© 2025 Life Star Instructors Academy. All Rights Reserved.",
      socialJson: JSON.stringify([
        { network: "facebook", href: "https://facebook.com" },
        { network: "instagram", href: "https://instagram.com" },
        { network: "youtube", href: "https://youtube.com" },
        { network: "linkedin", href: "https://linkedin.com" },
        { network: "tiktok", href: "https://tiktok.com" },
      ]),
      newsletterBlurb: "Get training updates, new courses and special offers.",
      contentVersion: 7,
      dashboardTagline: "Learn Globally. Train Professionally. Lead Confidently.",
      dashboardHeroBgUrl: "/cms/dashboard/hero-bg-hires.jpg",
      dashboardHeroPersonUrl: "/cms/dashboard/hero-person.jpg",
      dashboardUpgradeImageUrl: "/cms/dashboard/upgrade-car.jpg",
      dashboardContinueThumbUrl: "/cms/dashboard/continue-lesson.jpg",
      dashboardHeroSubtitle:
        "Continue your journey to becoming a certified driving instructor with Life Star Instructors Academy.",
      dashboardUpgradeTitle: "Upgrade to Instructor Pro",
      dashboardUpgradeBody: "Advanced Courses\nBusiness Launch Toolkit\n1-on-1 Mentorship",
      dashboardUpgradeCtaLabel: "Upgrade Now",
      dashboardUpgradeCtaHref: "/app/store",
      dashboardHeroCtaLabel: "Continue Learning",
      dashboardHeroCtaHref: "/app/learn",
      dashboardHeroSecondaryLabel: "View My Progress",
      dashboardHeroSecondaryHref: "#progress",
      adminHeroTitle: "Welcome to Life Star Instructors Academy",
      adminHeroSubtitle:
        "Manage training, students, instructors and academy operations all in one place.",
      adminHeroBgUrl: "/cms/admin/hero-banner.jpg",
      adminHeroPersonUrl: "/cms/admin/hero-person-hires.jpg",
      adminPromoTitle: "Grow Your Driving School",
      adminPromoBody: "Expand campus capacity, launch new cohorts, and scale instructor training.",
      adminPromoImageUrl: "/cms/admin/promo-grow.jpg",
      adminPromoCtaLabel: "Learn More",
      adminPromoCtaHref: "/admin/school-launch",
      adminHeroCtaPrimaryLabel: "New Enrollment",
      adminHeroCtaPrimaryHref: "/admin/candidates",
      adminHeroCtaSecondaryLabel: "View Reports",
      adminHeroCtaSecondaryHref: "/admin",
      adminHeroCtaTertiaryLabel: "Manage Courses",
      adminHeroCtaTertiaryHref: "/admin/content",
      adminDashboardJson: JSON.stringify(DEFAULT_ADMIN_DASHBOARD, null, 2),
    },
  });

  const nav = [
    { label: "Home", href: "/", sortOrder: 0 },
    { label: "Courses", href: "/programs", sortOrder: 1 },
    { label: "Admissions", href: "/admissions", sortOrder: 2 },
    { label: "Training", href: "/students", sortOrder: 3 },
    { label: "Resources", href: "/resources", sortOrder: 4 },
    { label: "About", href: "/about", sortOrder: 5 },
  ];
  for (const item of nav) {
    await prisma.cmsNavItem.create({ data: item });
  }

  const home = await prisma.cmsPage.create({
    data: {
      slug: "home",
      title: "Life Star Instructors Academy",
      metaDescription:
        "Learn globally. Train professionally. Lead confidently. Premier international academy for driving instructor training.",
      heroBadge: "",
      heroTitle: "Learn globally. Train professionally. Lead confidently.",
      heroSubtitle:
        "The premier international academy for driving instructor training, licensing preparation and driving school business launch support.",
      heroImageUrl: "/cms/hero-slide-1.jpg",
      ctaPrimaryLabel: "Apply for Training",
      ctaPrimaryHref: "/signup",
      ctaSecondaryLabel: "Watch Academy Overview",
      ctaSecondaryHref: "/about",
      sortOrder: 0,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "hero",
      title: home.heroTitle,
      subtitle: home.heroSubtitle,
      imageUrl: home.heroImageUrl,
      ctaLabel: home.ctaPrimaryLabel,
      ctaHref: home.ctaPrimaryHref,
      dataJson: JSON.stringify({
        secondaryCtaLabel: home.ctaSecondaryLabel,
        secondaryCtaHref: home.ctaSecondaryHref,
        slideIntervalMs: 5500,
        slides: [
          {
            imageUrl: "/cms/hero-slide-1.jpg",
            alt: "Life Star instructor beside training vehicle",
          },
          {
            imageUrl: "/cms/hero-slide-2.jpg",
            alt: "Life Star academy instructors",
          },
          {
            imageUrl: "/cms/hero-slide-3.jpg",
            alt: "Life Star branded training car",
          },
          {
            imageUrl: "/cms/hero-slide-4.jpg",
            alt: "Life Star Instructors Academy campus",
          },
          {
            imageUrl: "/cms/hero-slide-5.jpg",
            alt: "Instructor with Life Star training vehicle",
          },
          {
            imageUrl: "/cms/hero-slide-6.jpg",
            alt: "Campus instructor in safety vest",
          },
        ],
        tiles: [
          { title: "Online Learning Worldwide", body: "", icon: "globe" },
          { title: "Hands-on Training at Our Minnesota Campus", body: "", icon: "map" },
          { title: "Licensing Preparation", body: "", icon: "badge" },
          { title: "Start Your Driving School", body: "", icon: "building" },
        ],
      }),
      sortOrder: 0,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "programs",
      eyebrow: "OUR PROGRAMS",
      title: "Professional Training Programs",
      subtitle: "Comprehensive, flexible and globally recognized driving instructor training courses.",
      sortOrder: 1,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "trusted",
      eyebrow: "WHY LIFE STAR",
      title: "A Global Academy Built for Your Success",
      body: "World-class training, real-world experience and ongoing support to help you become a licensed instructor and confidently build your career or business.",
      imageUrl: "/cms/hero-slide-4.jpg",
      ctaLabel: "Explore Campus",
      ctaHref: "/about",
      dataJson: JSON.stringify({
        checklist: [
          "Internationally recognized training",
          "Expert, experienced instructors",
          "Flexible online and in-person options",
          "Hands-on practical training in Minnesota",
          "Business launch and growth support",
          "Ongoing student and graduate support",
        ],
        campusCard: {
          title: "Minnesota Campus Training",
          location: "Minnesota, USA",
          body: "Get real-world, hands-on instructor training at our state-of-the-art campus in Minnesota.",
          items: [
            "On-road practical training",
            "Real classroom instruction",
            "Modern training vehicles",
            "Access to experienced mentors",
          ],
          ctaLabel: "Explore Campus",
          ctaHref: "/about",
        },
      }),
      sortOrder: 2,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "stats",
      title: "Impact by the numbers",
      sortOrder: 3,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "testimonials",
      eyebrow: "WHAT OUR GRADUATES SAY",
      title: "Trusted by Instructors Around the World",
      subtitle: "Real graduates who trained with Life Star and built careers worldwide.",
      sortOrder: 4,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "cta",
      title: "Ready to Start Your Instructor Journey?",
      subtitle: "Join a global community of professional driving instructors today.",
      imageUrl: "/cms/mock-cta-car.jpg",
      ctaLabel: "Apply Now",
      ctaHref: "/signup",
      dataJson: JSON.stringify({
        secondaryCtaLabel: "Talk to an Advisor",
        secondaryCtaHref: "/admissions",
      }),
      sortOrder: 5,
    },
  });

  const programCards = [
    {
      title: "Driving Instructor Training Program",
      blurb: "Complete training to become a certified driving instructor.",
      imageUrl: "/cms/mock-program-training.jpg",
      href: "/programs#certification",
      iconKey: "graduation",
      sortOrder: 0,
    },
    {
      title: "Instructor Licensing Preparation",
      blurb: "Get fully prepared for your state instructor licensing exams.",
      imageUrl: "/cms/mock-program-licensing.jpg",
      href: "/programs#license",
      iconKey: "license",
      sortOrder: 1,
    },
    {
      title: "Start a Driving School Business",
      blurb: "Step-by-step guidance to launch and grow your own driving school.",
      imageUrl: "/cms/mock-program-business.jpg",
      href: "/programs#business",
      iconKey: "building",
      sortOrder: 2,
    },
    {
      title: "Flexible Online Learning (Worldwide)",
      blurb: "Study from anywhere with our interactive, self-paced courses.",
      imageUrl: "/cms/mock-program-online.jpg",
      href: "/programs#online",
      iconKey: "globe",
      sortOrder: 3,
    },
  ];
  for (const p of programCards) {
    await prisma.cmsProgramCard.create({ data: p });
  }

  const stats = [
    { value: "10,000+", label: "Trained Instructors", iconKey: "users", sortOrder: 0 },
    { value: "50+", label: "Countries Worldwide", iconKey: "globe", sortOrder: 1 },
    { value: "95%", label: "Licensing Success Rate", iconKey: "badge", sortOrder: 2 },
    { value: "Minnesota, USA", label: "Practical Training Campus", iconKey: "building", sortOrder: 3 },
  ];
  for (const s of stats) {
    await prisma.cmsStat.create({ data: s });
  }

  const testimonials = [
    {
      quote:
        "Life Star’s online track let me study from abroad, then the Minnesota practicals made licensing feel achievable. I now teach full time.",
      name: "Amina R.",
      title: "Driving Instructor, UK",
      photoUrl: "/cms/mock-testimonial-1.jpg",
      stars: 5,
      sortOrder: 0,
    },
    {
      quote:
        "The business launch coaching was the missing piece. After certification I opened my own school with a clear operator packet plan.",
      name: "James K.",
      title: "Licensed Instructor, Canada",
      photoUrl: "/cms/mock-testimonial-2.jpg",
      stars: 5,
      sortOrder: 1,
    },
    {
      quote:
        "Professional curriculum, real campus training, and support that treats international students as first-class candidates.",
      name: "Maria S.",
      title: "Driving School Owner",
      photoUrl: "/cms/mock-testimonial-3.jpg",
      stars: 5,
      sortOrder: 2,
    },
  ];
  for (const t of testimonials) {
    await prisma.cmsTestimonial.create({ data: t });
  }

  const innerPages = [
    {
      slug: "programs",
      title: "Courses",
      metaDescription: "Life Star instructor certification, license preparation, and school business launch programs.",
      heroBadge: "OUR PROGRAMS",
      heroTitle: "Professional Training Programs",
      heroSubtitle:
        "Comprehensive, flexible and globally recognized driving instructor training courses.",
      heroImageUrl: "/cms/mock-program-training.jpg",
      bodyMarkdown: `## Driving Instructor Training Program
Complete training to become a certified driving instructor.

## Instructor Licensing Preparation
Get fully prepared for your state instructor licensing exams. Classroom and behind-the-wheel pathways with Minnesota campus practicals — BTW ($7,000) and Classroom ($15,000) tuition options unchanged.

## Start a Driving School Business
Step-by-step guidance to launch and grow your own driving school.

## Flexible Online Learning (Worldwide)
Study from anywhere with our interactive, self-paced courses.`,
      ctaPrimaryLabel: "Apply for Training",
      ctaPrimaryHref: "/signup",
      ctaSecondaryLabel: "View tuition",
      ctaSecondaryHref: "/pricing",
      sortOrder: 1,
    },
    {
      slug: "admissions",
      title: "Admissions",
      metaDescription: "How to apply to Life Star Instructors Academy.",
      heroBadge: "Admissions",
      heroTitle: "Start your Life Star application",
      heroSubtitle:
        "Students are welcome worldwide. Create your account, verify your driver’s license, choose an enrollment level, and begin online study before Minnesota campus practicals.",
      heroImageUrl: "/cms/mock-auth-instructors.jpg",
      bodyMarkdown: `## Steps
1. Create your candidate account
2. Upload your government-issued driver’s license for verification
3. Select an enrollment level and purchase lessons or packages
4. Complete practice exams and your application packet
5. Schedule Minnesota campus practicals when ready

## Advisor support
Talk to an Advisor about timelines, tuition plans, and campus visits.`,
      ctaPrimaryLabel: "Apply Now",
      ctaPrimaryHref: "/signup",
      ctaSecondaryLabel: "Login",
      ctaSecondaryHref: "/login",
      sortOrder: 2,
    },
    {
      slug: "students",
      title: "Training",
      metaDescription: "Candidate dashboard, student ID, certificates, and school-launch tools.",
      heroBadge: "Student portal",
      heroTitle: "Train with Life Star",
      heroSubtitle:
        "Access learning, quizzes, practicum booking, your Life Star student identity card, digital certificate, and school-launch coaching from one secure portal.",
      heroImageUrl: "/cms/dashboard/hero-person.jpg",
      bodyMarkdown: `## Candidate dashboard
Track enrollment, lessons, exams, and next actions.

## Student identity card
Passport photo, enrollment number, and scannable barcode for Minnesota campus visits.

## Digital certificate
Issued when you complete the program and pass exams — verifiable online.

## Open a school
Post-program coaching to register and operate your driving school.`,
      ctaPrimaryLabel: "Open dashboard",
      ctaPrimaryHref: "/app",
      ctaSecondaryLabel: "Login",
      ctaSecondaryHref: "/login",
      sortOrder: 3,
    },
    {
      slug: "resources",
      title: "Resources",
      metaDescription: "Policies, guides, and Life Star academy resources.",
      heroBadge: "Resources",
      heroTitle: "Guides, policies, and support",
      heroSubtitle: "Find course catalogs, licensing guides, and academy policies.",
      heroImageUrl: "/cms/mock-auth-road.jpg",
      bodyMarkdown: `## Support
Email info@lifestarinstructorsacademy.com or call +1 (612) 555-0147.

## Course Catalog
Browse professional training programs and online learning pathways.

## Licensing Guide
State instructor licensing preparation overview.

## Business Launch Guide
Register and operate your own driving school with Life Star coaching.

<a id="privacy"></a>
## Privacy Policy
Life Star protects candidate account data, private uploads (licenses, ID photos), and payment records.

<a id="terms"></a>
## Terms of Service
Use of the Instructor Academy portal is for enrolled candidates and authorized staff.

<a id="refund"></a>
## Refund Policy
Tuition and payment-plan refunds follow the terms stated at purchase.`,
      ctaPrimaryLabel: "Contact admissions",
      ctaPrimaryHref: "/admissions",
      ctaSecondaryLabel: "Pricing",
      ctaSecondaryHref: "/pricing",
      sortOrder: 4,
    },
    {
      slug: "about",
      title: "About",
      metaDescription: "About Life Star Instructors Academy and our Minnesota campus.",
      heroBadge: "WHY LIFE STAR",
      heroTitle: "A Global Academy Built for Your Success",
      heroSubtitle:
        "World-class training, real-world experience and ongoing support to help you become a licensed instructor.",
      heroImageUrl: "/cms/mock-campus-building.jpg",
      bodyMarkdown: `## Our mission
Train confident, licensed instructors who can teach safely — and who can return home to operate their own driving schools.

## Minnesota Campus Training
Get real-world, hands-on instructor training at our state-of-the-art campus in Minnesota.

- On-road practical training
- Real classroom instruction
- Modern training vehicles
- Access to experienced mentors

## Leadership
**John Addo**, Owner of Life Star Driving School, stewards the academy’s worldwide student experience and campus standards.`,
      ctaPrimaryLabel: "Explore Campus",
      ctaPrimaryHref: "/about",
      ctaSecondaryLabel: "Apply Now",
      ctaSecondaryHref: "/signup",
      sortOrder: 5,
    },
  ];

  for (const page of innerPages) {
    await prisma.cmsPage.create({ data: page });
  }

  console.log("CMS marketing defaults seeded (mock fidelity v2).");
}
