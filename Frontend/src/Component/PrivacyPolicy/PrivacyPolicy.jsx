import React, { useState, useEffect } from "react";

const PrivacyPolicy = () => {
  const lastUpdated = "23 October, 2026";

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Dynamic Theme Classes
  const accentClass = "text-[#8B6B4A]";
  const headingClass = isDark ? "text-white" : "text-gray-900";
  const bodyClass = isDark ? "text-gray-300" : "text-gray-700";
  const cardClass = isDark
    ? "bg-gray-900/80 backdrop-blur-xl border border-gray-700/80"
    : "bg-white border border-gray-200 shadow-sm";

  return (
    <div
      className={`min-h-screen transition-colors duration-700
      ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#8B6B4A]"></div>
            <span className="text-[#8B6B4A] uppercase tracking-[3px] text-sm font-medium">
              Legal
            </span>
            <div className="w-8 h-px bg-[#8B6B4A]"></div>
          </div>
          <h1
            className={`text-5xl md:text-6xl font-bold tracking-tighter mb-3 ${headingClass}`}
          >
            Privacy Policy
          </h1>
        </div>

        <div className="prose prose-invert max-w-none text-[15.8px] leading-relaxed space-y-12">
          <p
            className={`text-lg ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            At{" "}
            <span className="text-[#8B6B4A] font-medium">
              AI Knots IT Solution
            </span>
            , we respect your privacy and are committed to protecting your
            personal data. This Privacy Policy explains how we collect, use,
            store, and protect your information when you visit our website,
            request services, or interact with us.
          </p>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              1. Information We Collect
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className={`p-7 rounded-2xl ${cardClass}`}>
                <h3 className={`text-xl font-medium mb-4 ${headingClass}`}>
                  Personal Information
                </h3>
                <ul className={`space-y-3 ${bodyClass}`}>
                  <li className="flex gap-3">
                    <span className="text-[#8B6B4A] mt-1">•</span> Name, email
                    address, phone number, and company details
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B6B4A] mt-1">•</span> Project
                    requirements, business needs, and inquiry details
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B6B4A] mt-1">•</span> Payment and
                    billing information (processed securely via third-party
                    gateways)
                  </li>
                </ul>
              </div>

              <div className={`p-7 rounded-2xl ${cardClass}`}>
                <h3 className={`text-xl font-medium mb-4 ${headingClass}`}>
                  Technical Information
                </h3>
                <ul className={`space-y-3 ${bodyClass}`}>
                  <li className="flex gap-3">
                    <span className="text-[#8B6B4A] mt-1">•</span> IP address,
                    browser type, device, and operating system
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B6B4A] mt-1">•</span> Website usage
                    data, pages visited, and session duration
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#8B6B4A] mt-1">•</span> Cookies and
                    similar tracking technologies
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              2. How We Use Your Information
            </h2>
            <p className={`mb-5 ${bodyClass}`}>
              We use your data to deliver excellent service and improve your
              experience:
            </p>
            <div className={`space-y-4 pl-2 ${bodyClass}`}>
              {[
                "Provide software development, digital marketing, web design, and IT consulting services",
                "Respond to your inquiries, prepare proposals, and communicate about projects",
                "Send important updates, service information, and occasional promotional content",
                "Analyze website performance and enhance user experience",
                "Comply with legal obligations and ensure security",
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#8B6B4A]/10 flex items-center justify-center text-[#8B6B4A] text-sm font-medium shrink-0 mt-0.5">
                    0{i + 1}
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              3. Data Sharing & Third Parties
            </h2>
            <p className={bodyClass}>
              We do not sell your personal data. We may share information only
              with:
            </p>
            <ul className={`list-disc pl-6 space-y-2 mt-4 ${bodyClass}`}>
              <li>
                Trusted service providers (cloud hosting, analytics, payment
                processors, email tools)
              </li>
              <li>Legal authorities when required by law</li>
              <li>
                Business partners in case of merger, acquisition, or company
                restructuring
              </li>
            </ul>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              4. Your Rights (DPDP Act, 2023)
            </h2>
            <p className={`mb-6 ${bodyClass}`}>
              As per the Digital Personal Data Protection Act, you have the
              right to:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Access and obtain a copy of your personal data",
                "Correct inaccurate or incomplete data",
                "Request deletion or withdrawal of consent",
                "File a grievance with our Data Protection Officer",
              ].map((right, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-xl flex items-start gap-3 ${cardClass}`}
                >
                  <span className="text-[#8B6B4A] text-xl">✓</span>
                  <p className={bodyClass}>{right}</p>
                </div>
              ))}
            </div>
            <p className={`mt-6 ${accentClass}`}>
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:Support@aiknotsit.com"
                className="underline hover:text-[#3D220E]"
              >
                Support@aiknotsit.com
              </a>
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              5. Data Security & Retention
            </h2>
            <p className={bodyClass}>
              We use industry-standard security measures to protect your data.
              We retain your personal information only as long as necessary for
              the purposes mentioned or as required by law.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              6. Cookies
            </h2>
            <p className={bodyClass}>
              Our website uses cookies to improve functionality and analyze
              traffic. You can manage your cookie preferences through your
              browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              7. Changes to This Policy
            </h2>
            <p className={bodyClass}>
              We may update this Privacy Policy occasionally. Any changes will
              be posted on this page with the updated date. We encourage you to
              review it periodically.
            </p>
          </section>

          {/* Contact Box */}
          <div
            className={`p-8 md:p-10 rounded-3xl mt-12 ${cardClass} border ${isDark ? "border-[#8B6B4A]/30" : "border-[#E8D9C2]"}`}
          >
            <h3 className={`text-2xl font-semibold mb-6 ${headingClass}`}>
              Questions or Concerns?
            </h3>
            <p className={`mb-6 ${bodyClass}`}>
              If you have any questions about this Privacy Policy, please feel
              free to contact us.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 text-sm">
              <div>
                <p className="text-gray-400">Email</p>
                <a
                  href="mailto:Support@aiknotsit.com"
                  className={`hover:underline ${accentClass}`}
                >
                  Support@aiknotsit.com
                </a>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <a
                  href="tel:+917869636070"
                  className={`hover:underline ${accentClass}`}
                >
                  +91 9630466070
                </a>
              </div>
              <div>
                <p className="text-gray-400">Location</p>
                <p>Bhopal, Madhya Pradesh, India</p>
              </div>
            </div>
          </div>

          <p
            className={`text-center text-sm pt-10 border-t ${isDark ? "border-zinc-800 text-gray-500" : "border-gray-200 text-gray-500"}`}
          >
            By using our website and services, you acknowledge that you have
            read, understood, and agree to this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
