import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { LoaderCircle, LogOut, RefreshCw } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const [status, setStatus] = useState(token ? "checking" : "signed-out");
  const [retry, setRetry] = useState(0);
  const [, setSessionRevision] = useState(0);
  const checkingRef = useRef(false);
  const apiUrl = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";

  const checkSession = useCallback(
    async (initialCheck = false) => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const response = await axios.get(`${apiUrl}/api/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let previousUser = null;
        try {
          previousUser = JSON.parse(localStorage.getItem("authUser") || "null");
        } catch {
          previousUser = null;
        }
        if (
          previousUser?.role !== response.data.user?.role ||
          previousUser?.id !== response.data.user?.id
        ) {
          setSessionRevision((revision) => revision + 1);
        }
        localStorage.setItem("authUser", JSON.stringify(response.data.user));
        setStatus("authenticated");
      } catch (error) {
        const statusCode = error.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("authUser");
          setStatus("signed-out");
        } else if (initialCheck) {
          setStatus("unavailable");
        }
      } finally {
        checkingRef.current = false;
      }
    },
    [apiUrl, token],
  );

  useEffect(() => {
    if (!token) {
      setStatus("signed-out");
      return undefined;
    }

    void checkSession(true);
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void checkSession();
    }, 10000);
    const verifyOnFocus = () => {
      if (document.visibilityState === "visible") void checkSession();
    };
    document.addEventListener("visibilitychange", verifyOnFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", verifyOnFocus);
    };
  }, [checkSession, retry, token]);

  if (status === "signed-out") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "Please sign in again." }}
      />
    );
  }

  if (status === "checking" || status === "unavailable") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5">
          {status === "checking" ? (
            <LoaderCircle
              size={28}
              className="mx-auto animate-spin text-indigo-600"
            />
          ) : (
            <LogOut size={28} className="mx-auto text-amber-600" />
          )}
          <h1 className="mt-4 font-semibold text-slate-900">
            {status === "checking"
              ? "Checking your session"
              : "Unable to verify your session"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {status === "checking"
              ? "Please wait a moment."
              : "Reconnect to the server and try again. Your account has not been signed out."}
          </p>
          {status === "unavailable" && (
            <button
              type="button"
              onClick={() => {
                setStatus("checking");
                setRetry((current) => current + 1);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
