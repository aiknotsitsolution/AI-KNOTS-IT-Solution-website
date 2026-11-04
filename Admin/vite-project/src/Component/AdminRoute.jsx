import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("authUser") || "null");
  } catch {
    user = null;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
