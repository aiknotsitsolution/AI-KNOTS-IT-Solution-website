import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Contact2,
  TextSearch,
  LogOut,
  KeyRound,
  GalleryHorizontal,
  UserRound,
  UsersRound,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import brandMark from "../assets/brand-mark.webp";
import { setCurrentUser } from "../Pages/auth/authSlice";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";

// ────────────────────────────────────────────────
const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    path: "/users",
    label: "Users & access",
    icon: UsersRound,
    adminOnly: true,
  },
  {
    path: "/register",
    label: "Register user",
    icon: UserPlus,
    adminOnly: true,
  },

  {
    label: "Blogview",
    icon: BarChart3,
    children: [
      { path: "/homepage", label: "CreateBlog", icon: LayoutDashboard },
      { path: "/blogcategory", label: "Blog Category", icon: BarChart3 },
      { path: "/getpost", label: "Show Blog", icon: LayoutDashboard },
    ],
  },

  {
    label: "Technology",
    icon: BarChart3,
    children: [
      { path: "/techcategory", label: "Tech Category", icon: BarChart3 },
      { path: "/adminproducts", label: "Manage Tech", icon: TextSearch },
      { path: "/technology", label: "All Technologies", icon: BarChart3 },
    ],
  },

  {
    label: "Jobs",
    icon: BarChart3,
    children: [
      { path: "/admin/jobs/new", label: "New Job", icon: BarChart3 },
      { path: "/admin/jobs", label: "Manage Jobs", icon: BarChart3 },
      { path: "/admin/jobs/category", label: "Job Category", icon: BarChart3 },
      {
        path: "/admin/jobs/applications",
        label: "Job Applications",
        icon: BarChart3,
      },
    ],
  },

  {
    label: "TechNews",
    icon: BarChart3,
    children: [
      { path: "/techcreate", label: "Create Tech", icon: TextSearch },
      { path: "/category", label: "Category", icon: BarChart3 },
    ],
  },

  {
    label: "Portfolio",
    icon: BarChart3,
    children: [
      { path: "/portfolio", label: "portfolio", icon: TextSearch },
      {
        path: "portfoliocategory",
        label: " portfolio Category",
        icon: BarChart3,
      },
    ],
  },

  {
    label: "Recent Work",
    icon: BarChart3,
    children: [
      { path: "/recentwork", label: "Recent Work", icon: TextSearch },
      {
        path: "/recentworkcategory",
        label: "Recent Work Category",
        icon: BarChart3,
      },
    ],
  },

  { path: "/gallery", label: "Gallery", icon: GalleryHorizontal },

  {
    label: "Contact",
    icon: BarChart3,
    children: [
      { path: "/contact", label: "Contact", icon: Contact2 },
      { path: "/queries", label: "Queries", icon: TextSearch, bottom: true },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const [techOpen, setTechOpen] = useState(true);
  const [newsOpen, setNewsOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const controller = new AbortController();
    const loadCurrentProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `******"token") || ""}` },
          signal: controller.signal,
        });
        const profile = response.data?.data;
        if (!profile?.id) {
          throw new Error("The current profile response is incomplete.");
        }

        const storedUser = JSON.parse(
          localStorage.getItem("authUser") || "null",
        );
        const updatedUser = { ...storedUser, ...profile };
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
        dispatch(setCurrentUser(profile));
      } catch (error) {
        if (error.code !== "ERR_CANCELED") {
          console.error(
            "Failed to load account profile for the sidebar:",
            error,
          );
        }
      }
    };

    loadCurrentProfile();
    return () => controller.abort();
  }, [dispatch]);

  const closeSidebar = () => onClose();
  const closeAccountMenu = () => setAccountMenuOpen(false);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        closeAccountMenu();
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [accountMenuOpen]);

  const handleLogout = () => {
    console.log("User logged out");
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    navigate("/login", { replace: true });
    closeSidebar();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:relative lg:block",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="border-b border-white/10 px-5 py-5">
            <Link
              to="/dashboard"
              onClick={closeSidebar}
              className="flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <span className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-100/15 bg-black shadow-lg shadow-black/20">
                <img
                  src={brandMark}
                  alt="AI Knots logo"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold tracking-tight text-white">
                  AI Knots
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  Admin panel
                </span>
              </span>
            </Link>
          </div>

          {/* Navigation with Beautiful Scrollbar */}
          <nav className="flex-1 px-3 py-5 overflow-y-auto custom-scrollbar">
            <div className="space-y-1.5 pr-2">
              {navItems
                .filter(
                  (item) => !item.adminOnly || currentUser?.role === "admin",
                )
                .map((item, index) => {
                  if (item.children) {
                    const isTech = item.label === "Technology";
                    const isOpenState = isTech ? techOpen : newsOpen;
                    const toggle = isTech
                      ? () => setTechOpen((p) => !p)
                      : () => setNewsOpen((p) => !p);

                    return (
                      <div key={index}>
                        <button
                          type="button"
                          onClick={toggle}
                          className={clsx(
                            "group flex w-full items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                            "text-gray-300 hover:bg-gray-800/60 hover:text-gray-100",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              size={20}
                              strokeWidth={2.1}
                              className="shrink-0"
                            />
                            <span>{item.label}</span>
                          </div>
                          {isOpenState ? (
                            <ChevronDown
                              size={18}
                              className="transition-transform duration-200"
                            />
                          ) : (
                            <ChevronRight
                              size={18}
                              className="transition-transform duration-200"
                            />
                          )}
                        </button>

                        {isOpenState && (
                          <div className="ml-6 mt-1 space-y-1 border-l border-gray-800/50 pl-3">
                            {item.children.map((child) => (
                              <NavLink
                                key={child.path}
                                to={child.path}
                                onClick={closeSidebar}
                                className={({ isActive }) =>
                                  clsx(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                      ? "bg-gray-800/80 text-white"
                                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200",
                                  )
                                }
                              >
                                <child.icon
                                  size={18}
                                  strokeWidth={2}
                                  className="shrink-0"
                                />
                                <span>{child.label}</span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        clsx(
                          "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-gray-800/80 text-white shadow-sm"
                            : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100",
                          item.bottom ? "mt-6" : "",
                        )
                      }
                    >
                      <item.icon
                        size={20}
                        strokeWidth={2.1}
                        className="shrink-0"
                      />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
            </div>
          </nav>

          {/* Account menu */}
          <div
            ref={accountMenuRef}
            className="relative mt-auto border-t border-gray-800/60 p-4"
          >
            {accountMenuOpen && (
              <div
                id="sidebar-account-menu"
                className="absolute inset-x-4 bottom-full mb-3 overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-2 shadow-2xl shadow-black/30"
              >
                <NavLink
                  to="/profile"
                  onClick={() => {
                    closeAccountMenu();
                    closeSidebar();
                  }}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-indigo-500/15 text-indigo-200"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white",
                    )
                  }
                >
                  <UserRound size={18} />
                  <span>My profile</span>
                </NavLink>
                <Link
                  to="/profile#security"
                  onClick={() => {
                    closeAccountMenu();
                    closeSidebar();
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
                >
                  <KeyRound size={18} />
                  <span>Password update</span>
                </Link>
                <div className="my-1 border-t border-gray-800" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-red-950/40 hover:text-red-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
            <button
              type="button"
              aria-expanded={accountMenuOpen}
              aria-controls="sidebar-account-menu"
              aria-label="Open profile, password and logout menu"
              onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                accountMenuOpen
                  ? "bg-gray-800/80 text-white"
                  : "text-gray-300 hover:bg-gray-800/60 hover:text-white",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/20">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={`${currentUser.username || "Account"} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={18} strokeWidth={2} />
                )}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate">
                  {currentUser?.username || "Account"}
                </span>
                <span className="mt-0.5 block text-xs font-normal text-gray-500">
                  Profile & security
                </span>
              </span>
              <ChevronDown
                size={17}
                className={clsx(
                  "transition-transform",
                  accountMenuOpen && "rotate-180",
                )}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
