import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const Canonical = () => {
  const { pathname } = useLocation();

  return (
    <Helmet>
      <link rel="canonical" href={`https://www.aiknotsit.com${pathname}`} />
    </Helmet>
  );
};

export default Canonical;
