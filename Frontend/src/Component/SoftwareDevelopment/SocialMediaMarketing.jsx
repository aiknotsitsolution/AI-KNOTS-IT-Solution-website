import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Pin,
  BarChart3,
  Megaphone,
  Target,
  Users,
  Calendar,
  Zap,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { HashLink } from "react-router-hash-link";
const images = {
  hero: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=2340", // High quality social media dashboard
  growth:
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2340&q=80",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const platforms = [
  {
    icon: Facebook,
    title: "Facebook",
    desc: "We help your business build a strong presence on Facebook through engaging posts, ads, and community interaction.",
  },
  {
    icon: Instagram,
    title: "Instagram",
    desc: "From reels to creatives, we make your brand visually attractive and engaging for today’s audience.",
  },
  {
    icon: Linkedin,
    title: "LinkedIn",
    desc: "Perfect for B2B growth—build professional credibility and connect with the right business audience.",
  },
  {
    icon: Twitter,
    title: "Twitter (X)",
    desc: "Stay relevant with trending conversations and real-time engagement strategies.",
  },
  {
    icon: Youtube,
    title: "YouTube",
    desc: "We help you grow through video marketing, content strategy, and audience engagement.",
  },
  {
    icon: Pin,
    title: "Pinterest",
    desc: "Drive traffic and brand discovery through creative visual content.",
  },
];

const tools = ["Buffer", "Hootsuite", "Sprout Social", "Later", "Canva"];

const advantages = [
  {
    icon: Target,
    title: "Social Media Strategy",
    desc: "We create proper strategies based on your business goals, target audience, platform selection, content plan, and performance tracking.",
  },
  {
    icon: Zap,
    title: "Social Media Optimization (SMO)",
    desc: "We optimize your profiles with the right keywords, content, and posting strategy to increase reach and engagement.",
  },
  {
    icon: Megaphone,
    title: "Paid Social Media Promotions",
    desc: "We run targeted ads on platforms like Facebook, Instagram, and LinkedIn to generate leads and boost visibility.",
  },
  {
    icon: BarChart3,
    title: "Performance Marketing",
    desc: "We focus on results using data, analytics, and testing to improve conversions and ROI.",
  },
  {
    icon: Users,
    title: "Influencer Marketing",
    desc: "We collaborate with relevant influencers to build trust and reach the right audience.",
  },
  {
    icon: Calendar,
    title: "Organic Social Media Management",
    desc: "From content creation to posting and engagement, we manage everything to keep your brand active and growing.",
  },
];

const whyChoose = [
  "Customized strategies for every business",
  "Data-driven campaigns",
  "Transparent reporting",
  "Affordable pricing",
  "Focus on leads, sales, and growth",
];

const areas = [
  "MP Nagar",
  "Arera Colony",
  "Shahpura",
  "New Market",
  "Bairagarh",
  "Kolar",
  "Ayodhya Nagar",
  "Hoshangabad Road",
  "Gulmohar",
  "Bawadia Kalan",
];

const faqs = [
  {
    q: "What social media services do you offer in Bhopal?",
    a: "We offer complete services including content creation, social media management, paid ads, influencer marketing, and performance tracking.",
  },
  {
    q: "Why should I hire AI Knots IT Solutions?",
    a: "We provide customized strategies, real results, and transparent work focused on your business growth.",
  },
  {
    q: "Which platforms do you work on?",
    a: "We work on Facebook, Instagram, LinkedIn, Twitter (X), YouTube, and Pinterest.",
  },
  {
    q: "How long does it take to see results?",
    a: "You may start seeing engagement in a few weeks, while leads and conversions improve over time with consistent efforts.",
  },
  {
    q: "Do you provide local marketing for Bhopal businesses?",
    a: "Yes, we create geo-targeted campaigns to help you reach your local audience effectively.",
  },
  {
    q: "Do you handle both organic and paid marketing?",
    a: "Yes, we combine both strategies for better growth, visibility, and ROI.",
  },
];

export default function SocialMediaMarketing() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const [openFaq, setOpenFaq] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const accentClass = "text-accent";
  const headingClass = isDark ? "text-white" : "text-primary";
  const bodyClass = isDark ? "text-gray-300" : "text-primary";

  const cardClass = isDark
    ? "bg-gray-900/70 backdrop-blur-sm border border-gray-800 hover:border-primary/60 hover:shadow-[#8B6B4A]/30"
    : "bg-white border border-gray-200 hover:border-primary hover:shadow-2xl";

  const buttonClass = `px-12 py-6 rounded-full text-xl font-bold flex items-center gap-3 group shadow-xl ${
    isDark ? "btn-accent" : "btn-accent"
  }`;

  const serviceLink =
    "font-bold text-[#8B6B4A] hover:text-[#6B4F2A] transition-colors duration-200";

  return (
    <>
      <Helmet>
        <title>Social Media Marketing Bhopal | Atla IKS</title>
        <meta
          name="description"
          content="Boost your brand visibility with expert social media marketing services in Bhopal & India."
        />
        <meta
          name="keywords"
          content="Social Media Marketing Bhopal, Digital Marketing Agency, Social Media Management, Content Marketing, Paid Advertising, Influencer Marketing"
        />
      </Helmet>
      <div
        className={`min-h-screen overflow-hidden transition-colors duration-700
      ${isDark ? "bg-black text-white" : "bg-white text-primary"}`}
      >
        {/* ====================== HERO SECTION with Background Image ====================== */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={images.hero}
              alt="Social Media Marketing in Bhopal"
              className="w-full h-full object-cover brightness-50"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-br ${isDark ? "from-black/90 via-black/80 to-black/90" : "from-black/70 via-black/60 to-transparent"}`}
            />
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 max-w-6xl mx-auto text-center"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8 text-white"
            >
              Social Media Marketing Company in{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-acc to-[#8B6B4A]">
                Bhopal
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className={`text-2xl md:text-3xl font-bold mb-8 ${accentClass}`}
            >
              Real Engagement • Real Leads • Real Growth
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className={`text-lg md:text-xl max-w-5xl mx-auto leading-relaxed mb-12 ${
                isDark ? "text-gray-300" : "text-white/90"
              }`}
            >
              At{" "}
              <span className="font-semibold text-[#8B6B4A]">
                AI KNOTS IT SOLUTION
              </span>
              , we are one of the most trusted{" "}
              <HashLink
                smooth
                to="/socialmediamarketing#platforms"
                className={serviceLink}
              >
                Social Media Marketing
              </HashLink>{" "}
              agencies in{" "}
              <Link to="/contact" className={serviceLink}>
                Bhopal
              </Link>
              . We create powerful{" "}
              <HashLink
                smooth
                to="/socialmediamarketing#strategies"
                className={serviceLink}
              >
                strategies
              </HashLink>{" "}
              that deliver actual results — more{" "}
              <HashLink
                smooth
                to="/socialmediamarketing#platforms"
                className={serviceLink}
              >
                followers
              </HashLink>
              , better engagement, and quality leads.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <button
                className={buttonClass}
                onClick={() => navigate("/contact")}
              >
                Get Free Strategy Call
                <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
              </button>

              <button
                className={`px-12 py-6 border-2 border-[#8B6B4A] rounded-full text-xl font-bold transition-all ${
                  isDark
                    ? "text-accent hover:bg-black/60 hover:border-[#8B6B4A]"
                    : "text-muted hover:bg-muted border-[#8B6B4A] hover:border-[#8B6B4A] hover:text-white shadow-lg"
                }`}
              >
                Free Social Media Audit
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Platforms We Serve */}
        <section
          id="platforms"
          className={`py-24 px-4 sm:px-6 lg:px-8 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl md:text-6xl font-black text-center mb-16 ${headingClass}`}
            >
              Platforms We <span className={accentClass}>Master</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {platforms.map((plat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-3xl p-10 transition-all group ${cardClass}`}
                >
                  <plat.icon
                    className={`w-16 h-16 mb-8 mx-auto transition-transform group-hover:scale-110 ${accentClass}`}
                  />
                  <h3
                    className={`text-2xl font-bold mb-6 text-center ${headingClass}`}
                  >
                    {plat.title}
                  </h3>
                  <p className={`text-center leading-relaxed ${bodyClass}`}>
                    {plat.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools We Use */}
        <section
          className={`py-20 px-4 sm:px-6 lg:px-8 ${isDark ? "bg-black" : "bg-white"}`}
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl md:text-5xl font-black mb-12 ${headingClass}`}
            >
              Professional Tools We <span className={accentClass}>Use</span>
            </motion.h2>

            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {tools.map((tool, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`px-10 py-5 text-xl font-semibold rounded-2xl border transition-all
                  ${isDark ? "bg-gray-900 border-primary/30" : "bg-gray-100 border-gray-300"}`}
                >
                  {tool}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section
          id="strategies"
          className={`py-24 px-4 sm:px-6 lg:px-8 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl md:text-6xl font-black text-center mb-16 ${headingClass}`}
            >
              Why Choose <span className={accentClass}>AI Knots</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advantages.map((adv, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className={`rounded-3xl p-10 transition-all group ${cardClass}`}
                >
                  <adv.icon
                    className={`w-16 h-16 mb-8 mx-auto transition-transform group-hover:scale-110 ${accentClass}`}
                  />
                  <h3
                    className={`text-2xl font-bold mb-6 text-center ${headingClass}`}
                  >
                    {adv.title}
                  </h3>
                  <p className={`text-center leading-relaxed ${bodyClass}`}>
                    {adv.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us + Areas Served */}
        <section
          className={`py-24 px-4 sm:px-6 lg:px-8 ${isDark ? "bg-black" : "bg-gray-50"}`}
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl md:text-6xl font-black text-center mb-16 ${headingClass}`}
            >
              Why Bhopal Businesses Trust Us
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {whyChoose.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-3xl p-8 flex items-start gap-4 ${cardClass}`}
                >
                  <CheckCircle2
                    className={`w-8 h-8 mt-1 flex-shrink-0 ${accentClass}`}
                  />
                  <p className={`text-lg font-medium ${bodyClass}`}>{point}</p>
                </motion.div>
              ))}
            </div>

            {/* Areas We Serve */}
            <motion.h3
              className={`text-3xl font-bold text-center mb-10 ${isDark ? "text-[#9F714E]" : "text-[#9F714E]"}`}
            >
              Areas We Serve in{" "}
              <span
                className={`${isDark ? "text-[#9F714E]" : "text-[#9F714E]"}`}
              >
                Bhopal
              </span>
            </motion.h3>

            <div className="flex flex-wrap justify-center gap-4">
              {areas.map((area, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className={`px-6 py-3 rounded-full text-lg font-medium flex items-center gap-2 transition-all ${cardClass}`}
                >
                  <MapPin className={`w-5 h-5 ${accentClass}`} /> {area}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`py-24 px-4 sm:px-6 lg:px-8 ${isDark ? "bg-black" : "bg-gray-50"}`}
        >
          <div className="max-w-5xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl md:text-6xl font-black mb-8 ${headingClass}`}
            >
              Ready to Grow Your Brand on Social Media?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 ${bodyClass}`}
            >
              Let AI Knots IT Solutions help you build a powerful social media
              presence in Bhopal and beyond.
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`px-16 py-7 rounded-full text-2xl font-bold transition-all ${
                isDark
                  ? "bg-gradient-to-r from-[#8B6B4A] to-[#8B6B4A] hover:from-[#8B6B4A] hover:to-[#8B6B4A]"
                  : "bg-[#8B6B4A] hover:bg-[#8B6B4A] text-white"
              }`}
            >
              <button onClick={() => navigate("/contact")}>
                Get Started Today →
              </button>
            </motion.button>

            <p
              className={`mt-10 text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              📞 +91 9630466070 &nbsp; | &nbsp; Support@aiknotsit.com
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className={`py-20 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
        >
          <div className="max-w-4xl mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-4xl md:text-5xl font-bold text-center mb-12 ${
                isDark ? "text-white" : "text-[#573010]"
              }`}
            >
              Frequently Asked <span className="text-[#8B6B4A]">Questions</span>
            </motion.h2>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className={`group rounded-xl p-6 border ${
                    isDark
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <summary
                    className={`font-semibold text-lg cursor-pointer flex justify-between items-center gap-4 ${
                      isDark ? "text-white" : "text-[#573010]"
                    }`}
                  >
                    {faq.q}
                    <ChevronDown className="w-5 h-5 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
                  </summary>

                  <p
                    className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
        {/* Final CTA */}
      </div>
    </>
  );
}
