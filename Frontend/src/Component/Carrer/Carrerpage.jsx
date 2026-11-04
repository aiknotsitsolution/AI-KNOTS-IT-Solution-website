import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  useApplyForJobMutation,
  useGetJobOpeningsQuery,
} from "../Redux/publicApi";
function CareerPage() {
  const { isDark } = useTheme();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const {
    data: jobs = [],
    isLoading: loading,
    error: jobsError,
  } = useGetJobOpeningsQuery();
  const [applyForJob, { isLoading: submitting }] = useApplyForJobMutation();
  const error = jobsError
    ? jobsError.data?.message ||
      jobsError.error ||
      jobsError.message ||
      "Failed to load job openings"
    : null;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");

  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setFormData({ name: "", email: "", phone: "" });
    setResumeFile(null);
    setResumeName("");
    setSubmitMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    setResumeFile(null);
    setResumeName("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        setSubmitMessage({
          type: "error",
          text: "Only PDF, DOC, or DOCX files are allowed!",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSubmitMessage({
          type: "error",
          text: "File size must be less than 5MB!",
        });
        return;
      }

      setResumeFile(file);
      setResumeName(file.name);
      setSubmitMessage({ type: "", text: "" });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!resumeFile) {
      setSubmitMessage({ type: "error", text: "Please upload your resume!" });
      return;
    }

    setSubmitMessage({ type: "", text: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("resume", resumeFile); // ← Must match multer.single('resume')

      await applyForJob({
        jobId: selectedJob._id,
        formData: formDataToSend,
      }).unwrap();
      setSubmitMessage({
        type: "success",
        text: "🎉 Application submitted successfully!",
      });
      setTimeout(() => closeModal(), 1800);
    } catch (err) {
      console.error(err);
      setSubmitMessage({
        type: "error",
        text:
          err?.data?.message ||
          "Network error. Please check your connection.",
      });
    }
  };

  // ====================== THEME CLASSES ======================
  const cardClass = isDark
    ? "bg-gray-900/70 border border-gray-800 hover:border-[#8B6B4A]/60 p-8 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#8B6B4A]/20"
    : "bg-white border border-gray-200 shadow-lg hover:shadow-2xl p-8 rounded-xl transition-all duration-300";

  const headingClass = isDark ? "text-white" : "text-gray-900";
  const bodyClass = isDark ? "text-gray-300" : "text-gray-700";
  const accentClass = "text-[#8B6B4A]";

  return (
    <>
      <Helmet>
        <title>
          Join our IT company for software, marketing & development career
          opportunities.
        </title>
        <meta
          name="description"
          content="Join our IT company for software, marketing & development career opportunities."
        />
        <meta
          name="keywords"
          content="IT Jobs in Bhopal	Software Jobs, Digital Marketing Jobs"
        />
      </Helmet>
      <div
        className={`min-h-screen transition-colors duration-700 relative overflow-hidden
      ${isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}
      >
        {/* ====================== HERO SECTION ====================== */}
        <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
          <div
            className={`absolute inset-0 transition-all duration-700
          ${
            isDark
              ? "bg-gradient-to-br from-[#8B6B4A]/30 via-black to-black"
              : "bg-gradient-to-br from-[#8B6B4A]/10 via-white to-white"
          }`}
          />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${headingClass}`}
            >
              <span className={accentClass}>Join</span> Our Team
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`mt-6 text-xl md:text-2xl max-w-3xl mx-auto ${bodyClass}`}
            >
              Be part of a team that's building the future. We are looking for
              passionate, curious and bold people.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <a
                href="#open-positions"
                className="inline-block bg-[#8B6B4A] hover:bg-[#6B4B3A] text-white font-semibold text-lg px-10 py-5 rounded-lg transition-all duration-300 shadow-lg shadow-[#8B6B4A]/40"
              >
                See Open Positions →
              </a>
            </motion.div>
          </div>
        </section>

        {/* ====================== WHY JOIN US ====================== */}
        <section
          className={`py-20 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2
              className={`text-4xl md:text-5xl font-bold text-center mb-16 ${headingClass}`}
            >
              Why Work <span className={accentClass}>With Us?</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  title: "Ownership & Impact",
                  desc: "You’ll own real features from day one and see your work used by thousands.",
                },
                {
                  title: "Rapid Growth",
                  desc: "Fast-paced environment where you learn and level up every month.",
                },
                {
                  title: "Great Team",
                  desc: "Work with smart, kind, and ambitious people who actually enjoy working together.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cardClass}
                >
                  <h3 className={`text-2xl font-semibold mb-4 ${accentClass}`}>
                    {item.title}
                  </h3>
                  <p className={`leading-relaxed ${bodyClass}`}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== OPEN POSITIONS ====================== */}
        <section
          id="open-positions"
          className={`py-20 ${isDark ? "bg-gradient-to-b from-black to-gray-950" : "bg-white"}`}
        >
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <h2
              className={`text-4xl md:text-5xl font-bold text-center mb-16 ${headingClass}`}
            >
              Open <span className={accentClass}>Positions</span>
            </h2>

            {loading && (
              <div className="text-center py-20">
                <p className={`text-xl ${bodyClass}`}>
                  Loading exciting opportunities...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-20 text-red-500">
                <p>⚠️ {error}</p>
              </div>
            )}

            {!loading && !error && jobs.length === 0 && (
              <div className="text-center py-20">
                <p className={`text-xl ${bodyClass}`}>
                  No open positions right now. Please check back later!
                </p>
              </div>
            )}

            <div className="space-y-6">
              {jobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`group flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-xl transition-all duration-300
                  ${
                    isDark
                      ? "bg-gray-900/70 border border-gray-800 hover:border-[#8B6B4A]/60"
                      : "bg-white border border-gray-200 hover:border-[#8B6B4A] shadow-md hover:shadow-xl"
                  }`}
                >
                  <div className="flex-1">
                    <h3
                      className={`text-2xl font-semibold group-hover:text-[#EFE5C8] transition-colors ${headingClass}`}
                    >
                      {job.title}
                    </h3>

                    <div
                      className={`mt-3 flex flex-wrap gap-4 text-sm ${bodyClass}`}
                    >
                      <span>•</span>
                      <span className="capitalize">
                        {job.category?.name || "Full-time"}
                      </span>

                      {job.endDate && (
                        <>
                          <span>•</span>
                          <span>
                            Closes on:{" "}
                            {new Date(job.endDate).toLocaleDateString("en-IN")}
                          </span>
                        </>
                      )}
                    </div>

                    {job.description && (
                      <p className={`mt-4 line-clamp-3 ${bodyClass}`}>
                        {job.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => openApplyModal(job)}
                    className="bg-[#8B6B4A] hover:bg-[#6B4B3A] text-white px-8 py-4 rounded-lg font-medium transition-all whitespace-nowrap self-start md:self-center"
                  >
                    Apply Now
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================== FINAL CTA ====================== */}
        <section
          className={`py-24 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2
              className={`text-4xl md:text-5xl font-bold mb-8 ${headingClass}`}
            >
              Ready to <span className={accentClass}>build</span> something
              epic?
            </h2>
            <p className={`text-xl mb-10 ${bodyClass}`}>
              Join us and leave your mark.
            </p>
            <a
              href="#open-positions"
              className="inline-block bg-[#8B6B4A] hover:bg-[#6B4B3A] active:bg-[#4B2B1A] text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-xl transition-all duration-300"
            >
              Explore Open Roles →
            </a>
          </div>
        </section>

        {/* ====================== APPLICATION MODAL ====================== */}
        <AnimatePresence>
          {isModalOpen && selectedJob && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl
                ${isDark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                  <div>
                    <h3 className={`text-2xl font-bold ${headingClass}`}>
                      Apply for
                    </h3>
                    <p className="text-[#EFE5C8] font-semibold">
                      {selectedJob.title}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-3xl leading-none text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label
                      className={`block mb-1 text-sm font-medium ${bodyClass}`}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-red-600 transition-colors
                      ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block mb-1 text-sm font-medium ${bodyClass}`}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-red-600 transition-colors
                        ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block mb-1 text-sm font-medium ${bodyClass}`}
                      >
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-red-600 transition-colors
                        ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                      />
                    </div>
                  </div>

                  {/* Resume Upload Section */}
                  <div>
                    <label
                      className={`block mb-1 text-sm font-medium ${bodyClass}`}
                    >
                      Resume (PDF, DOC, DOCX) *
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all hover:border-red-600
                    ${isDark ? "border-gray-700" : "border-gray-300"}`}
                    >
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-12 h-12 text-[#EFE5C8] mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903 5 5 0 018.962-2.585M15 11V5a3 3 0 00-6 0v6M12 19l-3-3m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                        <span className="font-medium text-base">
                          Click to upload your resume
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Max 5MB • PDF, Word files only
                        </span>
                      </label>
                    </div>

                    {resumeName && (
                      <p className="mt-3 text-sm flex items-center gap-2 text-green-600">
                        ✅ {resumeName}
                      </p>
                    )}
                  </div>

                  {submitMessage.text && (
                    <p
                      className={`text-center font-medium py-3 rounded-lg
                    ${submitMessage.type === "success" ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"}`}
                    >
                      {submitMessage.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#8B6B4A] hover:bg-[#6B4B3A] disabled:bg-gray-600 py-4 rounded-xl text-white font-semibold text-lg transition-all active:scale-[0.985]"
                  >
                    {submitting
                      ? "Submitting Application..."
                      : "Submit Application"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ====================== SCROLL TO TOP BUTTON ====================== */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#8B6B4A] hover:bg-[#6B4B3A] text-white shadow-lg shadow-[#8B6B4A]/50 transition-all duration-300 hover:scale-110 active:scale-95
          ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"}`}
          aria-label="Scroll back to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

export default CareerPage;
