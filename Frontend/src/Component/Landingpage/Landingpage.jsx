import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Send,
  Building2,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import InteractiveFolderGallery from "./InteractiveFolderGallery";
// import SplineSceneBasic from "./Spotlight/SplineSceneBasic";
import RadialOrbitalTimeline from "./Spotlight/RadialOrbitalTimeline";
import portfolio from "../../assets/Image_landingpage/portfolio/portfolioimage.png";
import portfolio2 from "../../assets/Image_landingpage/portfolio/portfolio2.jpeg";
import portfolio3 from "../../assets/Image_landingpage/portfolio/portfolio3.jpeg";
import portfolio4 from "../../assets/Image_landingpage/portfolio/portfolio4.jpeg";
import portfolio5 from "../../assets/Image_landingpage/portfolio/portfolio5.png";
import logoImage from "../../assets/Images/ITLogo.webp";

function Landingpage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [captchaValue, setCaptchaValue] = useState(null);
  const [loading, setLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFormData({
        username: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setCaptchaValue(null);
    }, 1200);
  };

  useEffect(() => {
    // Reveal Animation
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((el) => observer.observe(el));

    // Counter Animation
    const counters = document.querySelectorAll("[data-count]");
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.dataset.done) return;
          entry.target.dataset.done = "true";
          const target = Number(entry.target.dataset.count);
          const suffix = entry.target.textContent?.includes("%") ? "%" : "+";
          let value = 0;
          const timer = setInterval(() => {
            value += Math.max(1, Math.ceil(target / 42));
            if (value >= target) {
              value = target;
              clearInterval(timer);
            }
            entry.target.textContent = value + suffix;
          }, 24);
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((el) => countObserver.observe(el));

    return () => observer.disconnect();
  }, []);

  const socialLinks = [
    {
      href: "https://www.linkedin.com/company/ai-knots-it/?viewAsMember=true",
      label: "LinkedIn",
      icon: "in",
    },
    {
      href: "https://www.facebook.com/aiknotsitsolution",
      label: "Facebook",
      icon: "f",
    },
    {
      href: "https://www.instagram.com/aiknotsitsolution/",
      label: "Instagram",
      icon: "ig",
    },
    {
      href: "https://in.pinterest.com/aiknotsitsolution/",
      label: "Pinterest",
      icon: "P",
    },
  ];

  return (
    <div className="font-['Manrope'] bg-[#F8F5F0] text-[#2F2A26]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#F8F5F0]/90 border-b border-[#DED5CA]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-5 h-16 sm:h-20 flex items-center justify-between gap-3">
          <a
            href="#home"
            className="flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-xl min-w-0"
          >
            <img
              src={logoImage}
              alt="AI Knots IT Solution logo"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-contain bg-white shadow-xl shrink-0"
            />
            <span className="truncate">AI Knots IT Solution</span>
          </a>

          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-[#6C6259]">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#about">About</a>
            <a href="#faq">Blog</a>
            <a href="#contact">Contact</a>
          </div>

          <a
            href="#contact"
            className="bg-[#8B6B4A] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold hover:bg-[#75563B] transition-all text-sm sm:text-base shrink-0"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header
        id="home"
        className="pt-16 sm:pt-20 pb-12 sm:pb-16 min-h-[calc(100vh-4rem)] flex items-center bg-[radial-gradient(circle_at_80%_8%,rgba(139,107,74,0.16),transparent_34rem),radial-gradient(circle_at_12%_18%,rgba(126,135,117,0.14),transparent_26rem),#F8F5F0]"
      >
        <div className="max-w-[1180px] mx-auto px-4 sm:px-5 grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 border border-[#DED5CA] bg-white/70 rounded-full text-sm font-bold text-[#6C6259]">
              AI-powered business automation & digital growth
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mt-6">
              Transform Your Ideas Into Intelligent Solutions
            </h1>
            <p className="text-base sm:text-lg text-[#6C6259] mt-6 max-w-lg mx-auto lg:mx-0">
              AI Knots IT Solution helps businesses automate repetitive work,
              streamline complex operations, and strengthen their digital
              presence with smart websites, custom software, SEO, and marketing
              systems.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mt-8">
              <a
                href="#contact"
                className="bg-[#8B6B4A] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold hover:bg-[#75563B] transition-all flex items-center justify-center gap-2"
              >
                Schedule a Free Demo <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#services"
                className="border border-[#DED5CA] bg-white/70 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold hover:bg-white transition-all text-center"
              >
                Explore Our Services
              </a>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8 mt-10 text-sm font-bold text-[#6C6259]">
              <div>Workflow automation</div>
              <div>Scalable digital systems</div>
              <div>24×7 support</div>
            </div>
          </div>

          <div className="reveal">
            <InteractiveFolderGallery />
          </div>
        </div>
      </header>

      {/* Trusted */}

      {/* Services */}
      <section id="services" className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-5">
          <div className="text-center mb-10 sm:mb-16 reveal">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Services built for modern business growth
            </h2>
            <p className="mt-4 text-[#6C6259] max-w-2xl mx-auto text-sm sm:text-base">
              Every engagement combines strategic planning, premium interface
              design, scalable engineering, and measurable growth thinking.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: "⚙",
                title: "Web Design",
                desc: "Craft modern, responsive websites with intuitive navigation, clear messaging, and a polished visual identity.",
              },
              {
                icon: "↺",
                title: "Web Development",
                desc: "Build fast, secure, and scalable websites with clean code, optimized performance, and SEO-friendly architecture.",
              },
              {
                icon: "⌘",
                title: "Custom Software Development",
                desc: "Build tailored platforms, CRMs, dashboards, and business tools that fit your exact workflow.",
              },
              {
                icon: "◐",
                title: "Digital Marketing",
                desc: "Create strategy-led campaigns, paid ads, social campaigns, and lead funnels that drive measurable results.",
              },
              {
                icon: "🔎",
                title: "SEO & Online Visibility",
                desc: "Improve search rankings, website performance, content structure, and local presence to grow qualified traffic.",
              },
              {
                icon: "🛠",
                title: "QA, Support & Optimization",
                desc: "From testing and issue resolution to ongoing support, we keep your digital systems reliable and efficient.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="reveal bg-white/60 border border-[#DED5CA] rounded-3xl p-6 sm:p-8 hover:-translate-y-2 transition-all group"
              >
                <div className="text-4xl mb-6 text-[#8B6B4A] group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <h3 className="font-bold text-2xl mb-3">{s.title}</h3>
                <p className="text-[#6C6259]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        id="about"
        className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#EFE7DC]/60 to-[#F8F5F0]"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-5 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="reveal w-full overflow-visible">
            <RadialOrbitalTimeline />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold reveal">
              Why choose AI Knots
            </h2>
            <p className="mt-4 text-[#6C6259] reveal text-sm sm:text-base">
              We empower businesses with innovative, scalable, and result-driven
              technology solutions that improve efficiency, strengthen digital
              presence, and support long-term growth.
            </p>
            <div className="grid gap-4 mt-10">
              {[
                "Innovative & scalable solutions",
                "End-to-end business automation",
                "SEO-friendly development",
                "Reliable support & maintenance",
                "Clear communication & fast delivery",
                "Growth-focused digital strategy",
              ].map((item, i) => (
                <div
                  key={i}
                  className="reveal flex gap-4 bg-white/60 border border-[#DED5CA] rounded-2xl p-4 sm:p-6"
                >
                  <div className="w-8 h-8 rounded-full bg-[#8B6B4A]/10 text-[#8B6B4A] flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{item}</h4>
                    <p className="text-sm text-[#6C6259]">
                      Senior execution with quality focus.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {/* Portfolio Showcase Section */}
      <section id="portfolio" className="py-16 sm:py-20 lg:py-24 bg-[#F8F5F0]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Portfolio showcase
              </h2>
              <p className="text-[#6C6259] mt-3 text-sm sm:text-base">
                Modern digital products crafted for clarity, performance, and
                measurable impact.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-12 gap-4 sm:gap-6">
            {/* Tall Card - Edu-Hawk Worldwide – MBBS Abroad Consultancy Website */}
            <div className="sm:col-span-2 md:col-span-4 md:row-span-2 group">
              <div className="bg-white border border-[#DED5CA] rounded-3xl overflow-hidden h-full flex flex-col">
                <div className="h-[380px] bg-gradient-to-br from-[#F5F0E8] to-[#EDE4D4] flex items-center justify-center relative">
                  <img
                    src={portfolio}
                    alt="Portfolio Item"
                    className="w-full h-full "
                  />

                  {/* <div className="absolute bottom-8 left-8 bg-white px-4 py-2 rounded-xl text-sm font-medium shadow">
                    Edu-Hawk Worldwide – MBBS Abroad Consultancy Website
                  </div> */}
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl">
                      Edu-Hawk Worldwide – MBBS Abroad Consultancy Website
                    </h3>
                    <p className="text-[#6C6259]">
                      Educational Consultancy Platform
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edu-Hawk Worldwide – MBBS Abroad Consultancy Website */}
            <div className="md:col-span-4 group">
              <div className="bg-white border border-[#DED5CA] rounded-3xl overflow-hidden">
                <div className="h-[220px] bg-gradient-to-br from-[#F5F0E8] to-[#EDE4D4] flex items-center justify-center">
                  <img
                    src={portfolio2}
                    alt="Portfolio Item"
                    className="w-full h-full "
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl">IncorpNow - Consulting</h3>
                  <p className="text-[#6C6259]">Consulting Services Platform</p>
                </div>
              </div>
            </div>

            {/* Highlight Enterprises - Event services Website */}
            <div className="md:col-span-4 group">
              <div className="bg-white border border-[#DED5CA] rounded-3xl overflow-hidden">
                <div className="h-[220px] bg-gradient-to-br from-[#F5F0E8] to-[hsl(38,41%,88%)] flex items-center justify-center">
                  <img
                    src={portfolio5}
                    alt="Portfolio Item"
                    className="w-full h-full "
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl">
                    Highlight Enterprises - Event services Website
                  </h3>
                  <p className="text-[#6C6259]">Event Management Platform</p>
                </div>
              </div>
            </div>

            {/* Craze Craft Interiors - Social Media and GMB Handling*/}
            <div className="md:col-span-4 group">
              <div className="bg-white border border-[#DED5CA] rounded-3xl overflow-hidden">
                <div className="h-[220px] bg-gradient-to-br from-[#F5F0E8] to-[#EDE4D4] flex items-center justify-center">
                  <img
                    src={portfolio4}
                    alt="Portfolio Item"
                    className="w-full h-full "
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl">
                    Craze Craft Interiors - Social Media and GMB Handling
                  </h3>
                  <p className="text-[#6C6259]">
                    Social Media Management and Google My Business Optimization
                  </p>
                </div>
              </div>
            </div>

            {/* Hot Cafe plus - E-Commerece */}
            <div className="md:col-span-4 group">
              <div className="bg-white border border-[#DED5CA] rounded-3xl overflow-hidden">
                <div className="h-[220px] bg-gradient-to-br from-[#F5F0E8] to-[#EDE4D4] flex items-center justify-center">
                  <img
                    src={portfolio3}
                    alt="Portfolio Item"
                    className="w-full h-full "
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-bold text-xl">
                    Hot Cafe plus - E-Commerece
                  </h3>
                  <p className="text-[#6C6259]">E-Commerce Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#F8F5F0]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-5  ">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                A clear process from idea to launch
              </h2>
              <p className="text-[#6C6259] mt-3 text-sm sm:text-base">
                Simple enough to move quickly, structured enough to keep quality
                high.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
            {[
              {
                num: "1",
                title: "Process Mapping",
                desc: "We study your workflows and identify the best areas to automate.",
              },
              {
                num: "2",
                title: "Implementation",
                desc: "Our team integrates the right systems, tools, and automation logic.",
              },
              {
                num: "3",
                title: "Training",
                desc: "We guide your team to use the solution confidently and efficiently.",
              },
              {
                num: "4",
                title: "Monitoring",
                desc: "We continuously track performance and improve the process over time.",
              },
              {
                num: "5",
                title: "Customization",
                desc: "We adapt the solution to fit your business needs as they evolve.",
              },
              {
                num: "6",
                title: "Support",
                desc: "Ongoing assistance ensures your operations stay smooth and reliable.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white border border-[#DED5CA] rounded-3xl p-6 sm:p-8 hover:-translate-y-2 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#8B6B4A] text-white flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-[#6C6259] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats + Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#F8F5F0]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-5">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
            <div className="bg-white border border-[#DED5CA] rounded-3xl p-6 sm:p-8 text-center">
              <div
                className="text-5xl font-bold text-[#8B6B4A]"
                data-count="150"
              >
                0+
              </div>
              <p className="text-[#6C6259] mt-2 font-medium">
                Projects Delivered
              </p>
            </div>
            <div className="bg-white border border-[#DED5CA] rounded-3xl p-8 text-center">
              <div
                className="text-5xl font-bold text-[#8B6B4A]"
                data-count="98"
              >
                0%
              </div>
              <p className="text-[#6C6259] mt-2 font-medium">
                Client Satisfaction
              </p>
            </div>
            <div className="bg-white border border-[#DED5CA] rounded-3xl p-8 text-center">
              <div
                className="text-5xl font-bold text-[#8B6B4A]"
                data-count="40"
              >
                0+
              </div>
              <p className="text-[#6C6259] mt-2 font-medium">
                Business Clients
              </p>
            </div>
            <div className="bg-white border border-[#DED5CA] rounded-3xl p-8 text-center">
              <div className="text-5xl font-bold text-[#8B6B4A]" data-count="5">
                0+
              </div>
              <p className="text-[#6C6259] mt-2 font-medium">
                Years Experience
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  Trusted by founders and growing teams
                </h2>
                <p className="text-[#6C6259] mt-3 text-sm sm:text-base">
                  Clients choose AI Knots for thoughtful execution, transparent
                  communication, and dependable delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white border border-[#DED5CA] rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B08A67] to-[#7E8775]"></div>
                <div>
                  <h4 className="font-bold">Swadesh Jyoti Lalwani</h4>
                  <p className="text-[#6C6259] text-sm">
                    Business Growth Partner
                  </p>
                </div>
              </div>
              <div className="text-[#8B6B4A] text-2xl mb-4">★★★★★</div>
              <p className="text-[#6C6259] leading-relaxed">
                "A reliable digital marketing partner. AI Knots understands
                business needs and delivers with clarity."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-[#DED5CA] rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B08A67] to-[#7E8775]"></div>
                <div>
                  <h4 className="font-bold">Pathik Shah</h4>
                  <p className="text-[#6C6259] text-sm">
                    Growth-focused Client
                  </p>
                </div>
              </div>
              <div className="text-[#8B6B4A] text-2xl mb-4">★★★★★</div>
              <p className="text-[#6C6259] leading-relaxed">
                "Working with AI Knots has been a great decision. Their team
                delivered a solution that truly supports our business growth."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-[#DED5CA] rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B08A67] to-[#7E8775]"></div>
                <div>
                  <h4 className="font-bold">Bharat e-Filing</h4>
                  <p className="text-[#6C6259] text-sm">Operations Client</p>
                </div>
              </div>
              <div className="text-[#8B6B4A] text-2xl mb-4">★★★★★</div>
              <p className="text-[#6C6259] leading-relaxed">
                "AI Knots has helped us improve our digital visibility and
                simplify how we manage day-to-day operations."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries & Technologies Section */}
      <section className="py-20 bg-[#F8F5F0]">
        <div className="max-w-[1180px] mx-auto px-5">
          {/* Industries We Serve */}
          <div className="mb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  Industries we serve
                </h2>
                <p className="text-[#6C6259] mt-3 text-sm sm:text-base">
                  Digital systems for organizations that need reliable execution
                  and a refined customer experience.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "🏥", name: "Healthcare" },
                { icon: "📚", name: "Education" },
                { icon: "🏠", name: "Real Estate" },
                { icon: "💰", name: "Finance" },
                { icon: "🛍️", name: "Retail" },
                { icon: "🏭", name: "Manufacturing" },
                { icon: "🏨", name: "Hospitality" },
                { icon: "🚀", name: "Startups" },
              ].map((industry, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#DED5CA] hover:border-[#8B6B4A] rounded-3xl p-4 sm:p-6 flex items-center gap-4 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-[#F8F5F0] rounded-2xl flex items-center justify-center text-2xl">
                    {industry.icon}
                  </div>
                  <h3 className="font-bold text-lg">{industry.name}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies We Use */}
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  Technologies we use
                </h2>
                <p className="text-[#6C6259] mt-3 text-sm sm:text-base">
                  A modern, scalable stack selected around speed, security, and
                  long-term maintainability.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {[
                "React",
                "Next.js",
                "Node.js",
                "Laravel",
                "Flutter",
                "Python",
                "AWS",
                "MongoDB",
                "MySQL",
                "Docker",
                "OpenAI",
                "Google Cloud",
              ].map((tech, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#DED5CA] hover:border-[#8B6B4A] rounded-3xl py-6 text-center font-medium transition-all hover:-translate-y-1"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contact" className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-5">
          <div className="bg-gradient-to-br from-[#2F2A26] to-[#75563B] text-white rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Let's Build Something Amazing Together
            </h2>
            <p className="mt-6 text-base sm:text-lg opacity-90">
              Get a free consultation and discover how AI Knots IT Solution can
              accelerate your business growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a
                href="mailto:Support@aiknotsit.com"
                className="bg-white text-black font-bold px-10 py-4 rounded-full"
              >
                Book Free Consultation
              </a>
              <a
                href="tel:+917869636070"
                className="border border-white/40 px-10 py-4 rounded-full hover:bg-white/10"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
            {/* Contact Information */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                Contact Information
              </h2>

              <div className="space-y-7">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-xl bg-muted border border-primary/30">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Our Office
                    </h3>
                    <p className="mt-1.5 leading-relaxed text-gray-600">
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
                  <div className="p-3.5 rounded-xl bg-muted border border-primary/30">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Phone
                    </h3>
                    <p className="mt-1.5 text-gray-600">
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
                  <div className="p-3.5 rounded-xl bg-muted border border-primary/30">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Email
                    </h3>
                    <p className="mt-1.5 text-gray-600">
                      <a
                        href="mailto:Support@aiknotsit.com"
                        className="hover:text-accent transition"
                      >
                        Support@aiknotsit.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-xl bg-muted border border-primary/30">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Working Hours
                    </h3>
                    <p className="mt-1.5 text-gray-600">
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
                className="rounded-2xl p-7 md:p-9 backdrop-blur-sm shadow-xl bg-white border border-gray-200 shadow-gray-300"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-7 text-gray-900">
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
                      className="w-full px-4 py-3.5 rounded-lg focus:border-primary focus:outline-none transition bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3.5 rounded-lg focus:border-primary focus:outline-none transition bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
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
                      className="w-full px-4 py-3.5 rounded-lg focus:border-primary focus:outline-none transition bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                    />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subject"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3.5 rounded-lg focus:border-red-500 focus:outline-none transition bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
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
                    className="w-full px-4 py-3.5 rounded-lg focus:border-primary focus:outline-none resize-none transition bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                  />

                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                    theme="light"
                  />

                  <button
                    type="submit"
                    disabled={loading || !captchaValue}
                    className={`w-full py-4 btn-primary text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 ${
                      loading || !captchaValue
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:opacity-95 hover:-translate-y-0.5"
                    }`}
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
                className="rounded-2xl overflow-hidden shadow-xl h-80 md:h-96 border border-gray-200"
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#F8F5F0]">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "What is AI KNOTS?",
                a: "AI KNOTS is a business automation platform designed to streamline operations, automate repetitive tasks, and improve digital workflows.",
              },
              {
                q: "Who can use AI KNOTS?",
                a: "It is ideal for small and medium-sized businesses that want to save time, reduce manual effort, and scale their operations efficiently.",
              },
              {
                q: "Can AI KNOTS integrate with other systems?",
                a: "Yes, AI KNOTS can be connected with other business tools and systems to support a more connected workflow.",
              },
              {
                q: "Do you provide ongoing support?",
                a: "Yes, we offer training, monitoring, optimization, and continued assistance after implementation.",
              },
              {
                q: "Can you also help with marketing and SEO?",
                a: "Absolutely. We provide SEO, social media marketing, paid advertising, and website strategies that support business growth.",
              },
              {
                q: "What industries do you serve?",
                a: "We support businesses across healthcare, education, real estate, retail, finance, manufacturing, hospitality, and startups.",
              },
            ].map((item, index) => (
              <details
                key={index}
                className="bg-white border border-[#DED5CA] rounded-3xl group"
              >
                <summary className="px-4 sm:px-8 py-5 sm:py-6 font-medium flex justify-between items-center cursor-pointer list-none gap-4">
                  <span>{item.q}</span>
                  <span className="text-2xl text-[#8B6B4A] group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-4 sm:px-8 pb-6 sm:pb-8 text-[#6C6259] leading-relaxed border-t border-[#DED5CA]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2F2A26] text-white py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={logoImage}
                  alt="AI Knots IT Solution logo"
                  className="w-10 h-10 rounded-2xl object-contain bg-white shadow-sm"
                />
                <span className="font-bold text-xl">AI Knots IT Solution</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Premium websites, AI automation, SEO, mobile apps, digital
                marketing, and custom software for ambitious businesses.
              </p>

              {/* Social Icons */}
              <div className="flex gap-3 mt-8">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-5 text-sm tracking-widest text-white/60">
                QUICK LINKS
              </h3>
              <div className="space-y-3 text-white/70">
                <a href="#home" className="block hover:text-white transition">
                  Home
                </a>
                <a
                  href="#services"
                  className="block hover:text-white transition"
                >
                  Services
                </a>
                <a
                  href="#portfolio"
                  className="block hover:text-white transition"
                >
                  Portfolio
                </a>
                <a href="#about" className="block hover:text-white transition">
                  About
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold mb-5 text-sm tracking-widest text-white/60">
                SERVICES
              </h3>
              <div className="space-y-3 text-white/70">
                <a
                  href="#services"
                  className="block hover:text-white transition"
                >
                  Website Development
                </a>
                <a
                  href="#services"
                  className="block hover:text-white transition"
                >
                  AI Automation
                </a>
                <a
                  href="#services"
                  className="block hover:text-white transition"
                >
                  SEO Optimization
                </a>
                <a
                  href="#services"
                  className="block hover:text-white transition"
                >
                  Mobile Apps
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-5 text-sm tracking-widest text-white/60">
                CONTACT
              </h3>
              <div className="space-y-3 text-white/70">
                <a
                  href="tel:+917869636070"
                  className="block hover:text-white transition"
                >
                  +91 9630466070
                </a>
                <a
                  href="mailto:Support@aiknotsit.com"
                  className="block hover:text-white transition"
                >
                  Support@aiknotsit.com
                </a>
                <a
                  href="#contact"
                  className="block hover:text-white transition"
                >
                  Book consultation
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-16 pt-8 text-center text-white/50 text-sm">
            © 2026 AI Knots IT Solution. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landingpage;
