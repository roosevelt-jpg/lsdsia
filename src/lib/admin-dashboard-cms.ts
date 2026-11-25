export type AdminDashboardCopy = {
  metrics: {
    studentsLabel: string;
    studentsHint: string;
    coursesLabel: string;
    coursesHint: string;
    instructorsLabel: string;
    instructorsHint: string;
    pendingLabel: string;
    pendingHint: string;
    revenueLabel: string;
    revenueHint: string;
  };
  charts: {
    trendTitle: string;
    trendSubtitle: string;
    trendRangeLabel: string;
    progressTitle: string;
    progressSubtitle: string;
    coursesTitle: string;
    coursesSubtitle: string;
  };
  applications: {
    title: string;
    subtitle: string;
    viewAllLabel: string;
    viewAllHref: string;
    programFilterLabel: string;
    statusFilterLabel: string;
  };
  quickActions: {
    title: string;
    items: { label: string; href: string }[];
  };
  notifications: {
    title: string;
    viewAllLabel: string;
    viewAllHref: string;
    items: { title: string; detail: string; time: string; tone: "amber" | "green" | "blue" }[];
  };
  sessions: {
    title: string;
    viewAllLabel: string;
    viewAllHref: string;
  };
};

export const DEFAULT_ADMIN_DASHBOARD: AdminDashboardCopy = {
  metrics: {
    studentsLabel: "Total Students",
    studentsHint: "+12% this month",
    coursesLabel: "Active Courses",
    coursesHint: "+4 new",
    instructorsLabel: "Instructors",
    instructorsHint: "+2 this month",
    pendingLabel: "Pending Applications",
    pendingHint: "Needs Review",
    revenueLabel: "Total Revenue",
    revenueHint: "+18% vs. last month",
  },
  charts: {
    trendTitle: "Enrollment Trend",
    trendSubtitle: "Students over the last 6 months",
    trendRangeLabel: "Last 6 Months",
    progressTitle: "Student Progress",
    progressSubtitle: "Lesson completion mix",
    coursesTitle: "Course Enrollment",
    coursesSubtitle: "By program level",
  },
  applications: {
    title: "Recent Applications",
    subtitle: "License reviews and new candidate intakes",
    viewAllLabel: "View All",
    viewAllHref: "/admin/licenses",
    programFilterLabel: "All Programs",
    statusFilterLabel: "All Statuses",
  },
  quickActions: {
    title: "Quick Actions",
    items: [
      { label: "Add New Student", href: "/admin/candidates" },
      { label: "Create Course", href: "/admin/content" },
      { label: "Schedule Class", href: "/admin/practicum" },
      { label: "Record Payment", href: "/admin/orders" },
      { label: "Generate Report", href: "/admin#reports" },
      { label: "Send Announcement", href: "/admin/website" },
    ],
  },
  notifications: {
    title: "Notifications",
    viewAllLabel: "View All",
    viewAllHref: "/admin/licenses",
    items: [
      {
        title: "New application received",
        detail: "John Miller applied for Instructor Training.",
        time: "2 min ago",
        tone: "amber",
      },
      {
        title: "Payment confirmed",
        detail: "$1,250 from Sarah Williams.",
        time: "15 min ago",
        tone: "green",
      },
      {
        title: "Class reminder",
        detail: "Practical Training – Group B tomorrow at 9:00 AM.",
        time: "1 hr ago",
        tone: "blue",
      },
      {
        title: "Certificate issued",
        detail: "Mark Davis completed Instructor Training.",
        time: "3 hrs ago",
        tone: "blue",
      },
    ],
  },
  sessions: {
    title: "Upcoming Sessions",
    viewAllLabel: "View Calendar",
    viewAllHref: "/admin/practicum",
  },
};

export function parseAdminDashboardCopy(raw: string | null | undefined): AdminDashboardCopy {
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<AdminDashboardCopy>) : {};
    return {
      metrics: { ...DEFAULT_ADMIN_DASHBOARD.metrics, ...(parsed.metrics || {}) },
      charts: { ...DEFAULT_ADMIN_DASHBOARD.charts, ...(parsed.charts || {}) },
      applications: { ...DEFAULT_ADMIN_DASHBOARD.applications, ...(parsed.applications || {}) },
      quickActions: {
        title: parsed.quickActions?.title || DEFAULT_ADMIN_DASHBOARD.quickActions.title,
        items:
          parsed.quickActions?.items?.length
            ? parsed.quickActions.items
            : DEFAULT_ADMIN_DASHBOARD.quickActions.items,
      },
      notifications: {
        title: parsed.notifications?.title || DEFAULT_ADMIN_DASHBOARD.notifications.title,
        viewAllLabel:
          parsed.notifications?.viewAllLabel || DEFAULT_ADMIN_DASHBOARD.notifications.viewAllLabel,
        viewAllHref:
          parsed.notifications?.viewAllHref || DEFAULT_ADMIN_DASHBOARD.notifications.viewAllHref,
        items:
          parsed.notifications?.items?.length
            ? parsed.notifications.items
            : DEFAULT_ADMIN_DASHBOARD.notifications.items,
      },
      sessions: { ...DEFAULT_ADMIN_DASHBOARD.sessions, ...(parsed.sessions || {}) },
    };
  } catch {
    return DEFAULT_ADMIN_DASHBOARD;
  }
}
