// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/authLogin/Login";
import ForgotPassword from "./Pages/authLogin/ForgotPassword";
import Dashboard from "./Pages/authLogin/Dashboard";
import Layout from "./Component/Layout";
import ProtectedRoute from "./Component/ProtectedRoute";
import Createpost from "./Pages/Home/Createpost";
import ProductList from "./Pages/product/ProductList";
import ContactList from "./Pages/contact/Contact";
import Category from "./Pages/category/category";
import TechNews from "./Pages/TechNews/TechNews";
import TechCategory from "./Pages/technology/category";
import Technology from "./Pages/technology/technology";
import QueriesTable from "./Pages/query/QueriesTable";
import CategoryBlog from "./Pages/Home/category/category";
import Gallery from "./Pages/gallery/Gallery";
// import Poftfolio from './Pages/Portfolio/Poftfolio';
import Portfolio from "./Pages/Portfolio/Portfolio";
import PortfolioCategory from "./Pages/Portfolio/categoryPortfolio/PortfolioCategory";
import CreateJob from "./Pages/createjob/CreateJob";
import EditJob from "./Pages/createjob/EditJob";
import AdminJobs from "./Pages/createjob/AdminJob";
import JobCategory from "./Pages/applyjobcategory/jobCategory";
import JobApplications from "./Pages/createjob/JobApplications";
import ProductAdmin from "./Pages/technology/Product/Productadmin";
import Recentworkcategory from "./Pages/recentwork/recentworkcategory";
import Recentwork from "./Pages/recentwork/recentwork";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />


        {/* Protected routes - wrapped with Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
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

            <Route path="/recentworkcategory" element={<Recentworkcategory />} />
            <Route path="/recentwork" element={<Recentwork />} />

          </Route>
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
