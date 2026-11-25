import type { PrismaClient } from "@prisma/client";

/** Default marketing CMS content matching the ChatGPT homepage mock. */
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
      tagline: "International instructor training · Minnesota campus practicals",
      contactAddress: "Life Star Driving School — Minnesota main campus, USA",
      contactPhone: "(651) 555-0147",
      contactEmail: "academy@lifestardrivingschool.example",
      ownerName: "John Addo",
      footerBlurb:
        "Life Star Driving School trains commercial driving instructors worldwide — study online, complete practicals in Minnesota under Owner John Addo’s leadership, then launch your own school.",
      copyrightText: "© 2026 Life Star Instructors Academy. All rights reserved.",
      socialJson: JSON.stringify([
        { network: "facebook", href: "https://facebook.com" },
        { network: "instagram", href: "https://instagram.com" },
        { network: "linkedin", href: "https://linkedin.com" },
        { network: "youtube", href: "https://youtube.com" },
      ]),
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
        "Become a certified driving instructor with Life Star — online worldwide, practical training in Minnesota.",
      heroBadge: "International Instructor Training Platform",
      heroTitle: "Become a Certified Driving Instructor with Life Star",
      heroSubtitle:
        "World-class licensing preparation and business-launch coaching for aspiring instructors and school owners — study from anywhere, then train on our Minnesota campus.",
      heroImageUrl: "/cms/hero-instructor.jpg",
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
      title: home.heroTitle,
      subtitle: home.heroSubtitle,
      imageUrl: home.heroImageUrl,
      ctaLabel: home.ctaPrimaryLabel,
      ctaHref: home.ctaPrimaryHref,
      dataJson: JSON.stringify({
        badge: home.heroBadge,
        secondaryCtaLabel: home.ctaSecondaryLabel,
        secondaryCtaHref: home.ctaSecondaryHref,
        checklist: [
          "Online Learning (Worldwide)",
          "Practical Training (Minnesota)",
          "License & Business Support",
        ],
        tiles: [
          {
            title: "Learn Online",
            body: "Flexible, self-paced training from anywhere in the world.",
            icon: "globe",
          },
          {
            title: "Train in Minnesota",
            body: "Get hands-on, real-world instructor experience.",
            icon: "map",
          },
          {
            title: "Get Licensed",
            body: "Meet state requirements with expert support.",
            icon: "badge",
          },
          {
            title: "Start Your Own School",
            body: "Get the tools, guidance, and business resources to launch.",
            icon: "building",
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
        "From certification coursework to license prep and school launch — structured pathways for every stage of your instructor career.",
      sortOrder: 1,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "trusted",
      title: "A Trusted Global Leader in Instructor Training",
      body: "Under Owner John Addo, Life Star Driving School has built a worldwide academy that pairs rigorous online study with Minnesota campus practicals — so graduates can teach, license, and open schools with confidence.",
      ctaLabel: "Apply Today",
      ctaHref: "/signup",
      imageUrl: "/cms/trusted-bg.jpg",
      dataJson: JSON.stringify({
        features: [
          {
            title: "Proven Expertise",
            body: "Years of experience in driver education and instructor preparation.",
            icon: "shield",
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
            icon: "rocket",
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
      subtitle: "Instructors who trained with Life Star and built careers — and schools — of their own.",
      sortOrder: 4,
    },
  });

  await prisma.cmsSection.create({
    data: {
      pageId: home.id,
      key: "cta",
      title: "Ready to Start Your Journey?",
      subtitle:
        "Apply today to join Life Star Instructors Academy — online learning worldwide, practical training in Minnesota.",
      imageUrl: "/cms/cta-road.jpg",
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
      title: "Driving Instructor Certification",
      blurb:
        "Complete online instructor coursework, practice exams, and application packet prep for commercial driving instructor credentials.",
      imageUrl: "/cms/program-cert.jpg",
      href: "/programs#certification",
      iconKey: "graduation",
      sortOrder: 0,
    },
    {
      title: "Instructor License Preparation",
      blurb:
        "Classroom and behind-the-wheel pathways with Minnesota campus practicals — including BTW ($7,000) and Classroom ($15,000) tuition options.",
      imageUrl: "/cms/program-license.jpg",
      href: "/programs#license",
      iconKey: "license",
      sortOrder: 1,
    },
    {
      title: "Driving School Business Launch",
      blurb:
        "Post-certification coaching to register and operate your own driving school — state/DMV operator packet readiness with Life Star guidance.",
      imageUrl: "/cms/program-business.jpg",
      href: "/programs#business",
      iconKey: "building",
      sortOrder: 2,
    },
  ];
  for (const p of programCards) {
    await prisma.cmsProgramCard.create({ data: p });
  }

  const stats = [
    { value: "5,000+", label: "Students Trained", iconKey: "users", sortOrder: 0 },
    { value: "98%", label: "Certification Success", iconKey: "badge", sortOrder: 1 },
    { value: "50+", label: "Countries", iconKey: "globe", sortOrder: 2 },
    { value: "1", label: "Minnesota Campus", iconKey: "map", sortOrder: 3 },
  ];
  for (const s of stats) {
    await prisma.cmsStat.create({ data: s });
  }

  const testimonials = [
    {
      quote:
        "Life Star’s online track let me study from abroad, then the Minnesota practicals made licensing feel achievable. I now teach full time.",
      name: "Marcus Okonkwo",
      title: "Certified Driving Instructor",
      photoUrl: "/cms/testimonial-1.jpg",
      stars: 5,
      sortOrder: 0,
    },
    {
      quote:
        "The business launch coaching was the missing piece. After certification I opened my own school with a clear DMV packet plan.",
      name: "Sofia Ramirez",
      title: "School Owner · Graduate",
      photoUrl: "/cms/testimonial-2.jpg",
      stars: 5,
      sortOrder: 1,
    },
    {
      quote:
        "Professional curriculum, real campus training, and support that treats international students as first-class candidates.",
      name: "James Chen",
      title: "Instructor Academy Alumnus",
      photoUrl: "/cms/testimonial-3.jpg",
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
      title: "Programs",
      metaDescription: "Life Star instructor certification, license preparation, and school business launch programs.",
      heroBadge: "Training pathways",
      heroTitle: "Programs built for instructors and school founders",
      heroSubtitle:
        "Choose certification, license preparation with Minnesota practicals, or post-graduate school-launch coaching — tuition preferences for BTW ($7,000) and Classroom ($15,000) remain unchanged.",
      bodyMarkdown: `## Driving Instructor Certification
Online lessons, practice exams, and application packet preparation modeled on Minnesota instructor requirements.

## Instructor License Preparation
Campus intensives at Life Star’s Minnesota main campus. Classroom sessions and behind-the-wheel / laboratory training with published payment plans (50% down).

## Driving School Business Launch
After certification, graduates worldwide can plan registration and operator licensing for their own driving school with Life Star coaching.`,
      ctaPrimaryLabel: "Apply Now",
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
      bodyMarkdown: `## Steps
1. Create your candidate account
2. Upload your government-issued driver’s license for verification
3. Select an enrollment level and purchase lessons or packages
4. Complete practice exams and your application packet
5. Schedule Minnesota campus practicals when ready

## Advisor support
Speak with admissions about timelines, tuition plans, and campus visits.`,
      ctaPrimaryLabel: "Apply Now",
      ctaPrimaryHref: "/signup",
      ctaSecondaryLabel: "Log in",
      ctaSecondaryHref: "/login",
      sortOrder: 2,
    },
    {
      slug: "students",
      title: "Students",
      metaDescription: "Candidate dashboard, student ID, certificates, and school-launch tools.",
      heroBadge: "Student portal",
      heroTitle: "Everything you need after you enroll",
      heroSubtitle:
        "Access learning, quizzes, practicum booking, your Life Star student identity card, digital certificate, and school-launch coaching from one secure portal.",
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
      ctaSecondaryLabel: "Log in",
      ctaSecondaryHref: "/login",
      sortOrder: 3,
    },
    {
      slug: "resources",
      title: "Resources",
      metaDescription: "Policies, guides, and Life Star academy resources.",
      heroBadge: "Resources",
      heroTitle: "Guides, policies, and support",
      heroSubtitle: "Find program resources, contact details, and academy policies.",
      bodyMarkdown: `## Support
Email academy@lifestardrivingschool.example or call (651) 555-0147.

<a id="privacy"></a>
## Privacy Policy
Life Star protects candidate account data, private uploads (licenses, ID photos), and payment records. Marketing analytics are limited to essential operations.

<a id="terms"></a>
## Terms of Use
Use of the Instructor Academy portal is for enrolled candidates and authorized staff. Content and certificates remain Life Star intellectual property.

<a id="refund"></a>
## Refund Policy
Tuition and payment-plan refunds follow the terms stated at purchase. Contact admissions for case-by-case review of campus practical credits.`,
      ctaPrimaryLabel: "Contact admissions",
      ctaPrimaryHref: "/admissions",
      ctaSecondaryLabel: "Pricing",
      ctaSecondaryHref: "/pricing",
      sortOrder: 4,
    },
    {
      slug: "about",
      title: "About",
      metaDescription: "About Life Star Driving School and Owner John Addo.",
      heroBadge: "About Life Star",
      heroTitle: "Life Star Driving School · Instructors Academy",
      heroSubtitle:
        "Founded and led by Owner John Addo, Life Star prepares commercial driving instructors worldwide with online study and Minnesota campus practical training.",
      bodyMarkdown: `## Our mission
Train confident, licensed instructors who can teach safely — and who can return home to operate their own driving schools.

## Minnesota campus
Laboratory and behind-the-wheel competencies are delivered at our Minnesota main campus under applicable state rules.

## Leadership
**John Addo**, Owner of Life Star Driving School, stewards the academy’s worldwide student experience and campus standards.`,
      ctaPrimaryLabel: "Explore programs",
      ctaPrimaryHref: "/programs",
      ctaSecondaryLabel: "Apply Now",
      ctaSecondaryHref: "/signup",
      sortOrder: 5,
    },
  ];

  for (const page of innerPages) {
    await prisma.cmsPage.create({ data: page });
  }

  console.log("CMS marketing defaults seeded.");
}
