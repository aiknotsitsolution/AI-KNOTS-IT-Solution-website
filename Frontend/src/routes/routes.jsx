import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Layout
import MainLayout from "../Component/Layout"; // Your existing Layout

// Pages / Components
import Home from "../Component/Home";
const About = lazy(() => import("../Component/About"));
const Service = lazy(() => import("../Component/Service"));
const Contact = lazy(() => import("../Component/Contact"));
const MobileOnboarding = lazy(() => import("../Component/Mobile/Mobilebraing"));
const FitnessApp = lazy(() => import("../Component/Mobile/Fitnessapplanding"));
const Technology = lazy(() => import("../Technology/Technology"));
const TechNews = lazy(() => import("../Technology/TechNews"));
const TechnologyDetail = lazy(() => import("../Technology/TechnologyDetail"));
const RecentWork = lazy(() => import("../Component/Recentwork/Recentwork"));
const CareerPage = lazy(() => import("../Component/Carrer/Carrerpage"));
const Gallery = lazy(() => import("../Gallery/Gallery"));
const Portfolio = lazy(() => import("../Component/Portfolio/Portfolio"));
const Blog = lazy(() => import("../Component/Blog/Blog"));
const BlogDetail = lazy(() => import("../Component/Blog/BlogDetail"));
const DigitalMarketing = lazy(
  () => import("../Component/DigitalMarketing/DigitalMarketing"),
);
const SEO = lazy(() => import("../Component/DigitalMarketing/SEO"));
const GraphicDesigning = lazy(() => import("../Component/Graphic/Graphic"));
const SoftwareDevelopment = lazy(
  () => import("../Component/SoftwareDevelopment/SoftwareDevelopment"),
);
const MobileAppDevelopment = lazy(
  () => import("../Component/SoftwareDevelopment/MobileAppDevelopment"),
);
const ERPDevelopment = lazy(
  () => import("../Component/SoftwareDevelopment/ERPDevelopment"),
);
const EcommerceDevelopment = lazy(
  () => import("../Component/SoftwareDevelopment/EcommerceDevelopment"),
);
const CloudSolutions = lazy(
  () => import("../Component/SoftwareDevelopment/CloudSolutions"),
);
const AIServices = lazy(
  () => import("../Component/SoftwareDevelopment/AIServices"),
);
const PaidAdv = lazy(() => import("../Component/PaidAdvatisment/PaidAdv"));
const LocalMarketing = lazy(
  () => import("../Component/LocalMarketing/LocalMarketing"),
);
const SocialMediaMarketing = lazy(
  () => import("../Component/SoftwareDevelopment/SocialMediaMarketing"),
);
const ContentWritingBranding = lazy(
  () => import("../Component/Design/ContentWritingBranding"),
);
const WebsiteDesignDevelopment = lazy(
  () => import("../Component/Design/WebsiteDesignDevelopment"),
);
const UiUxDesign = lazy(() => import("../Component/Design/UiUxDesign"));
const PrivacyPolicy = lazy(
  () => import("../Component/PrivacyPolicy/PrivacyPolicy"),
);
const CookiePolicy = lazy(
  () => import("../Component/CookiePolicy/CookiePolicy"),
);
const TermsOfService = lazy(
  () => import("../Component/TermsOfService/TermsOfService"),
);
const Landingpage = lazy(() => import("../Component/Landingpage/Landingpage"));

const lazyElement = (Component) => (
  <Suspense fallback={<div className="min-h-screen" />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/landingpage",
    element: lazyElement(Landingpage),
  },
  {
    path: "/",
    element: <MainLayout />,

    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "about", element: lazyElement(About) },
      { path: "service", element: lazyElement(Service) },
      { path: "contact", element: lazyElement(Contact) },

      // Mobile & Fitness
      { path: "mobile", element: lazyElement(FitnessApp) },
      { path: "mobile-onboarding", element: lazyElement(MobileOnboarding) },
      { path: "fitness", element: lazyElement(FitnessApp) },

      // Technology
      { path: "technology", element: lazyElement(Technology) },
      { path: "technews", element: lazyElement(TechNews) },
      { path: "technology/:slug", element: lazyElement(TechnologyDetail) },

      // Work & Career
      { path: "recentwork", element: lazyElement(RecentWork) },
      { path: "careers", element: lazyElement(CareerPage) },
      { path: "gallery", element: lazyElement(Gallery) },
      { path: "portfolio", element: lazyElement(Portfolio) },

      // Blog
      { path: "blog", element: lazyElement(Blog) },
      { path: "blog/:slug", element: lazyElement(BlogDetail) },

      // Services
      { path: "digital-marketing", element: lazyElement(DigitalMarketing) },
      { path: "seo", element: lazyElement(SEO) },
      { path: "graphics", element: lazyElement(GraphicDesigning) },
      { path: "graphicdesign", element: lazyElement(GraphicDesigning) },

      { path: "software", element: lazyElement(SoftwareDevelopment) },
      { path: "mobiledevelopment", element: lazyElement(MobileAppDevelopment) },
      { path: "erpdevelopment", element: lazyElement(ERPDevelopment) },
      {
        path: "ecommercedevelopment",
        element: lazyElement(EcommerceDevelopment),
      },
      { path: "cloudsolutions", element: lazyElement(CloudSolutions) },
      { path: "ai-mlservice", element: lazyElement(AIServices) },

      { path: "paidadv", element: lazyElement(PaidAdv) },
      { path: "localmarketing", element: lazyElement(LocalMarketing) },
      {
        path: "socialmediamarketing",
        element: lazyElement(SocialMediaMarketing),
      },

      {
        path: "contentwritingbranding",
        element: lazyElement(ContentWritingBranding),
      },
      {
        path: "websitedesigndevelopment",
        element: lazyElement(WebsiteDesignDevelopment),
      },
      { path: "uidesign", element: lazyElement(UiUxDesign) },

      // Legal Pages
      { path: "privacypolicy", element: lazyElement(PrivacyPolicy) },
      { path: "cookiepolicy", element: lazyElement(CookiePolicy) },
      { path: "termsofservice", element: lazyElement(TermsOfService) },
    ],
  },
]);

// For Sitemap / SEO
export const routeList = [
  "/",
  "/about",
  "/service",
  "/contact",
  "/technology",
  "/technews",
  "/careers",
  "/recentwork",
  "/portfolio",
  "/gallery",
  "/blog",
  "/digital-marketing",
  "/seo",
  "/graphics",
  "/software",
  "/mobiledevelopment",
  "/erpdevelopment",
  "/ecommercedevelopment",
  "/cloudsolutions",
  "/ai-mlservice",
  "/socialmediamarketing",
  "/websitedesigndevelopment",
  "/uidesign",
  "/privacypolicy",
  "/termsofservice",
  "/landingpage",
  // Add more dynamic routes if needed
];
