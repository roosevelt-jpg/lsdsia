import type { PrismaClient } from "@prisma/client";
import { DEFAULT_FOOTER_COLUMNS } from "@/lib/footer-nav";

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
      contactAddress: "7240 Brooklyn Blvd, Minneapolis, MN 55429, United States",
      contactPhone: "+1 763-390-7637",
      contactEmail: "info@lifestarinstructorsacademy.com",
      ownerName: "John Addo",
      footerBlurb: "Learn globally. Train professionally. Lead confidently.",
      copyrightText: "© 2025 Life Star Instructors Academy. All Rights Reserved.",
      socialJson: JSON.stringify([
        { network: "facebook", href: "https://facebook.com" },
        { network: "instagram", href: "https://instagram.com" },
        { network: "youtube", href: "https://youtube.com" },
        { network: "linkedin", href: "https://linkedin.com" },
      ]),
      footerNavJson: JSON.stringify(DEFAULT_FOOTER_COLUMNS, null, 2),
      newsletterBlurb: "Get training updates, new courses and special offers.",
      contentVersion: 8,
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
    },
  });

  const nav = [
    { label: "Home", href: "/", sortOrder: 0 },
    { label: "Programs", href: "/programs", sortOrder: 1 },
    { label: "Admissions", href: "/admissions", sortOrder: 2 },
    { label: "Students", href: "/students", sortOrder: 3 },
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
      heroBadge: "International Instructor Training Platform",
      heroTitle: "Become a Certified Driving Instructor with Life Star",
      heroSubtitle:
        "A world-class academy that prepares you to become a licensed driving instructor, build a rewarding career, or launch your own school — anywhere in the world.",
      heroImageUrl: "/cms/hero-homepage-bg.jpg",
      ctaPrimaryLabel: "Apply Now",
      ctaPrimaryHref: "/signup",
      ctaSecondaryLabel: "Explore Programs",
      ctaSecondaryHref: "/programs",
      sortOrder: 0,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "hero",
      eyebrow: "International Instructor Training Platform",
      title: home.heroTitle,
      subtitle: home.heroSubtitle,
      imageUrl: home.heroImageUrl,
      ctaLabel: home.ctaPrimaryLabel,
      ctaHref: home.ctaPrimaryHref,
      dataJson: JSON.stringify({
        eyebrow: "International Instructor Training Platform",
        secondaryCtaLabel: home.ctaSecondaryLabel,
        secondaryCtaHref: home.ctaSecondaryHref,
        slideIntervalMs: 6500,
        slides: [
          {
            imageUrl: "/cms/hero-homepage-bg.jpg",
            alt: "Life Star instructor and student with branded vehicle",
          },
          {
            imageUrl: "/cms/hero-homepage-photo.jpg",
            alt: "Life Star training vehicle and instructor",
          },
          {
            imageUrl: "/cms/hero-slide-1.jpg",
            alt: "Life Star instructor beside training vehicle",
          },
          {
            imageUrl: "/cms/hero-slide-3.jpg",
            alt: "Life Star branded training car",
          },
        ],
        checks: [
          "Online Learning (Worldwide)",
          "Practical Training (Minnesota)",
          "License & Business Support",
        ],
        tiles: [
          {
            title: "Learn Online",
            body: "Flexible, self-paced training accessible from anywhere in the world.",
            icon: "laptop",
          },
          {
            title: "Train In Minnesota",
            body: "Gain hands-on, real-world experience at our Minnesota campus.",
            icon: "person",
          },
          {
            title: "Get Licensed",
            body: "Meet state requirements with expert guidance and exam prep.",
            icon: "license",
          },
          {
            title: "Start Your Own School",
            body: "Get the tools, guidance, and business support to launch.",
            icon: "rocket",
          },
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
      title: "Comprehensive Instructor Training Programs",
      subtitle:
        "Flexible pathways to certification, licensing, and launching your own driving school.",
      sortOrder: 1,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "trusted",
      eyebrow: "WHY LIFE STAR",
      title: "A Trusted Global Leader in Instructor Training",
      body: "We combine expert instruction, real-world experience, and business guidance to help you build a long-term, impactful career in driver education.",
      imageUrl: "/cms/mock-trusted-bg.jpg",
      ctaLabel: "Apply Today",
      ctaHref: "/signup",
      dataJson: JSON.stringify({
        pillars: [
          {
            title: "Proven Expertise",
            body: "Years of experience in driver education and instructor training.",
            icon: "trophy",
          },
          {
            title: "Global Access",
            body: "Online training for students worldwide.",
            icon: "globe",
          },
          {
            title: "Experienced Instructors",
            body: "Learn from licensed, industry-leading professionals.",
            icon: "users",
          },
          {
            title: "Career & Business Support",
            body: "From licensing to launching your own driving school.",
            icon: "shield",
          },
        ],
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
      title: "Success Stories from Around the World",
      subtitle: "",
      sortOrder: 4,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "cta",
      title: "Ready to Start Your Journey?",
      subtitle:
        "Apply now to join Life Star Instructors Academy and take the first step toward a rewarding, high-impact career.",
      imageUrl: "/cms/cta-journey-road.jpg",
      ctaLabel: "Apply Now",
      ctaHref: "/signup",
      dataJson: JSON.stringify({
        secondaryCtaLabel: "Speak with an Advisor",
        secondaryCtaHref: "/admissions",
      }),
      sortOrder: 5,
    },
  });

  const programCards = [
    {
      title: "Driving Instructor Certification Program",
      blurb:
        "Complete professional training to become a certified driving instructor with online theory and Minnesota practicals.",
      imageUrl: "/cms/mock-program-training.jpg",
      href: "/programs#certification",
      iconKey: "graduation",
      sortOrder: 0,
    },
    {
      title: "Instructor License Preparation",
      blurb: "Get fully prepared for your state instructor licensing exams with expert guidance.",
      imageUrl: "/cms/mock-program-licensing.jpg",
      href: "/programs#license",
      iconKey: "license",
      sortOrder: 1,
    },
    {
      title: "Driving School Business Launch Program",
      blurb: "Step-by-step guidance, tools, and coaching to launch and grow your own driving school.",
      imageUrl: "/cms/mock-program-business.jpg",
      href: "/programs#business",
      iconKey: "rocket",
      sortOrder: 2,
    },
  ];
  for (const p of programCards) {
    await prisma.cmsProgramCard.create({ data: p });
  }

  const stats = [
    { value: "5,000+", label: "Students Trained", iconKey: "users", sortOrder: 0 },
    { value: "98%", label: "Certification Success Rate", iconKey: "award", sortOrder: 1 },
    { value: "50+", label: "Countries Served", iconKey: "globe", sortOrder: 2 },
    { value: "1", label: "Minnesota Training Campus", iconKey: "building", sortOrder: 3 },
  ];
  for (const s of stats) {
    await prisma.cmsStat.create({ data: s });
  }

  const testimonials = [
    {
      quote:
        "Life Star gave me the knowledge, confidence, and support to become a licensed instructor. The training was professional and practical!",
      name: "Daniel K.",
      title: "Certified Driving Instructor",
      photoUrl: "/cms/mock-testimonial-1.jpg",
      stars: 5,
      sortOrder: 0,
    },
    {
      quote:
        "The program was well-structured and flexible. I completed the online training from my country and later did my practical training in Minnesota.",
      name: "Maria E.",
      title: "International Graduate",
      photoUrl: "/cms/mock-testimonial-2.jpg",
      stars: 5,
      sortOrder: 1,
    },
    {
      quote:
        "With Life Star's guidance, I not only got my instructor license but also launched my own driving school. Highly recommended!",
      name: "James T.",
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
Email info@lifestarinstructorsacademy.com or call +1 763-390-7637.

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
