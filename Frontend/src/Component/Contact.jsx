import React, { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Mail, Phone, Building2, Clock, Send } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";
import { Helmet } from "react-helmet-async";
import { useTheme } from "../context/ThemeContext";

import {
  updateField,
  setCaptcha,
  clearMessages,
  submitContactForm,
} from "./Redux/contact/contactSlice.js";

const particlesOptions = {
  fullScreen: { enable: true, zIndex: -1 },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: { enable: true, mode: "push" },
      onHover: { enable: true, mode: "repulse" },
      resize: true,
    },
    modes: {
      push: { quantity: 3 },
      repulse: { distance: 120, duration: 0.4 },
    },
  },
  particles: {
    color: { value: ["#9F714E", "#D2A679", "#8B6B4A"] },
    links: {
      color: "#ffffff",
      distance: 130,
      enable: true,
      opacity: 0.15,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: { default: "bounce" },
      random: true,
      speed: 0.8,
      straight: false,
    },
    number: { density: { enable: true, area: 800 }, value: 60 },
    opacity: { value: 0.45 },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 4 } },
  },
  detectRetina: true,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 130, damping: 15 },
  },
};

const Contact = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();

  const { formData, captchaValue, loading, successMessage, errorMessage } =
    useSelector((state) => state.contact);

  // Particles Init
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Toast Notifications
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, { position: "top-right", autoClose: 5000 });
      dispatch(clearMessages());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, { position: "top-right", autoClose: 7000 });
      dispatch(clearMessages());
    }
  }, [errorMessage, dispatch]);

  const handleChange = (e) => {
    dispatch(updateField({ name: e.target.name, value: e.target.value }));
  };

  const handleCaptchaChange = (value) => {
    dispatch(setCaptcha(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!captchaValue) {
      toast.error("Please verify that you are not a robot.");
      return;
    }

    dispatch(submitContactForm({ ...formData, captcha: captchaValue }));
  };

  return (
    <>
      <Helmet>
        <title>Contact AI Knots IT | Get a Free Quote</title>
        <meta
          name="description"
          content="Contact us for website development, SEO, software & digital marketing services."
        />
        <meta
          name="keywords"
          content="IT company contact, web development quote, hire software developers Bhopal"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPoint",
            telephone: "+91-78696-36070",
            contactType: "Customer Service",
            contactOption: "TollFree",
            areaServed: "Bhopal",
            availableLanguage: ["en", "hi"],
          })}
        </script>
      </Helmet>
      <div
        className={`relative min-h-screen overflow-hidden transition-colors duration-700
      ${isDark ? "bg-black text-white" : "bg-white text-primary"}`}
      >
        <ToastContainer
          position="top-right"
          autoClose={5000}
          theme={isDark ? "dark" : "light"}
        />

        {/* Particles Background */}
        <Particles
          id="tsparticles-contact"
          init={particlesInit}
          options={particlesOptions}
          className="absolute inset-0 z-0"
        />

        <div className="relative z-10">
          {/* ==================== HERO SECTION WITH BACKGROUND IMAGE ==================== */}
          <section className="relative py-20 md:py-28 lg:py-36 min-h-[85vh] flex items-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2340&q=80"
                alt="Contact Background"
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 transition-all duration-700
              ${
                isDark
                  ? "bg-gradient-to-br from-black/85 via-black/70 to-black/80"
                  : "bg-gradient-to-br from-black/60 via-black/50 to-black/40"
              }`}
              />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h1
                  variants={itemVariants}
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${isDark ? "text-white" : "text-white"}`}
                >
                  <span className="bg-[#48321b] bg-clip-text">
                    Get in Touch
                  </span>
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className={`mt-5 text-lg md:text-xl max-w-3xl mx-auto ${isDark ? "text-gray-300" : "text-white/90"}`}
                >
                  Have questions or ready to start a project? We're here to
                  help.
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Main Content */}
          <section
            className={`py-12 md:py-20 border-t transition-colors
          ${isDark ? "border-gray-800 bg-black/50" : "border-gray-200 bg-white/50"} backdrop-blur-sm`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
                {/* Contact Information */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <h2
                    className={`text-3xl md:text-4xl font-bold mb-8 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Contact Information
                  </h2>

                  <div className="space-y-7">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3.5 rounded-xl ${isDark ? "bg-black/20 border border-primary/30" : "bg-muted border border-primary/30"}`}
                      >
                        <Building2 className={`h-6 w-6 text-accent`} />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          Our Office
                        </h3>
                        <p
                          className={`mt-1.5 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        >
                          103, Goyal Vihar,
                          <br />
                          Plot No 31-C, Zone 2,
                          <br />
                          M.P. Nagar, Bhopal - 462011
                          <br />
                          Madhya Pradesh, India
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3.5 rounded-xl ${isDark ? "bg-black/20 border border-primary/30" : "bg-muted border border-primary/30"}`}
                      >
                        <Phone className={`h-6 w-6 text-accent`} />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          Phone
                        </h3>
                        <p
                          className={`mt-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        >
                          <a
                            href="tel:+917869636070"
                            className="hover:text-accent transition"
                          >
                            +91 9630466070
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3.5 rounded-xl ${isDark ? "bg-black/20 border border-primary/30" : "bg-muted border border-primary/30"}`}
                      >
                        <Mail className={`h-6 w-6 text-accent`} />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          Email
                        </h3>
                        <p
                          className={`mt-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        >
                          <a
                            href="mailto:support@aiknotsit.com"
                            className="hover:text-accent transition"
                          >
                            support@aiknotsit.com
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3.5 rounded-xl ${isDark ? "bg-black/20 border border-primary/30" : "bg-muted border border-primary/30"}`}
                      >
                        <Clock className={`h-6 w-6 text-accent`} />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          Working Hours
                        </h3>
                        <p
                          className={`mt-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        >
                          Mon – Sat: 10:00 AM – 7:00 PM
                          <br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Form + Map */}
                <div className="space-y-10">
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl p-7 md:p-9 backdrop-blur-sm shadow-xl
                    ${isDark ? "bg-gray-950/70 border border-gray-800 shadow-[#3D220E]/25" : "bg-white border border-gray-200 shadow-gray-300"}`}
                  >
                    <h2
                      className={`text-2xl md:text-3xl font-bold mb-7 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Send Us a Message
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Your Name"
                          required
                          disabled={loading}
                          className={`w-full px-4 py-3.5 rounded-lg focus:border-primary focus:outline-none transition
                          ${isDark ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-300 text-primary placeholder-gray-400"}`}
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Your Email"
                          required
                          disabled={loading}
                          className={`w-full px-4 py-3.5 rounded-lg focus:border-primary focus:outline-none transition
                          ${isDark ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-300 text-primary placeholder-gray-400"}`}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          required
                          disabled={loading}
                          className={`w-full px-4 py-3.5 rounded-lg focus:border-primary focus:outline-none transition
                          ${isDark ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-300 text-primary placeholder-gray-400"}`}
                        />
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Subject"
                          required
                          disabled={loading}
                          className={`w-full px-4 py-3.5 rounded-lg focus:border-red-500 focus:outline-none transition
                          ${
                            isDark
                              ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-500"
                              : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                          }`}
                        />
                      </div>

                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Your Message..."
                        required
                        disabled={loading}
                        className={`w-full px-4 py-3.5 rounded-lg focus:border-primary focus:outline-none resize-none transition
                        ${isDark ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-300 text-primary placeholder-gray-400"}`}
                      />

                      <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={handleCaptchaChange}
                        theme={isDark ? "dark" : "light"}
                      />

                      <button
                        type="submit"
                        disabled={loading || !captchaValue}
                        className={`w-full py-4 btn-primary text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 ${loading || !captchaValue ? "opacity-70 cursor-not-allowed" : "hover:opacity-95 hover:-translate-y-0.5"}`}
                      >
                        {loading ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send size={18} /> Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>

                  {/* Google Map */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl overflow-hidden shadow-xl h-80 md:h-96 border
                    ${isDark ? "border-gray-800" : "border-gray-200"}`}
                  >
                    <iframe
                      title="AI Knots Solution - Full Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3317.867285760282!2d77.43456627477637!3d23.229885108561017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c43e914c4c45f%3A0x63eea333d8d228ca!2sAI%20Knots%20It%20Solution!5e1!3m2!1sen!2sin!4v1781177112409!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Contact;
