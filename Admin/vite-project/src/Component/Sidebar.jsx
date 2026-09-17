import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Contact2,
  TextSearch,
  LogOut,
  Menu,
  X,
  GalleryHorizontal,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

// ────────────────────────────────────────────────
const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

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
      { path: "/admin/jobs/applications", label: "Job Applications", icon: BarChart3 },
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

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(true);
  const [newsOpen, setNewsOpen] = useState(true);

  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen((p) => !p);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    console.log("User logged out");
    localStorage.removeItem("token");
    localStorage.clear();
    navigate("/", { replace: true });
    closeSidebar();
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        aria-label="Toggle sidebar"
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-lg bg-gray-800/90 backdrop-blur-sm text-white shadow-md hover:bg-gray-700 transition-colors"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

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
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="p-6 border-b border-gray-800/60">
            <h1 className="text-2xl font-bold tracking-tight">
              AI Knots<span className="text-blue-500 ml-1.5">Admin</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Management Panel</p>
          </div>

          {/* Navigation with Beautiful Scrollbar */}
          <nav className="flex-1 px-3 py-5 overflow-y-auto custom-scrollbar">
            <div className="space-y-1.5 pr-2">
              {navItems.map((item, index) => {
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
                          "text-gray-300 hover:bg-gray-800/60 hover:text-gray-100"
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
                                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
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
                        item.bottom ? "mt-6" : ""
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

          {/* Logout Section */}
          <div className="mt-auto border-t border-gray-800/60 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
            >
              <LogOut size={20} strokeWidth={2.1} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}