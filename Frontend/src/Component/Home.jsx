import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import FlowManagementSystem from "../assets/Images/Icon/flow management system.webp";
import AmazonModel from "../assets/Images/Icon/Amazon-Model.webp";
import DelegationTaskAssignment from "../assets/Images/Icon/Delegation Task Assignment.webp";
import RepetitiveTaskAssignment from "../assets/Images/Icon/Repeatative-Task-Assignment.webp";
import HelpTicketSystem from "../assets/Images/Icon/Help-Ticket-System-1.webp";
import AuditorModule from "../assets/Images/Icon/amazonmodel.webp";
import Helpticket from "../assets/Images/Icon/Help ticket system.webp";
import paymentcollectionengine from "../assets/Images/Icon/paymentcollectionengine.webp";
import AutomatedScoring from "../assets/Images/Icon/AutomatedScoring.webp";
import KRAKPI from "../assets/Images/Icon/KRAKPI.webp";
import intranet from "../assets/Images/Icon/intranet.webp";
import RunoAPIIntegrated from "../assets/Images/Icon/RunoAPIIntegrated.webp";
import AIPoweredDelegation from "../assets/Images/Icon/AIPoweredDelegation.webp";
import ProjectManagementSystem from "../assets/Images/Icon/ProjectManagementSystem.webp";
import QuickLaunch from "../assets/Images/Icon/QuickLaunch.webp";
import LeaveRegister from "../assets/Images/Icon/LeaveRegister.webp";
import HiringFMS from "../assets/Images/Icon/image1.webp";
import AutoTaskReminders from "../assets/Images/Icon/AutoTaskReminders2.webp";
import dashboard from "../assets/Images/Icon/dashboard5.webp";
import {
  Check,
  ArrowRight,
  Users,
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  Shield,
  Layers,
  Star,
  Zap,
  ChevronDown,
  CheckCircle2Icon,
} from "lucide-react";
import ATLAknotsDark2 from "../assets/Images/Robot2.gif";
import { useTheme } from "../context/ThemeContext";

// Counter Component
const Counter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
  const suffix = value.replace(/[0-9,]/g, "");

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = numericValue / (duration * 60);
    const interval = setInterval(
      () => {
        start += increment;
        if (start >= numericValue) {
          setCount(numericValue);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start));
        }
      },
      (duration * 1000) / (numericValue / increment),
    );

    return () => clearInterval(interval);
  }, [isInView, numericValue, duration]);

  return (
    <div ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </div>
  );
};

const Home = () => {
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState("operations");
  const [activeIndustryTab, setActiveIndustryTab] = useState("All");
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const clientLogos = [
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/1.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/2.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/3.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/4.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/5.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/6.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/7.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/8.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/9.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2023/04/10.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2025/03/16.png",
    "https://cdn-jdbol.nitrocdn.com/stMslhZcyTrQKwaudxVanuuJFlvCrYOu/assets/images/optimized/rev-3eef2b7/midigitalautopilot.com/wp-content/uploads/2025/03/17.png",
  ];

  const industries = [
    "Agriculture",
    "Construction",
    "Design & Marketing",
    "Arts & Crafts",
    "Automotive",
    "Gems & Jewellery",
    "Jute Industry",
    "Logistic",
    "Manufacturing",
    "Marbles & Tiles",
    "Packaging",
    "Training Institute",
    "Solar",
    "Textile",
    "Trader",
    "Electronics",
    "Finance & Insurance",
    "Food & Beverages",
    "Healthcare",
    "Pharma",
    "Real Estate",
  ];

  const benefits = [
    {
      title: "Increased Efficiency",
      description:
        "AI KNOTS automates repetitive tasks, freeing up your team to focus on high-value work.",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: "Time & Cost Savings",
      description:
        "By streamlining processes and reducing manual errors, AI KNOTS saves you time and money.",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: "Improve Scalability",
      description:
        "By automating repetitive tasks and optimizing workflows, AI KNOTS empowers your business to scale.",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "Error Reduction",
      description:
        "AI KNOTS's automation minimizes human error, ensuring accuracy and reliability.",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "Enhance Productivity",
      description:
        "Optimizes workflows, increasing productivity and improving overall performance.",
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      title: "Streamline Process",
      description:
        "Simplify your complex business processes with AI KNOTS automation system.",
      icon: <Settings className="w-6 h-6" />,
    },
    {
      title: "Full Audibility and Tracking",
      description:
        "Track progress with complete visibility into your operations.",
      icon: <Layers className="w-6 h-6" />,
    },
    {
      title: "Improve Customer Experience",
      description:
        "Deliver better products and services by streamlining processes.",
      icon: <Users className="w-6 h-6" />,
    },
  ];

  const allFeatures = [
    {
      title: "Flow Management System",
      desc: "Create and deploy a new task flow system in just 5 minutes...",
      category: "operations",
      icon: FlowManagementSystem,
      link: "/service",
    },
    {
      title: "Development",
      desc: "Get custom software development services tailored to your unique business needs...",
      category: "operations",
      icon: AmazonModel,
      link: "/software",
    },
    {
      title: "Testing",
      desc: "Ensure your software is reliable and bug-free...",
      category: "operations",
      icon: DelegationTaskAssignment,
      link: "/service",
    },
    {
      title: "L2 Support",
      desc: "Our dedicated L2 support team provides expert assistance...",
      category: "operations",
      icon: RepetitiveTaskAssignment,
      link: "/contact",
    },
    {
      title: "Product Assistance",
      desc: "Our product assistance services offer expert guidance...",
      category: "operations",
      icon: HelpTicketSystem,
      link: "/productforsells",
    },
    {
      title: "Search Engine Optimization (SEO)",
      desc: "Boost your online visibility...",
      category: "operations",
      icon: AuditorModule,
      link: "/seo",
    },
    {
      title: "Social Media Marketing",
      desc: "Engage your audience...",
      category: "operations",
      icon: intranet,
      link: "/socialmediamarketing",
    },
    {
      title: "Google & Meta Ads Management",
      desc: "Maximize your advertising ROI...",
      category: "operations",
      icon: "🏬",
      link: "/paidadv",
    },
    {
      title: "Voice, Chat & Email Bot",
      desc: "Enhance customer engagement...",
      category: "operations",
      icon: paymentcollectionengine,
      link: "/ai-mlservice",
    },
    {
      title: "Cataloguing & Enrichment",
      desc: "Organize and enhance your product data...",
      category: "operations",
      icon: AutomatedScoring,
      link: "/service",
    },
    {
      title: "Quality Assurance",
      desc: "Ensure your software is reliable...",
      category: "operations",
      icon: AutoTaskReminders,
      link: "/service",
    },
    {
      title: "HRMS & Payroll",
      desc: "Streamline your human resources...",
      category: "Software",
      icon: "👥",
      link: "/software",
    },
    {
      title: "CRM Integration",
      desc: "Integrate your customer relationship management...",
      category: "Software",
      icon: AutoTaskReminders,
      link: "/service",
    },
    {
      title: "Billing & Payment Reminders",
      desc: "Send automated WhatsApp messages...",
      category: "Software",
      icon: FlowManagementSystem,
      link: "/software",
    },
    {
      title: "AI ChatBot",
      desc: "Interact with your customers in a personalized way...",
      category: "Software",
      icon: "🤖",
      link: "/ai-mlservice",
    },
  ];

  const lovedFeatures = [
    {
      title: "Next Level Delegation",
      desc: "AI KNOTS's Next Level Delegation System makes task assignment easy...",
      icon: "🎯",
    },
    {
      title: "Compliance Checklist",
      desc: "Ensures all your processes meet required standards...",
      icon: "✅",
    },
    {
      title: "Flow Management System",
      desc: "Enables seamless coordination of a single process...",
      icon: "🌊",
    },
    {
      title: "Amazon Model",
      desc: "Send step-by-step updates to your customers on WhatsApp...",
      icon: "📦",
    },
    {
      title: "Advanced & Robust Split FMS",
      desc: "Allows seamless task handovers between workflows...",
      icon: "⚡",
    },
    {
      title: "Attendance Management System",
      desc: "Keeping track of employee attendance is simplified...",
      icon: "📅",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Process Mapping & Design",
      desc: "Our experts work closely with you to map out your existing workflows...",
    },
    {
      step: "02",
      title: "Software Implementation",
      desc: "Our team seamlessly integrates AI KNOTS into your existing systems...",
    },
    {
      step: "03",
      title: "Training & Support",
      desc: "We provide comprehensive training to your staff...",
    },
    {
      step: "04",
      title: "Monitoring & Optimization",
      desc: "We continuously monitor AI KNOTS's performance...",
    },
    {
      step: "05",
      title: "Customization",
      desc: "If your process is not fulfilled by any of our existing features...",
    },
  ];

  const testimonials = [
    {
      rating: 5,
      content:
        "A reliable digital marketing partner. AI Knots understands business needs...",
      author: "Swadesh Jyoti Lalwani",
    },
    {
      rating: 5,
      content: "Working with AI Knots has been a great decision...",
      author: "Pathik Shah",
    },
    {
      rating: 5,
      content: "AI Knots has helped us improve our digital visibility...",
      author: "Bharat e-Filing",
    },
  ];

  const categories = [
    {
      title: "Agriculture & Allied",
      icon: "🌾",
      industries: [
        "Agriculture",
        "Construction",
        "Design & Marketing",
        "Arts & Crafts",
        "Automotive",
        "Gems & Jewellery",
        "Jute Industry",
      ],
    },
    {
      title: "Logistics & Manufacturing",
      icon: "🏭",
      industries: [
        "Logistic",
        "Manufacturing",
        "Marbles & Tiles",
        "Packaging",
        "Training Institute",
        "Solar",
        "Textile",
      ],
    },
    {
      title: "Trade & Financial Services",
      icon: "📊",
      industries: [
        "Trader",
        "Electronics",
        "Finance & Insurance",
        "Food & Beverages",
        "Healthcare",
        "Pharma",
        "Real Estate",
      ],
    },
  ];

 const faqs = [
  {
    q: "What is AI KNOTS and how does it help businesses?",
    a: "AI KNOTS is an AI-powered automation platform that streamlines marketing and business operations. It helps companies automate repetitive tasks, manage WhatsApp and Email conversations, improve response times, and scale customer engagement efficiently.",
  },
  {
    q: "Which communication channels does AI KNOTS support?",
    a: "AI KNOTS currently supports WhatsApp and Email integration. Businesses can send automated messages, handle customer queries, run marketing campaigns, and manage all conversations from one unified dashboard.",
  },
  {
    q: "Who should use AI KNOTS?",
    a: "AI KNOTS is designed for small and medium-sized businesses across industries like manufacturing, retail, healthcare, finance, education, and services. Any company that uses WhatsApp or Email for customer communication can benefit from it.",
  },
  {
    q: "Can AI KNOTS integrate with my existing tools?",
    a: "Yes. AI KNOTS offers powerful API integrations that allow seamless connection with CRMs, ERPs, e-commerce platforms, and other business tools, ensuring smooth data flow and complete automation.",
  },
  {
    q: "Does AI KNOTS provide customer support and training?",
    a: "Absolutely. AI KNOTS comes with dedicated customer support, onboarding assistance, training sessions, and detailed documentation to help your team quickly adopt the platform and achieve maximum results.",
  },
];

  const getFilteredFeatures = () =>
    allFeatures.filter((f) => f.category === activeFeatureTab);

  // For Bold Text Link
  const serviceLink =
    "font-bold text-[#8B6B4A] hover:text-[#6B4F2A] transition-colors duration-200";

  return (
    <div
      className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-700
      ${isDark ? "bg-gray-950 text-white" : "bg-white text-[#3d220e]"}`}
    >
      {/* HERO SECTION */}
      <section
        className={`relative min-h-screen flex items-center px-6 pt-8 pb-16 overflow-hidden
    ${
      isDark
        ? "bg-gradient-to-br from-gray-900 via-black to-gray-950"
        : "bg-gradient-to-br from-[#e2d7a4] via-[#f9efe1] to-[#b8a790]"
    }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B6B4A]/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${
                isDark ? "text-white" : "text-[#3d220e]"
              }`}
            >
              Transform Your Ideas Into{" "}
              <span className="text-[#8B6B4A]">Intelligent Solutions!</span>
            </h1>

            <ul
              className={`space-y-4 text-lg md:text-xl ${isDark ? "text-gray-200" : "text-[#3d220e]"}`}
            >
              {[
                "Automate Repetitive Tasks",
                "Streamline Workflows",
                "Manage Inventory Hassle-Free",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-[#8B6B4A]" : "bg-[#3d220e]"} text-white`}
                  >
                    <Check className="w-5 h-5" />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/contact")}
                className={`px-8 py-4 rounded-full font-semibold text-lg transition flex items-center gap-2 shadow-lg
                  ${isDark ? "bg-[#8B6B4A] hover:bg-[#a17d5f] text-white" : "bg-[#3d220e] hover:bg-[#5c4635] text-white"}`}
              >
                Schedule a demo <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <img
              src={dashboard}
              alt="AI KNOTS Dashboard"
              className="rounded-2xl w-full max-w-[600px]"
            />
          </motion.div>
        </div>
      </section>

      {/* About Us + Stats */}
      <section
        className={`py-20 overflow-hidden ${isDark ? "bg-gray-950" : "bg-[#f9efe1]"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2
                className={`text-4xl md:text-5xl font-bold leading-tight mb-10 ${isDark ? "text-white" : "text-[#462206]"}`}
              >
                About Us
              </h2>
              <ul className="space-y-6">
                {[
                  "Empowering businesses with innovative, scalable, and result-driven technology solutions.",
                  "Specializing in Website Development, Digital Marketing, HRMS, CRM, and Business Automation.",
                  "Helping organizations improve operational efficiency and strengthen their digital presence.",
                  "Delivering strategic and technology-driven solutions that create measurable business impact.",
                  "Building long-term partnerships through exceptional service, quality, and innovation.",
                  "Enabling businesses to achieve sustainable growth and stay ahead in a rapidly evolving marketplace.",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 items-start group"
                  >
                    <span
                      className={`text-2xl ${isDark ? "text-[#8B6B4A]" : "text-[#93460c]"}`}
                    >
                      ✓
                    </span>
                    <p
                      className={`${isDark ? "text-gray-300" : "text-[#72441e]"} leading-relaxed font-medium`}
                    >
                      {item ===
                      "Empowering businesses with innovative, scalable, and result-driven technology solutions." ? (
                        <>
                          Empowering businesses with innovative,{" "}
                          <HashLink
                            smooth
                            to="/#business-process-benefits"
                            className={serviceLink}
                          >
                            scalable
                          </HashLink>
                          , and result-driven technology solutions.
                        </>
                      ) : item ===
                        "Specializing in Website Development, Digital Marketing, HRMS, CRM, and Business Automation." ? (
                        <>
                          Specializing in{" "}
                          <Link
                            to="/websitedesigndevelopment"
                            className={serviceLink}
                          >
                            Website Development
                          </Link>
                          ,{" "}
                          <Link to="/digital-marketing" className={serviceLink}>
                            Digital Marketing
                          </Link>
                          ,{" "}
                          <Link to="/software" className={serviceLink}>
                            HRMS
                          </Link>
                          ,{" "}
                          <Link to="/service" className={serviceLink}>
                            CRM
                          </Link>
                          , and{" "}
                          <Link to="/ai-mlservice" className={serviceLink}>
                            Business Automation
                          </Link>
                          .
                        </>
                      ) : (
                        item
                      )}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src={ATLAknotsDark2}
                alt="AI KNOTS Story"
                className="rounded-3xl w-full"
              />
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2
                  className={`text-4xl font-bold leading-tight mb-6 ${isDark ? "text-white" : "text-[#462206]"}`}
                >
                  Automate Your Complex Business Process AI KNOTS
                </h2>
                <p
                  className={`${isDark ? "text-gray-400" : "text-[#72441e]"} leading-relaxed text-lg`}
                >
                  More work. Less stress! AI KNOTS is the ultimate solution to
                  streamline and automate your marketing and business
                  operations.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { number: "220+", label: "Live Setup" },
                  { number: "12,230+", label: "Users" },
                  { number: "2,715+", label: "Live FMS" },
                  {
                    number: "26,000+",
                    label: "Delegation Processed (Avg Monthly)",
                  },
                  {
                    number: "316K+",
                    label: "Checklist Processed (Avg Monthly)",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className={`rounded-2xl p-6 transition-colors ${isDark ? "bg-gray-900 hover:bg-gray-800" : "bg-[#f8e1cf] hover:bg-[#FFF6EF]"}`}
                  >
                    <div
                      className={`text-4xl font-bold mb-1 ${isDark ? "text-[#8B6B4A]" : "text-[#462206]"}`}
                    >
                      <Counter value={stat.number} />
                    </div>
                    <div
                      className={`${isDark ? "text-gray-400" : "text-[#7a5e46]"} font-medium`}
                    >
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES TABS SECTION */}
      <section className={`py-12 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-3xl md:text-4xl font-bold text-center mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Our <span className="text-[#8B6B4A]">Features</span>
          </motion.h2>
          <p
            className={`text-center mb-8 max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-[#72441e]"}`}
          >
            Discover the powerful tools that make AI KNOTS the ultimate business
            automation solution
          </p>

          <div className="flex justify-center mb-8">
            <div
              className={`inline-flex rounded-full p-1 shadow-sm border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              {["operations", "Software"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFeatureTab(tab)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all text-sm ${
                    activeFeatureTab === tab
                      ? isDark
                        ? "bg-[#8B6B4A] text-white"
                        : "bg-[#3d220e] text-white"
                      : isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab === "operations" ? "Operations" : "Software"}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={activeFeatureTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {getFilteredFeatures().map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                onClick={() => feature.link && navigate(feature.link)}
                className={`rounded-3xl p-4 group cursor-pointer h-full transition-all duration-300 ${
                  isDark
                    ? "bg-gray-900 hover:bg-gray-800"
                    : "bg-[#f4ecec] hover:bg-[#FFF6EF]"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-none h-24 w-24 flex items-center justify-center text-5xl overflow-hidden">
                    {typeof feature.icon === "string" &&
                    /\.(png|jpe?g|gif|svg|webp)$/i.test(feature.icon) ? (
                      <img
                        src={feature.icon}
                        alt={feature.title}
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <div className="text-6xl">{feature.icon}</div>
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold mb-1 transition-colors ${isDark ? "text-white group-hover:text-[#8B6B4A]" : "text-[#573010] group-hover:text-[#8B6B4A]"}`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`${isDark ? "text-gray-400" : "text-[#9d6231]"} leading-snug text-sm`}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MOST LOVED FEATURES */}
      <section className={`py-20 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-5xl font-bold text-center mb-6 ${isDark ? "text-white" : "text-black"}`}
          >
            Most <span className="text-[#8B6B4A]">Loved</span> Features
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lovedFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`rounded-3xl p-8 transition-all ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100"}`}
              >
                <h3
                  className={`text-2xl font-semibold mb-3 flex items-center gap-2 ${isDark ? "text-white" : "text-[#573010]"}`}
                >
                  <CheckCircle2Icon className="w-5 h-5 text-[#8B6B4A]" />{" "}
                  {feature.title}
                </h3>
                <p className={`${isDark ? "text-gray-400" : "text-[#9d6231]"}`}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section
        className={`py-12 px-4 sm:px-6 lg:px-8 ${isDark ? "bg-gray-950" : "bg-gradient-to-br from-slate-50 via-white to-[#f9efe1]"}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className={`text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "text-[#573010]"}`}
            >
              Industries We Serve In
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}
              >
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{category.icon}</div>
                    <h3
                      className={`text-xl font-bold ${isDark ? "text-white" : "text-[#573010]"}`}
                    >
                      {category.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2.5">
                    {category.industries.map((ind, i) => (
                      <span
                        key={i}
                        className={`inline-flex px-3.5 py-1.5 rounded-full text-sm ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-[#573010]"}`}
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section
        id="business-process-benefits"
        className={`scroll-mt-24 py-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-5xl font-bold text-center mb-12 ${isDark ? "text-white" : "text-[#573010]"}`}
          >
            Benefits Of Business Process Automation By{" "}
            <span className="text-[#8B6B4A]">AI KNOTS</span>
          </motion.h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-6 transition-all ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100"}`}
              >
                <h3
                  className={`mb-3 text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  <Check className="w-5 h-5 text-[#8B6B4A]" /> {benefit.title}
                </h3>
                <p className={`${isDark ? "text-gray-400" : "text-[#573010]"}`}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className={`py-20 ${isDark ? "bg-gray-950" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-5xl font-bold text-center mb-6 ${isDark ? "text-white" : "text-[#573010]"}`}
          >
            Our Process & Approach
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-8 transition-all ${isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-white"}`}
              >
                <div
                  className={`text-6xl font-bold mb-4 ${isDark ? "text-gray-700" : "text-[#ead9cb]"}`}
                >
                  {step.step}
                </div>
                <h3
                  className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-[#573010]"}`}
                >
                  {step.title}
                </h3>
                <p className={`${isDark ? "text-gray-400" : "text-[#573010]"}`}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={`py-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-5xl font-bold text-center mb-12 ${isDark ? "text-white" : "text-[#573010]"}`}
          >
            What Our Clients Say?
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-6 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100"}`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {t.content}
                </p>
                <p
                  className={`mt-6 font-semibold ${isDark ? "text-white" : "text-[#573010]"}`}
                >
                  {t.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
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

                  <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-open:rotate-180 text-[#8B6B4A]" />
                </summary>

                <p
                  className={`mt-4 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
