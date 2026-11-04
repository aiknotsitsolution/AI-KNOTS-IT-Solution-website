import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import Chatbot from "../Component/Chatbot/Chatbot"; // ← New Import
import { useTheme } from "../context/ThemeContext";
import Canonical from "./common/Canonical";

const Layout = () => {
  const { isDark } = useTheme();

  return (
    <>
      <Canonical />
      <div
        className={`min-h-screen w-full flex flex-col antialiased ${isDark ? "bg-black text-white" : "bg-white text-gray-900"}`}
      >
        {/* Navbar */}
        <header
          className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b ${isDark ? "bg-black/80 border-zinc-800/70" : "bg-white/80 border-gray-200/70"}`}
        >
          <Navbar />
        </header>


        <main className="flex-grow w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <footer
          className={`w-full border-t ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-gray-50 border-gray-200"}`}
        >
          <Footer />
        </footer>

        {/* Global Chatbot - Always visible on every page */}
        <Chatbot />
      </div>
    </>
  );
};

export default Layout;
