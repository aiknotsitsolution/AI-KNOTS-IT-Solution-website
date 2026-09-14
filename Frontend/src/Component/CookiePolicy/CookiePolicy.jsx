import React, { useState, useEffect } from "react";

const CookiePolicy = () => {
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
            Cookie Policy
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
            , we use cookies and similar tracking technologies to enhance your
            browsing experience, analyze website traffic, and provide
            personalized services. This Cookie Policy explains what cookies are,
            how we use them, and how you can manage them.
          </p>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              1. What Are Cookies?
            </h2>
            <p className={bodyClass}>
              Cookies are small text files that are stored on your device
              (computer, smartphone, or tablet) when you visit a website. They
              help the website remember your preferences, improve functionality,
              and provide insights into how the website is used.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              2. Types of Cookies We Use
            </h2>

            <div className="space-y-8">
              <div className={`p-7 rounded-2xl ${cardClass}`}>
                <h3 className={`text-xl font-medium mb-3 ${headingClass}`}>
                  Essential Cookies
                </h3>
                <p className={bodyClass}>
                  These cookies are necessary for the website to function
                  properly. They enable core functionalities like page
                  navigation, security, and access to secure areas. You cannot
                  opt-out of these cookies.
                </p>
              </div>

              <div className={`p-7 rounded-2xl ${cardClass}`}>
                <h3 className={`text-xl font-medium mb-3 ${headingClass}`}>
                  Performance & Analytics Cookies
                </h3>
                <p className={bodyClass}>
                  These cookies help us understand how visitors interact with
                  our website. We use tools like Google Analytics to collect
                  information such as pages visited, time spent, and bounce
                  rates. This helps us improve our website and services.
                </p>
              </div>

              <div className={`p-7 rounded-2xl ${cardClass}`}>
                <h3 className={`text-xl font-medium mb-3 ${headingClass}`}>
                  Functional Cookies
                </h3>
                <p className={bodyClass}>
                  These cookies allow the website to remember your choices (such
                  as language preference or region) and provide enhanced,
                  personalized features.
                </p>
              </div>

              <div className={`p-7 rounded-2xl ${cardClass}`}>
                <h3 className={`text-xl font-medium mb-3 ${headingClass}`}>
                  Marketing & Advertising Cookies
                </h3>
                <p className={bodyClass}>
                  These cookies are used to deliver relevant advertisements and
                  track the effectiveness of our marketing campaigns. They may
                  also be used by third-party advertising networks.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              3. Third-Party Cookies
            </h2>
            <p className={bodyClass}>
              We may use third-party services (such as Google Analytics,
              Facebook Pixel, or payment gateways) that set their own cookies
              when you visit our website. These cookies are governed by the
              respective third parties' privacy policies.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              4. How to Manage Cookies
            </h2>
            <p className={`mb-6 ${bodyClass}`}>
              You can control and manage cookies in several ways:
            </p>

            <div className={`p-7 md:p-10 rounded-3xl ${cardClass}`}>
              <ul className={`list-disc pl-6 space-y-4 ${bodyClass}`}>
                <li>
                  <strong>Browser Settings:</strong> Most browsers allow you to
                  block or delete cookies. Please note that disabling essential
                  cookies may affect the functionality of our website.
                </li>
                <li>
                  <strong>Cookie Consent Banner:</strong> When you first visit
                  our website, you will see a cookie consent banner where you
                  can accept or customize your preferences.
                </li>
                <li>
                  <strong>Opt-out Options:</strong> You can opt-out of analytics
                  and marketing cookies through the consent manager.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              5. Updates to This Cookie Policy
            </h2>
            <p className={bodyClass}>
              We may update this Cookie Policy from time to time to reflect
              changes in our practices or legal requirements. Any updates will
              be posted on this page with the revised "Last updated" date. We
              encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className={`text-3xl font-semibold mb-5 ${headingClass}`}>
              6. Contact Us
            </h2>
            <p className={`mb-6 ${bodyClass}`}>
              If you have any questions about our use of cookies or this Cookie
              Policy, please feel free to contact us:
            </p>

            <div
              className={`p-8 md:p-10 rounded-3xl ${cardClass} border ${
                isDark ? "border-[#8B6B4A]/30" : "border-[#E8D9C2]"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-8 text-sm">
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
                  <p className="text-gray-400">Address</p>
                  <p>Bhopal, Madhya Pradesh, India</p>
                </div>
              </div>
            </div>
          </section>

          <p
            className={`text-center text-sm pt-10 border-t ${isDark ? "border-zinc-800 text-gray-500" : "border-gray-200 text-gray-500"}`}
          >
            By continuing to use our website, you consent to the use of cookies
            as described in this Cookie Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
