import {
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const pageTitles = [
  { path: "/admin/jobs/applications", title: "Job applications" },
  { path: "/admin/jobs/category", title: "Job categories" },
  { path: "/admin/jobs/edit", title: "Edit job" },
  { path: "/admin/jobs/new", title: "Create a job" },
  { path: "/admin/jobs", title: "Job management" },
  { path: "/recentworkcategory", title: "Recent work categories" },
  { path: "/recentwork", title: "Recent work" },
  { path: "/portfoliocategory", title: "Portfolio categories" },
  { path: "/portfolio", title: "Portfolio" },
  { path: "/adminproducts", title: "Manage technology" },
  { path: "/techcategory", title: "Technology categories" },
  { path: "/technology", title: "All technologies" },
  { path: "/techcreate", title: "Tech news" },
  { path: "/blogcategory", title: "Blog categories" },
  { path: "/homepage", title: "Create blog" },
  { path: "/getpost", title: "Manage blogs" },
  { path: "/category", title: "Tech news categories" },
  { path: "/contact", title: "Contact messages" },
  { path: "/queries", title: "Queries" },
  { path: "/gallery", title: "Gallery" },
  { path: "/profile", title: "My profile" },
  { path: "/users", title: "Users & access" },
  { path: "/register", title: "Register user" },
  { path: "/dashboard", title: "Dashboard" },
];

export default function Navbar({ isSidebarOpen, onToggleSidebar }) {
  const { pathname } = useLocation();
  const activePage = pageTitles.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const title = activePage?.title || "Admin workspace";
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-h-12 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isSidebarOpen}
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
          >
            {isSidebarOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <LayoutDashboard size={19} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <span className="hidden sm:inline">Workspace</span>
              <ChevronRight size={13} className="hidden sm:block" />
              <span className="truncate text-slate-500">{title}</span>
            </div>
            <h1 className="truncate text-base font-semibold leading-5 text-slate-900 sm:text-lg">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-medium text-slate-600 md:flex">
            <CalendarDays size={16} className="text-slate-400" />
            <span>{today}</span>
          </div>
          <Link
            to="/profile"
            aria-label="Open admin profile"
            title="Admin profile"
            className="group flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:px-3"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <UserRound size={15} strokeWidth={2.2} />
            </span>
            <span className="hidden text-sm font-semibold sm:inline">
              Account
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
