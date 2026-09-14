import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";

import ATLAknotsDark from "../../src/assets/Images/logoimage5.webp";
import ATLAknotsLight from "../../src/assets/Images/ITLogo.webp";
import { useTheme } from "../context/ThemeContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faPinterestP,
} from "@fortawesome/free-brands-svg-icons";

// Social Link Component
const SocialLink = ({ href, icon, label, isDark }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.15, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className={`p-3 rounded-2xl flex items-center justify-center transition-all duration-300 ${
        isDark
          ? "bg-zinc-900 hover:bg-[#3D220E]/60 border border-zinc-700 hover:border-[#8B6B4A] text-white"
          : "bg-white hover:bg-[#F5EDE4] border border-gray-200 hover:border-[#8B6B4A] text-gray-700"
      }`}
      title={label}
    >
      <div className="text-xl">{icon}</div>
    </motion.a>
  );
};

const Footer = () => {
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const handleFooterLink = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 10);
    }
  };

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/service" },
    { name: "Recent Work", path: "/recentwork" },
    { name: "Contact", path: "/contact" },
  ];

  const services = [
    {
      category: "Digital Marketing",
      items: [
        { name: "SEO Services", path: "/seo" },
        { name: "Social Media Marketing", path: "/socialmediamarketing" },
        { name: "Paid Advertisement", path: "/paidadv" },
        { name: "Graphic Design", path: "/graphics" },
        { name: "Local Marketing", path: "/localmarketing" },
      ],
    },
    {
      category: "Development",
      items: [
        { name: "Software Development", path: "/software" },
        { name: "Mobile App Development", path: "/mobiledevelopment" },
        { name: "E-commerce Development", path: "/ecommercedevelopment" },
        { name: "Custom ERP Software", path: "/erpdevelopment" },
        { name: "Cloud Solutions", path: "/cloudsolutions" },
        { name: "AI & Machine Learning", path: "/ai-mlservice" },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "AI Knots IT Solution",
            address: {
              "@type": "PostalAddress",
              streetAddress:
                "103, Goyal Vihar, Plot No 31-C, Zone 2, M.P. Nagar",
              addressLocality: "Bhopal",
              addressRegion: "Madhya Pradesh",
              postalCode: "462011",
              addressCountry: "IN",
            },
            telephone: "+91-78696-36070",
            email: "support@aiknotsit.com",
          })}
        </script>
      </Helmet>
      <footer
        className={`border-t text-gray-400 ${
          isDark
            ? "bg-gradient-to-b from-black to-zinc-950 border-[#8B6B4A]/30"
            : "bg-gradient-to-b from-gray-50 to-white border-gray-200"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <img
                src={isDark ? ATLAknotsDark : ATLAknotsLight}
                alt="ATLA Knots Logo"
                className="h-12 w-[200px] md:h-16 md:w-[260px] lg:h-20 lg:w-[320px] mt-2 object-contain"
                onError={(e) => (e.target.style.display = "none")}
              />

              {/* Social Icons - Better Position & Smaller */}
              <div className="flex gap-3 mt-10">
                <SocialLink
                  href="https://www.facebook.com/aiknotsitsolution"
                  icon={<FontAwesomeIcon icon={faFacebookF} size={16} />}
                  label="Facebook"
                  isDark={isDark}
                />

                <SocialLink
                  href="https://www.instagram.com/aiknotsitsolution/"
                  icon={<FontAwesomeIcon icon={faInstagram} size={16} />}
                  label="Instagram"
                  isDark={isDark}
                />

                <SocialLink
                  href="https://www.linkedin.com/company/ai-knots-it/?viewAsMember=true"
                  icon={<FontAwesomeIcon icon={faLinkedinIn} size={16} />}
                  label="LinkedIn"
                  isDark={isDark}
                />

                <SocialLink
                  href="https://in.pinterest.com/aiknotsitsolution/"
                  icon={<FontAwesomeIcon icon={faPinterestP} size={16} />}
                  label="Pinterest"
                  isDark={isDark}
                />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className={`font-semibold mb-4 text-sm uppercase tracking-widest ${isDark ? "text-white" : "text-primary"}`}
              >
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-sm">
                {quickLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={(e) => handleFooterLink(e, item.path)}
                      className={`transition-all hover:translate-x-1 inline-block duration-200 ${isDark ? "text-gray-400 hover:text-accent" : "text-primary hover:text-accent"}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="lg:col-span-2">
              <h4
                className={`font-semibold center mb-4 text-sm uppercase tracking-widest ${isDark ? "text-white" : "text-primary"}`}
              >
                Our Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                {services.map((group) => (
                  <div key={group.category}>
                    <h5
                      className={`font-medium text-xs uppercase tracking-widest mb-3 ${isDark ? "text-accent" : "text-accent"}`}
                    >
                      {group.category}
                    </h5>
                    <ul className="space-y-2.5 text-sm">
                      {group.items.map((service) => (
                        <li key={service.name}>
                          <Link
                            to={service.path}
                            onClick={(e) => handleFooterLink(e, service.path)}
                            className={`transition-all hover:translate-x-1 inline-block duration-200 ${isDark ? "text-gray-300 hover:text-white" : "text-primary hover:text-muted"}`}
                          >
                            {service.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4
                className={`font-semibold mb-4 text-sm uppercase tracking-widest ${isDark ? "text-white" : "text-primary"}`}
              >
                Contact Us
              </h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-accent mt-0.5 shrink-0" />

                  <a
                    href="https://maps.google.com/?q=AI+Knots+IT+Solution,+103+Goyal+Vihar,+Plot+No+31-C,+Zone+2,+MP+Nagar,+Bhopal,+Madhya+Pradesh+462011"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`hover:text-accent transition-colors ${isDark ? "text-gray-300" : "text-primary"}`}
                  >
                    103, Goyal Vihar, Plot No 31-C, Zone 2, M.P. Nagar, Bhopal -
                    462011, Madhya Pradesh, India
                  </a>
                </li>

                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-accent shrink-0" />
                  <a
                    href="tel:+917869636070"
                    className={`transition-colors ${isDark ? "hover:text-[#D9C5B5]" : "hover:text-[#8B6B4A]"}`}
                  >
                    +91 9630466070
                  </a>
                </li>

                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-accent shrink-0" />
                  <a
                    href="mailto:support@aiknotsit.com"
                    className={`transition-colors break-all ${isDark ? "hover:text-[#D9C5B5]" : "hover:text-[#8B6B4A]"}`}
                  >
                    support@aiknotsit.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`border-t py-6 text-center text-xs ${isDark ? "border-[#8B6B4A]/20 text-gray-500" : "border-gray-200 text-gray-500"}`}
        >
          <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={isDark ? "text-gray-500" : "text-gray-600"}>
              © {currentYear} AI Knots IT Solution. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                to="/privacypolicy"
                onClick={(e) => handleFooterLink(e, "/privacypolicy")}
                className={`transition-colors ${isDark ? "hover:text-accent" : "hover:text-accent"}`}
              >
                Privacy Policy
              </Link>
              <Link
                to="/termsofservice"
                onClick={(e) => handleFooterLink(e, "/termsofservice")}
                className={`transition-colors ${isDark ? "hover:text-accent" : "hover:text-accent"}`}
              >
                Terms of Service
              </Link>
              <Link
                to="/cookiepolicy"
                onClick={(e) => handleFooterLink(e, "/cookiepolicy")}
                className={`transition-colors ${isDark ? "hover:text-accent" : "hover:text-accent"}`}
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
