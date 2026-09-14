import React, { useState, useEffect } from "react";

const TermsOfService = () => {
  const lastUpdated = "March 24, 2026";

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
            Terms of Service
          </h1>
        </div>

        <div className="prose prose-invert max-w-none text-[15.8px] leading-relaxed space-y-12">
          <p
            className={`text-lg ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            Welcome to{" "}
            <span className="text-[#8B6B4A] font-medium">
              AI Knots IT Solution
            </span>
            . These Terms of Service govern your use of our website and the IT
            services we provide. By accessing or using our services, you agree
            to be bound by these terms.
          </p>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              1. Acceptance of Terms
            </h2>
            <p className={bodyClass}>
              By visiting our website, requesting a quote, or engaging with our
              services (Software Development, Digital Marketing, Web Design,
              Mobile App Development, etc.), you accept these Terms of Service
              and our Privacy Policy. If you do not agree, please do not use our
              services.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              2. Our Services
            </h2>
            <p className={`mb-4 ${bodyClass}`}>
              AI Knots provides the following professional IT services:
            </p>
            <ul className={`grid sm:grid-cols-2 gap-3 ${bodyClass}`}>
              {[
                "Custom Software Development",
                "Mobile App Development (Android & iOS)",
                "E-commerce Website Development",
                "UI/UX Design & Branding",
                "Digital Marketing (SEO, SMM, PPC)",
                "Cloud Solutions & ERP Development",
                "AI & Machine Learning Solutions",
                "Website Design & Maintenance",
              ].map((service, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-[#8B6B4A]">✔</span> {service}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              3. Client Responsibilities
            </h2>
            <ul className="space-y-4 pl-2">
              {[
                "Provide accurate and complete information required for project execution",
                "Make timely payments as per the agreed payment schedule",
                "Give timely feedback and approvals to avoid project delays",
                "Ensure you have the necessary rights to any content or materials provided to us",
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#8B6B4A]/10 flex items-center justify-center text-[#8B6B4A] text-sm font-medium shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className={bodyClass}>{item}</p>
                </div>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              4. Payment Terms
            </h2>
            <div className={`space-y-4 ${bodyClass}`}>
              <p>
                • We require 40-50% advance payment before starting any project
                (unless otherwise agreed).
              </p>
              <p>
                • Remaining payment will be milestone-based or upon project
                completion.
              </p>
              <p>
                • All payments are non-refundable except as per our Refund
                Policy mentioned below.
              </p>
              <p>• Late payments may attract 1.5% monthly interest.</p>
            </div>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              5. Project Timeline & Delivery
            </h2>
            <p className={bodyClass}>
              Project timelines are estimates and may vary due to scope changes,
              delayed feedback, or unforeseen circumstances. We will keep you
              informed of any delays and provide revised timelines.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              6. Intellectual Property
            </h2>
            <p className={bodyClass}>
              Once full payment is received, all rights to the final
              deliverables (website, software, designs, etc.) will be
              transferred to you. However, we retain the right to showcase the
              project in our portfolio unless a Non-Disclosure Agreement (NDA)
              is signed.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              7. Refund & Cancellation Policy
            </h2>
            <ul className={`list-disc pl-6 space-y-2 ${bodyClass}`}>
              <li>
                No refund after project initiation or any milestone payment.
              </li>
              <li>
                Partial refund may be considered only in exceptional cases
                before work begins (subject to 10-15% cancellation fee).
              </li>
              <li>
                Refund requests must be made in writing within 7 days of
                payment.
              </li>
            </ul>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              8. Limitation of Liability
            </h2>
            <p className={bodyClass}>
              AI Knots shall not be liable for any indirect, incidental,
              special, or consequential damages arising out of the use of our
              services. Our total liability shall not exceed the total amount
              paid by you for the specific service.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              9. Termination
            </h2>
            <p className={bodyClass}>
              We reserve the right to terminate or suspend services if you
              breach any terms, fail to make payments, or engage in illegal
              activities. You may also request termination with proper notice.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              10. Governing Law
            </h2>
            <p className={bodyClass}>
              These Terms shall be governed by and construed in accordance with
              the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of the courts in Bhopal, Madhya Pradesh.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              11. Changes to Terms
            </h2>
            <p className={bodyClass}>
              We may update these Terms of Service from time to time. Continued
              use of our services after changes constitutes your acceptance of
              the new terms.
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
              If you have any questions about these Terms of Service, please
              feel free to contact us.
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
            read, understood, and agree to these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
