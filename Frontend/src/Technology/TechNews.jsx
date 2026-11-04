import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import {
  Newspaper,
  ExternalLink,
  Clock,
  Cpu,
  Zap,
  Globe,
  ArrowUp,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";

import {
  fetchTechNews,
  setSelectedCategory,
} from "./techNewsSlice/techNewsSlice.js";

const NEWS_PER_PAGE = 6;

const TechNews = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();

  const {
    items: newsItems,
    categories: newsCategories,
    pagination,
    selectedCategory,
    status,
    error,
  } = useSelector((state) => state.techNews);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchTechNews({
        page: currentPage,
        limit: NEWS_PER_PAGE,
        category: selectedCategory,
      }),
    );
  }, [currentPage, selectedCategory, dispatch]);

  // Scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = ["All", ...newsCategories];
  const totalPages = pagination.totalPages;
  const firstVisiblePage = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4),
  );
  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => firstVisiblePage + index,
  );
  const currentNews = newsItems;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getIconForCategory = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("ai") || cat.includes("artificial intelligence"))
      return <Cpu className="w-5 h-5" />;
    if (cat.includes("hardware")) return <Zap className="w-5 h-5" />;
    if (cat.includes("company") || cat.includes("update"))
      return <Cpu className="w-5 h-5" />;
    if (cat.includes("industry") || cat.includes("news"))
      return <Newspaper className="w-5 h-5" />;
    if (cat.includes("software") || cat.includes("developer"))
      return <Cpu className="w-5 h-5" />;
    return <Globe className="w-5 h-5" />;
  };

  // ====================== THEME CLASSES ======================
  const cardClass = isDark
    ? "bg-gray-900 border border-gray-800 hover:border-[#8B6B4A]/50 hover:shadow-xl hover:shadow-primary/20"
    : "bg-white border border-gray-200 shadow-lg hover:shadow-2xl";

  const headingClass = isDark ? "text-white" : "text-primary";
  const bodyClass = isDark ? "text-gray-300" : "text-primary-600";
  const accentClass = "text-accent";

  // Sanitize function
  const sanitize = (html) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "em",
        "strong",
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "a",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  };

  if (status === "loading") {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-700
        ${isDark ? "bg-gray-950 text-white" : "bg-[#FCFAF8] text-[#3D220E]"}`}
      >
        {/* ... loading UI unchanged ... */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-gray-300 border-[#8B6B4A] rounded-full animate-spin"></div>
          <div
            className="absolute inset-3 border-4 border-gray-300 border-[#8B6B4A] rounded-full animate-spin"
            style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
          ></div>
          <div
            className="absolute inset-6 border-4 border-gray-300 border-[#8B6B4A] rounded-full animate-spin"
            style={{ animationDuration: "2s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#8B6B4A] rounded-full animate-pulse shadow-lg"></div>
        </div>
        <div className="mt-8 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#EFE5C8] animate-pulse" />
          <p className={`text-lg ${bodyClass} animate-pulse`}>
            Loading latest tech news...
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-700
        ${isDark ? "bg-gray-950 text-white" : "bg-[#FCFAF8] text-[#3D220E]"}`}
      >
        <div className="text-xl text-[#8B6B4A]">
          {error || "Something went wrong"}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Latest Tech News India | Atla IKS</title>
        <meta
          name="description"
          content="Stay updated with latest technology news, AI updates, software trends & IT insights."
        />
        <meta
          name="keywords"
          content="Latest Tech News India	Technology Updates, IT News"
        />
      </Helmet>
      <div
        className={`min-h-screen p-6 md:p-10 relative transition-colors duration-700
      ${isDark ? "bg-gray-950 text-white" : "bg-[#FCFAF8] text-[#3D220E]"}`}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Newspaper
                className={`w-10 h-10 ${accentClass}`}
                strokeWidth={2.5}
              />
              <h1
                className={`text-4xl md:text-5xl font-bold tracking-tight ${headingClass}`}
              >
                Tech<span className={accentClass}>News</span>
              </h1>
            </div>
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  if (selectedCategory === category) return;
                  setCurrentPage(1);
                  dispatch(setSelectedCategory(category));
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-[#8B6B4A] text-white shadow-lg shadow-[#8B6B4A]/40"
                    : isDark
                      ? "bg-gray-900 text-gray-300 hover:bg-[#3D2A1E] hover:text-[#D9C5B5] border border-gray-700 hover:border-[#8B6B4A]/50"
                      : "bg-white text-[#8B6B4A] hover:bg-[#F5EDE4] border border-gray-300 hover:border-[#8B6B4A] hover:text-[#3D220E]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentNews.map((item) => (
              <div
                key={item.id}
                className={`group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${cardClass}`}
              >
                <div
                  className={`p-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isDark ? "bg-[#3D220E]/40 text-[#D9C5B5]" : "bg-[#F5EDE4] text-[#8B6B4A]"}`}
                      >
                        {getIconForCategory(item.category)}
                      </div>
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${accentClass}`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs ${bodyClass}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {item.date}
                    </div>
                  </div>
                </div>

                {item.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-6">
                  <h2
                    className={`text-xl font-bold mb-3 group-hover:text-accent transition-colors ${headingClass}`}
                  >
                    {item.title}
                  </h2>

                  {/* Safely render description as HTML */}
                  <div
                    className={`text-sm leading-relaxed mb-6 line-clamp-3 ${bodyClass}`}
                    dangerouslySetInnerHTML={{
                      __html: sanitize(item.description || ""),
                    }}
                  />

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-sm transition-colors text-[#8B6B4A] hover:text-[#3D220E]"
                  >
                    Read more
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-10">
              <nav
                className="flex items-center gap-2"
                aria-label="News pagination"
              >
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    currentPage === 1
                      ? isDark
                        ? "bg-gray-800 text-gray-500 border-gray-800 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                      : isDark
                        ? "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800"
                        : "bg-white text-[#8B6B4A] border-gray-300 hover:bg-[#F5EDE4]"
                  }`}
                >
                  Previous
                </button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`min-w-10 h-10 px-3 rounded-lg text-sm font-medium transition-all border ${
                      page === currentPage
                        ? "bg-[#8B6B4A] text-white border-[#8B6B4A] shadow-lg shadow-[#8B6B4A]/30"
                        : isDark
                          ? "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800"
                          : "bg-white text-[#8B6B4A] border-gray-300 hover:bg-[#F5EDE4]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    currentPage === totalPages
                      ? isDark
                        ? "bg-gray-800 text-gray-500 border-gray-800 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                      : isDark
                        ? "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800"
                        : "bg-white text-[#8B6B4A] border-gray-300 hover:bg-[#F5EDE4]"
                  }`}
                >
                  Next
                </button>
              </nav>

              <p className={`text-sm ${bodyClass}`}>
                Page {currentPage} of {totalPages} - {pagination.total} news
                items
              </p>
            </div>
          )}

          {pagination.total === 0 && (
            <div className={`text-center text-lg mt-12 ${bodyClass}`}>
              No news found in this category.
            </div>
          )}
        </div>

        {/* Scroll to Top Button */}
      </div>
    </>
  );
};

export default TechNews;
