import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { verifyLoginOtp } from "../../Pages/auth/authSlice.js";
import logo from "../../assets/favicon.webp";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
const OTP_LIFETIME_MS = 60 * 1000;

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [otp, setOtp] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [otpSeconds, setOtpSeconds] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const verificationLoading = useSelector((state) => state.auth.isLoading);
  const isLoading = requestLoading || verificationLoading;

  useEffect(() => {
    if (!challenge) return undefined;

    const updateTimers = () => {
      const currentTime = Date.now();
      setOtpSeconds(
        Math.max(0, Math.ceil((challenge.otpExpiresAt - currentTime) / 1000)),
      );
      setResendSeconds(Math.max(0, Math.ceil((resendAt - currentTime) / 1000)));
    };

    updateTimers();
    const timerId = window.setInterval(updateTimers, 1000);
    return () => window.clearInterval(timerId);
  }, [challenge, resendAt]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setRequestLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      setChallenge({
        challengeId: response.data.challengeId,
        email: response.data.email || formData.email.trim(),
        otpExpiresAt: new Date(response.data.otpExpiresAt).getTime(),
      });
      setOtp("");
      setResendAt(new Date(response.data.resendAvailableAt).getTime());
      toast.success(
        response.data.message || "Sign-in code sent to your email.",
      );
    } catch (requestError) {
      const responseData = requestError.response?.data;
      if (responseData?.code === "EMAIL_NOT_VERIFIED") {
        navigate(
          `/verify-email?email=${encodeURIComponent(formData.email.trim())}`,
          {
            replace: true,
            state: {
              message:
                "Verify your email address first, then return to sign in with a one-time code.",
            },
          },
        );
        return;
      }

      toast.error(
        responseData?.message ||
          requestError.message ||
          "Unable to start sign-in. Please try again.",
      );
      if (Number.isFinite(responseData?.retryAfterSeconds)) {
        toast.info(`Try again in ${responseData.retryAfterSeconds} seconds.`);
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    try {
      await dispatch(
        verifyLoginOtp({ challengeId: challenge.challengeId, otp }),
      ).unwrap();
      toast.success("Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (verificationError) {
      toast.error(
        verificationError?.message ||
          "The sign-in code could not be verified. Please try again.",
      );
      if (verificationError?.code === "LOGIN_CHALLENGE_EXPIRED") {
        setChallenge(null);
        setOtp("");
      }
    }
  };

  const handleResendOtp = async () => {
    if (!challenge || resendSeconds > 0) return;
    setRequestLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login/resend-otp`,
        { challengeId: challenge.challengeId },
      );
      setChallenge({
        challengeId: response.data.challengeId,
        email: response.data.email || challenge.email,
        otpExpiresAt: new Date(response.data.otpExpiresAt).getTime(),
      });
      setResendAt(new Date(response.data.resendAvailableAt).getTime());
      setOtp("");
      toast.success(response.data.message || "A new sign-in code was sent.");
    } catch (requestError) {
      const responseData = requestError.response?.data;
      if (Number.isFinite(responseData?.retryAfterSeconds)) {
        setResendAt(Date.now() + responseData.retryAfterSeconds * 1000);
      }
      if (responseData?.code === "LOGIN_CHALLENGE_EXPIRED") {
        setChallenge(null);
        setOtp("");
      }
      toast.error(
        responseData?.message ||
          requestError.message ||
          "Unable to resend the sign-in code.",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const changeCredentials = () => {
    setChallenge(null);
    setOtp("");
    setResendAt(0);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-8">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-slate-950/15 blur-3xl" />

      <main className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 inline-flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-slate-950/10 ring-1 ring-slate-200">
            <img
              src={logo}
              alt="AI Knots IT"
              className="h-16 w-16 object-contain"
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
            AI Knots IT
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to your administration workspace
          </p>
        </div>

        <section className="rounded-3xl bg-white p-7 shadow-2xl shadow-slate-950/10 ring-1 ring-slate-200 sm:p-9">
          <div className="mb-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              {challenge ? <MailCheck size={21} /> : <ShieldCheck size={21} />}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              {challenge ? "Verify your sign-in" : "Login"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {challenge
                ? `Enter the 6-digit code sent to ${challenge.email}.`
                : "Enter your credentials. We’ll email you a one-time code to finish signing in."}
            </p>
          </div>

          {!challenge ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter your email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-950"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-semibold text-indigo-700 transition hover:text-slate-900"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {requestLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Continue with email code
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="login-otp"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  6-digit sign-in code
                </label>
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={isLoading}
                    placeholder="Enter 6-digit code"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-center text-lg font-bold tracking-[0.35em] text-slate-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                  />
                </div>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <Clock3 size={14} />
                  {otpSeconds > 0
                    ? `Code expires in ${Math.floor(otpSeconds / 60)}:${String(
                        otpSeconds % 60,
                      ).padStart(2, "0")}`
                    : "This code has expired. Request a new one."}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verificationLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify and sign in
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={changeCredentials}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
                >
                  <ArrowLeft size={15} />
                  Change credentials
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading || resendSeconds > 0}
                  className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {resendSeconds > 0
                    ? `Resend code in ${resendSeconds}s`
                    : "Resend code"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-7 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck size={17} />
              <span className="text-xs">
                Password and email verification required
              </span>
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">
            Accounts are created by an administrator.
          </p>
        </section>

        {location.state?.message && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800"
          >
            {location.state.message}
          </p>
        )}

        <p className="mt-7 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
      </main>
    </div>
  );
};

export default Login;
