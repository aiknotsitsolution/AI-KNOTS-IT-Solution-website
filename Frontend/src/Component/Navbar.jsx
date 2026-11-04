
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import ATLAknots from "../../src/assets/Images/logoimage5.webp";
import ATLAknots2 from "../../src/assets/Images/ITLogo.webp";

import { useTheme } from "../context/ThemeContext.jsx";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Recent Work", path: "/recentwork" },
  {
    name: "Service",
    path: "/software",
    hasDropdown: true,
    dropdownItems: [
      {
        name: "Design",
        path: "/graphics",
        hasDropdown: true,
        dropdownItems: [
          { name: "UI/UX Design", path: "/uidesign" },
          { name: "Web Design & Development", path: "/websitedesigndevelopment" },
          { name: "Branding", path: "/contentwritingbranding" },
        ],
      },
      {
        name: "Development",
        path: "/software",
        hasDropdown: true,
        dropdownItems: [
          { name: "Software development", path: "/software" },
          { name: "Mobile App development", path: "/mobiledevelopment" },
          { name: "E-commerce", path: "/ecommercedevelopment" },
          { name: "Custom ERP Software", path: "/erpdevelopment" },
          { name: "Cloud Services", path: "/cloudsolutions" },
          { name: "AI & Machine Learning", path: "/ai-mlservice" },
        ],
      },
      {
        name: "Digital Marketing",
        path: "/digital-marketing",
        hasDropdown: true,
        dropdownItems: [
          { name: "SEO Services", path: "/seo" },
          { name: "Social Media Marketing", path: "/socialmediamarketing" },
          { name: "Paid Advertisement", path: "/paidadv" },
          { name: "Graphic design", path: "/graphicdesign" },
          { name: "Local Marketing", path: "/localmarketing" },
        ],
      },
    ],
  },
  { name: "Blog", path: "/blog" },
  { name: "AI Technology", path: "/technology" },
  { name: "Tech News", path: "/technews" },
  {
    name: "Contact",
    path: "/contact",
    hasDropdown: true,
    dropdownItems: [
      { name: "Careers", path: "/careers" },
      { name: "Gallery", path: "/gallery" },
    ],
  },
];

export default function Navbar()
{
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);

  const { isDark, toggleTheme } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeAll = () =>
  {
    setIsOpen(false);
    setOpenDropdown(null);
    setOpenSubDropdown(null);
  };

  return (
    <nav
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${isDark
          ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.08]"
          : "bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
          <NavLink to="/" onClick={closeAll} className="flex-shrink-0">
            <img
              src={isDark ? ATLAknots : ATLAknots2}
              alt="AI Knots IT Solution logo"
              className="h-10 md:h-14 lg:h-18 w-auto object-contain"
            />
          </NavLink>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-3 py-2 flex items-center gap-1.5 font-medium tracking-wide transition-colors duration-200 rounded-lg
                    ${isActive
                      ? isDark
                        ? "text-[#C9A87C]"
                        : "text-[#8B6B4A]"
                      : isDark
                        ? "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                    }`
                  }
                  onClick={closeAll}
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      {item.hasDropdown && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ml-0.5 ${openDropdown === item.name ? "rotate-180" : ""}`}
                        />
                      )}
                      {isActive && (
                        <span className={`absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full ${isDark ? "bg-[#8B6B4A]" : "bg-[#8B6B4A]"}`} />
                      )}
                    </>
                  )}
                </NavLink>

                {/* First Level Dropdown */}
                {item.hasDropdown && (
                  <div
                    className={`
                      absolute left-0 top-full pt-2.5 w-55 z-50
                      transition-all duration-200 ease-out
                      ${openDropdown === item.name
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-1 pointer-events-none"
                      }
                    `}
                  >
                    <div
                      className={`
                        rounded-xl border
                        ${isDark
                          ? "bg-zinc-950/95 backdrop-blur-xl border-white/[0.08] shadow-2xl shadow-black/40"
                          : "bg-white/95 backdrop-blur-xl border-gray-200/80 shadow-xl shadow-black/[0.06]"
                        }
                      `}
                    >
                      <div className="py-1.5">
                        {item.dropdownItems.map((sub) => (
                          <div
                            key={sub.name}
                            className="relative"
                            onMouseEnter={() => setOpenSubDropdown(sub.name)}
                            onMouseLeave={() => setOpenSubDropdown(null)}
                          >
                            <NavLink
                              to={sub.path}
                              className={`
                                flex justify-between items-center px-4 py-2.5 rounded-lg mx-1.5 font-medium transition-all duration-150
                                ${isDark
                                  ? "text-gray-300 hover:bg-white/[0.06] hover:text-white"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }
                              `}
                              onClick={closeAll}
                            >
                              {sub.name}
                              {sub.hasDropdown && (
                                <ChevronDown
                                  size={13}
                                  className={`transition-transform duration-150 ${openSubDropdown === sub.name ? "-rotate-90" : ""}`}
                                />
                              )}
                            </NavLink>

                            {/* Second Level Dropdown */}
                            {sub.hasDropdown && (
                              <div
                                className={`
                                  absolute left-full top-0 pl-2.5 w-66 z-50
                                  transition-all duration-200 ease-out
                                  ${openSubDropdown === sub.name
                                    ? "opacity-100 translate-x-0 pointer-events-auto"
                                    : "opacity-0 -translate-x-1 pointer-events-none"
                                  }
                                `}
                              >
                                <div
                                  className={`
                                    rounded-xl border
                                    ${isDark
                                      ? "bg-zinc-950/95 backdrop-blur-xl border-white/[0.08] shadow-2xl shadow-black/40"
                                      : "bg-white/95 backdrop-blur-xl border-gray-200/80 shadow-xl shadow-black/[0.06]"
                                    }
                                  `}
                                >
                                  <div className="py-1.5">
                                    {sub.dropdownItems.map((child) => (
                                      <NavLink
                                        key={child.path}
                                        to={child.path}
                                        onClick={closeAll}
                                        className={`
                                          block px-4 py-2.5 rounded-lg mx-1.5 font-medium transition-all duration-150
                                          ${isDark
                                            ? "text-gray-300 hover:bg-white/[0.06] hover:text-white"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                          }
                                        `}
                                      >
                                        {child.name}
                                      </NavLink>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200
                ${isDark
                  ? "text-gray-300 hover:bg-white/[0.08] hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              `}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={`
                md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200
                ${isDark
                  ? "text-gray-300 hover:bg-white/[0.08]"
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}
          ${isDark
            ? "bg-black/95 backdrop-blur-xl border-t border-white/[0.06]"
            : "bg-white/95 backdrop-blur-xl border-t border-gray-200/60"
          }
        `}
      >
        <div className="px-4 py-3 space-y-0.5">
          {navItems.map((item) => (
            <div key={item.name}>
              <div
                className={`
                  flex items-center rounded-xl transition-all duration-200
                  ${isDark ? "hover:bg-white/[0.05]" : "hover:bg-gray-50"}
                `}
              >
                <NavLink
                  to={item.path}
                  onClick={(e) =>
                  {
                    if (item.hasDropdown) e.preventDefault();
                    else closeAll();
                  }}
                  className={`
                    py-3 px-3 flex-1 font-medium
                    ${isDark ? "text-gray-200" : "text-gray-700"}
                  `}
                >
                  {item.name}
                </NavLink>

                {item.hasDropdown && (
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                    className="p-3"
                  >
                    <ChevronDown
                      size={16}
                      className={`
                        transition-transform duration-200
                        ${openDropdown === item.name ? "rotate-180" : ""}
                        ${isDark ? "text-gray-500" : "text-gray-400"}
                      `}
                    />
                  </button>
                )}
              </div>

              {/* Mobile Dropdown */}
              {item.hasDropdown && openDropdown === item.name && (
                <div className={`
                  ml-3 pl-3 border-l-2 mt-1 mb-2
                  ${isDark ? "border-white/10" : "border-gray-200"}
                `}>
                  {item.dropdownItems.map((sub) => (
                    <div key={sub.name}>
                      <div className="flex items-center">
                        <NavLink
                          to={sub.path}
                          onClick={(e) =>
                          {
                            if (sub.hasDropdown) e.preventDefault();
                            else closeAll();
                          }}
                          className={`
                            py-2.5 px-2 flex-1 font-medium rounded-lg transition-colors
                            ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}
                          `}
                        >
                          {sub.name}
                        </NavLink>

                        {sub.hasDropdown && (
                          <button
                            onClick={() => setOpenSubDropdown(openSubDropdown === sub.name ? null : sub.name)}
                            className="p-2.5"
                          >
                            <ChevronDown
                              size={14}
                              className={`
                                transition-transform duration-200
                                ${openSubDropdown === sub.name ? "rotate-180" : ""}
                                ${isDark ? "text-gray-600" : "text-gray-400"}
                              `}
                            />
                          </button>
                        )}
                      </div>

                      {sub.hasDropdown && openSubDropdown === sub.name && (
                        <div className={`
                          ml-3 pl-3 border-l-2 mt-0.5 mb-1
                          ${isDark ? "border-white/[0.06]" : "border-gray-100"}
                        `}>
                          {sub.dropdownItems.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={closeAll}
                              className={`
                                block py-2 px-2 font-medium rounded-lg transition-colors
                                ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}
                              `}
                            >
                              {child.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile Get Started CTA */}
          <div className="pt-2 pb-1">
            <NavLink
              to="/contact"
              onClick={closeAll}
              className={`
                block text-center py-3 rounded-xl font-semibold transition-all duration-200
                ${isDark
                  ? "bg-[#8B6B4A] text-white hover:bg-[#A07D5A]"
                  : "bg-[#3D220E] text-white hover:bg-[#5A351A]"
                }
              `}
            >
              Get Started
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
