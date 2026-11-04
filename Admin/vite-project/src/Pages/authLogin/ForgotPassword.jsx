import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/favicon.webp";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
const OTP_TTL_SECONDS = 60;

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!codeExpiresAt) return undefined;

    const updateCountdown = () => {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((codeExpiresAt - Date.now()) / 1000),
      );
      setSecondsRemaining(remainingSeconds);
      if (remainingSeconds === 0) setCodeExpiresAt(0);
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timerId);
  }, [codeExpiresAt]);

  const sendOtp = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });
      setMessage(response.data.message);
      setOtp("");
      setResetToken("");
      setSecondsRemaining(OTP_TTL_SECONDS);
      setCodeExpiresAt(Date.now() + OTP_TTL_SECONDS * 1000);
      setStep(2);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to send the verification code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = (event) => {
    event.preventDefault();
    sendOtp();
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/verify-reset-otp`,
        { email, otp },
      );
      setResetToken(response.data.resetToken);
      setMessage(response.data.message);
      setStep(3);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to verify the code. Request a new code and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        resetToken,
        password,
        confirmPassword,
      });
      setMessage(response.data.message);
      setIsComplete(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reset your password. Please start again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeEmail = () => {
    setStep(1);
    setOtp("");
    setResetToken("");
    setCodeExpiresAt(0);
    setSecondsRemaining(0);
    setError("");
    setMessage("");
  };

  const stepContent = {
    1: {
      title: "Forgot your password?",
      description: "Enter your admin email to receive a verification code.",
    },
    2: {
      title: "Verify your email",
      description: `Enter the 6-digit code sent to ${email}.`,
    },
    3: {
      title: "Create a new password",
      description: "Your email is verified. Choose a new password.",
    },
  }[step];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-slate-950/15 blur-3xl" />

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
            {isComplete ? "Password updated" : stepContent.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isComplete
              ? "Your admin account is ready to use."
              : stepContent.description}
          </p>
        </div>

        {!isComplete && (
          <div
            className="mb-7 flex items-center justify-center gap-2"
            aria-label={`Step ${step} of 3`}
          >
            {[1, 2, 3].map((stepNumber) => (
              <span
                key={stepNumber}
                className={`h-1.5 flex-1 rounded-full ${
                  stepNumber <= step ? "bg-indigo-700" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        )}

        {isComplete ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" />
            <p className="mt-3 text-sm leading-6 text-emerald-900">{message}</p>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Admin email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending code..." : "Send verification code"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                6-digit verification code
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="otp"
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
                  disabled={isSubmitting}
                  placeholder="Enter code from your email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-center text-lg tracking-[0.35em] text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
              </div>
              <p
                className={`mt-2 text-xs ${
                  secondsRemaining === 0 ? "text-red-700" : "text-slate-500"
                }`}
                aria-live="polite"
              >
                {secondsRemaining > 0
                  ? `Code expires in 00:${String(secondsRemaining).padStart(2, "0")}`
                  : "Code expired. Request a new code."}
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting || otp.length !== 6 || secondsRemaining === 0
              }
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying code..." : "Verify code"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={changeEmail}
                disabled={isSubmitting}
                className="font-semibold text-indigo-700 transition hover:text-slate-900 disabled:opacity-60"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={sendOtp}
                disabled={isSubmitting || secondsRemaining > 0}
                className="font-semibold text-indigo-700 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {secondsRemaining > 0 ? "Resend code" : "Send a new code"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="At least 8 characters"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm new password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="Re-enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Updating password..." : "Update password"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          {isComplete ? "Return to login" : "Back to login"}
        </Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
