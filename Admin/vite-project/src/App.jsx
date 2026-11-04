// src/App.jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/authLogin/Login";
import Layout from "./Component/Layout";
import ProtectedRoute from "./Component/ProtectedRoute";
import AdminRoute from "./Component/AdminRoute";

const ForgotPassword = lazy(() => import("./Pages/authLogin/ForgotPassword"));
const Dashboard = lazy(() => import("./Pages/authLogin/Dashboard"));
const Profile = lazy(() => import("./Pages/authLogin/Profile"));
const Register = lazy(() => import("./Pages/authLogin/Register"));
const VerifyEmail = lazy(() => import("./Pages/authLogin/VerifyEmail"));
const Users = lazy(() => import("./Pages/authLogin/Users"));
const Createpost = lazy(() => import("./Pages/Home/Createpost"));
const ProductList = lazy(() => import("./Pages/product/ProductList"));
const ContactList = lazy(() => import("./Pages/contact/Contact"));
const Category = lazy(() => import("./Pages/category/category"));
const TechNews = lazy(() => import("./Pages/TechNews/TechNews"));
const TechCategory = lazy(() => import("./Pages/technology/category"));
const Technology = lazy(() => import("./Pages/technology/technology"));
const QueriesTable = lazy(() => import("./Pages/query/QueriesTable"));
const CategoryBlog = lazy(() => import("./Pages/Home/category/category"));
const Gallery = lazy(() => import("./Pages/gallery/Gallery"));
const Portfolio = lazy(() => import("./Pages/Portfolio/Portfolio"));
const PortfolioCategory = lazy(
  () => import("./Pages/Portfolio/categoryPortfolio/PortfolioCategory"),
);
const CreateJob = lazy(() => import("./Pages/createjob/CreateJob"));
const EditJob = lazy(() => import("./Pages/createjob/EditJob"));
const AdminJobs = lazy(() => import("./Pages/createjob/AdminJob"));
const JobCategory = lazy(() => import("./Pages/applyjobcategory/jobCategory"));
const JobApplications = lazy(() => import("./Pages/createjob/JobApplications"));
const ProductAdmin = lazy(
  () => import("./Pages/technology/Product/Productadmin"),
);
const Recentworkcategory = lazy(
  () => import("./Pages/recentwork/recentworkcategory"),
);
const Recentwork = lazy(() => import("./Pages/recentwork/recentwork"));

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-screen items-center justify-center text-sm text-slate-500"
          >
            Loading page...
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />

          {/* Protected routes - wrapped with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route element={<AdminRoute />}>
                <Route path="/users" element={<Users />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route path="/homepage" element={<Createpost />} />
              <Route path="/getpost" element={<ProductList />} />
              <Route path="/contact" element={<ContactList />} />
              <Route path="/category" element={<Category />} />
              <Route path="/techcreate" element={<TechNews />} />
              <Route path="/techcategory" element={<TechCategory />} />
              <Route path="/technology" element={<Technology />} />
              <Route path="/blogcategory" element={<CategoryBlog />} />
              <Route path="/queries" element={<QueriesTable />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/portfoliocategory" element={<PortfolioCategory />} />
              <Route path="/portfolio" element={<Portfolio />} />

              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/jobs/new" element={<CreateJob />} />
              <Route path="/admin/jobs/edit/:id" element={<EditJob />} />
              <Route path="/admin/jobs/category" element={<JobCategory />} />
              <Route
                path="/admin/jobs/applications"
                element={<JobApplications />}
              />
              <Route
                path="/admin/jobs/applications/:jobId"
                element={<JobApplications />}
              />
              <Route path="/adminproducts" element={<ProductAdmin />} />

              <Route
                path="/recentworkcategory"
                element={<Recentworkcategory />}
              />
              <Route path="/recentwork" element={<Recentwork />} />
            </Route>
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
