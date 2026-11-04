import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Clock3, Mail, ShieldCheck } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import logo from "../../assets/favicon.webp";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
const OTP_LIFETIME_SECONDS = 60;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [expiresAt, setExpiresAt] = useState(
    location.state?.expiresAt
      ? new Date(location.state.expiresAt).getTime()
      : 0,
  );
  const [resendAt, setResendAt] = useState(
    location.state?.resendAvailableAt
      ? new Date(location.state.resendAvailableAt).getTime()
      : 0,
  );
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [resendSecondsRemaining, setResendSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt && !resendAt) return undefined;

    const updateTimers = () => {
      const codeRemaining = expiresAt
        ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
        : 0;
      const resendRemaining = resendAt
        ? Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))
        : 0;
      setSecondsRemaining(codeRemaining);
      setResendSecondsRemaining(resendRemaining);
      if (codeRemaining === 0) setExpiresAt(0);
      if (resendRemaining === 0) setResendAt(0);
    };

    updateTimers();
    const timerId = window.setInterval(updateTimers, 1000);
    return () => window.clearInterval(timerId);
  }, [expiresAt, resendAt]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-email`, {
        email: email.trim(),
        otp,
      });
      navigate("/login", {
        replace: true,
        state: { message: response.data.message },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to verify your email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/resend-verification`,
        { email: email.trim() },
      );
      setMessage(response.data.message);
      setOtp("");
      setExpiresAt(Date.now() + OTP_LIFETIME_SECONDS * 1000);
      setResendAt(
        response.data.resendAvailableAt
          ? new Date(response.data.resendAvailableAt).getTime()
          : Date.now() + OTP_LIFETIME_SECONDS * 1000,
      );
    } catch (requestError) {
      const retryAfterSeconds = requestError.response?.data?.retryAfterSeconds;
      if (Number.isFinite(retryAfterSeconds)) {
        setResendAt(Date.now() + retryAfterSeconds * 1000);
      }
      setError(
        requestError.response?.data?.message ||
          "Unable to send a new verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-8">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-slate-950/15 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl shadow-slate-950/10 ring-1 ring-slate-200 sm:p-9">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg shadow-slate-950/10 ring-1 ring-slate-200">
            <img
              src={logo}
              alt="AI Knots IT"
              className="h-14 w-14 object-contain"
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
            AI Knots IT
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Verify your email
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the 6-digit code sent to your email. You can sign in after
            verification.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label
              htmlFor="verification-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="verification-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="verification-code"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Verification code
            </label>
            <input
              id="verification-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={loading}
              placeholder="Enter 6-digit code"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-lg font-bold tracking-[0.35em] text-slate-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
            />
            {secondsRemaining > 0 && (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Clock3 size={14} />
                Code expires in {Math.floor(secondsRemaining / 60)}:
                {String(secondsRemaining % 60).padStart(2, "0")}
              </p>
            )}
          </div>

          {message && (
            <p
              role="status"
              className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {message}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                Verify email <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || resendSecondsRemaining > 0}
            className="text-sm font-semibold text-indigo-700 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {resendSecondsRemaining > 0
              ? `Resend code in ${resendSecondsRemaining}s`
              : "Resend verification code"}
          </button>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={16} />
            <span className="text-xs">
              Your account stays protected until your email is verified.
            </span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-indigo-700"
          >
            <ArrowLeft size={16} /> Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
