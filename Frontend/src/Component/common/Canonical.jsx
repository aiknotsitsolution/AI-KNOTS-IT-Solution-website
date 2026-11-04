import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const Canonical = () => {
  const { pathname } = useLocation();
  const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  return (
    <Helmet>
      <link rel="canonical" href={`https://www.aiknotsit.com${cleanPath}`} />
    </Helmet>
  );
};

export default Canonical;
