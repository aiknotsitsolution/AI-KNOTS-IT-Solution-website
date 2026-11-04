import { useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/favicon.webp";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";

const inputClassName =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "testing",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/auth/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      );
      toast.success(
        `Account created. Verification code sent to ${formData.email.trim()}.`,
      );
      navigate("/users", { replace: true });
    } catch (requestError) {
      const { code, email } = requestError.response?.data || {};
      if (code === "EMAIL_NOT_VERIFIED") {
        toast.info(
          `${email || formData.email.trim()} is already registered and needs email verification.`,
        );
        navigate("/users", { replace: true });
        return;
      }

      if (code === "EMAIL_VERIFICATION_EMAIL_FAILED") {
        toast.warning(
          `Account created, but the verification code could not be sent to ${email || formData.email.trim()}.`,
        );
        navigate("/users", { replace: true });
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to create the account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-8">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-slate-950/15 blur-3xl" />

      <main className="relative w-full max-w-lg">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl shadow-slate-950/10 ring-1 ring-slate-200">
            <img
              src={logo}
              alt="AI Knots IT"
              className="h-14 w-14 object-contain"
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
            AI Knots IT
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Register a user
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create an account for your team. Email verification is required
            before sign-in.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-2xl shadow-slate-950/10 ring-1 ring-slate-200 sm:p-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>
              <div className="relative">
                <UserRound
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="username"
                  name="username"
                  autoComplete="name"
                  minLength={2}
                  maxLength={60}
                  required
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Your name"
                  className={inputClassName}
                />
              </div>
            </div>

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
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="you@example.com"
                  className={inputClassName}
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
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="At least 8 characters"
                  className={`${inputClassName} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm password
              </label>
              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Re-enter your password"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Account role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
              >
                <option value="testing">Testing</option>
                <option value="admin">Admin</option>
              </select>
            </div>

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
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Register user <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link
              to="/users"
              className="font-semibold text-indigo-700 hover:text-slate-900"
            >
              Back to users
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
