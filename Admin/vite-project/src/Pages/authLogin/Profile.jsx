import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ImagePlus,
  KeyRound,
  LockKeyhole,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
const OTP_LIFETIME_SECONDS = 60;
const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const requestConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
});

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const Profile = () => {
  const location = useLocation();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [emailStep, setEmailStep] = useState(0);
  const [currentEmailOtp, setCurrentEmailOtp] = useState("");
  const [newEmailOtp, setNewEmailOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentEmailVerificationToken, setCurrentEmailVerificationToken] =
    useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailExpiresAt, setEmailExpiresAt] = useState(0);
  const [emailSecondsRemaining, setEmailSecondsRemaining] = useState(0);

  const [passwordStep, setPasswordStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (avatarPreview) return () => URL.revokeObjectURL(avatarPreview);
    return undefined;
  }, [avatarPreview]);

  const selectAvatar = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (
      file &&
      (!PROFILE_IMAGE_TYPES.includes(file.type) ||
        file.size > MAX_PROFILE_IMAGE_SIZE_BYTES)
    ) {
      setProfileError(
        file.size > MAX_PROFILE_IMAGE_SIZE_BYTES
          ? "Profile images must be 5 MB or smaller."
          : "Choose a JPEG, PNG, or WebP image.",
      );
      return;
    }

    setProfileError("");
    setProfileMessage("");
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  };

  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview("");
  };

  useEffect(() => {
    if (location.hash !== "#security") return;
    document.getElementById("security")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [location.hash]);

  useEffect(() => {
    const controller = new AbortController();
    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");
      try {
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
          ...requestConfig(),
          signal: controller.signal,
        });
        const user = response.data?.data;
        if (!user?.id || !user?.username || !user?.email) {
          throw new Error("The profile response is incomplete.");
        }
        setProfile(user);
        setUsername(user.username);
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED") return;
        console.error("Failed to load admin profile:", requestError);
        setProfileError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load your profile.",
        );
      } finally {
        if (!controller.signal.aborted) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) setExpiresAt(0);
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timerId);
  }, [expiresAt]);

  useEffect(() => {
    if (!emailExpiresAt) return undefined;
    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((emailExpiresAt - Date.now()) / 1000),
      );
      setEmailSecondsRemaining(remaining);
      if (remaining === 0) setEmailExpiresAt(0);
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timerId);
  }, [emailExpiresAt]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setSavingProfile(true);

    try {
      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        { username },
        requestConfig(),
      );
      setProfile((current) => ({ ...current, ...response.data.data }));
      setUsername(response.data.data.username);
      setProfileMessage(response.data.message);
    } catch (requestError) {
      console.error("Failed to update admin profile:", requestError);
      setProfileError(
        requestError.response?.data?.message ||
          "Unable to update your profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async (event) => {
    event.preventDefault();
    if (!avatarFile) return;

    setProfileError("");
    setProfileMessage("");
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/profile/avatar`,
        formData,
        requestConfig(),
      );
      setProfile((current) => ({ ...current, ...response.data.data }));
      clearAvatarSelection();
      setProfileMessage(response.data.message);
    } catch (requestError) {
      console.error("Failed to upload admin profile photo:", requestError);
      setProfileError(
        requestError.response?.data?.message ||
          "Unable to update your profile photo.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const requestCurrentEmailOtp = async () => {
    setEmailError("");
    setEmailMessage("");
    setEmailBusy(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/profile/email/request-current-otp`,
        {},
        requestConfig(),
      );
      setCurrentEmailOtp("");
      setCurrentEmailVerificationToken("");
      setEmailMessage(response.data.message);
      setEmailExpiresAt(Date.now() + OTP_LIFETIME_SECONDS * 1000);
      setEmailSecondsRemaining(OTP_LIFETIME_SECONDS);
      setEmailStep(1);
    } catch (requestError) {
      console.error(
        "Failed to request current email verification:",
        requestError,
      );
      setEmailError(
        requestError.response?.data?.message ||
          "Unable to send a verification code to your current email.",
      );
    } finally {
      setEmailBusy(false);
    }
  };

  const verifyCurrentEmailOtp = async (event) => {
    event.preventDefault();
    setEmailError("");
    setEmailBusy(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/profile/email/verify-current-otp`,
        { otp: currentEmailOtp },
        requestConfig(),
      );
      setCurrentEmailVerificationToken(response.data.currentVerificationToken);
      setEmailMessage(response.data.message);
      setEmailExpiresAt(0);
      setEmailStep(2);
    } catch (requestError) {
      console.error("Failed to verify current email:", requestError);
      setEmailError(
        requestError.response?.data?.message ||
          "Unable to verify your current email.",
      );
    } finally {
      setEmailBusy(false);
    }
  };

  const requestNewEmailOtp = async (event) => {
    event.preventDefault();
    setEmailError("");
    setEmailMessage("");
    setEmailBusy(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/profile/email/request-new-otp`,
        {
          email: newEmail,
          currentVerificationToken: currentEmailVerificationToken,
        },
        requestConfig(),
      );
      setNewEmailOtp("");
      setEmailMessage(response.data.message);
      setEmailExpiresAt(Date.now() + OTP_LIFETIME_SECONDS * 1000);
      setEmailSecondsRemaining(OTP_LIFETIME_SECONDS);
      setEmailStep(3);
    } catch (requestError) {
      console.error("Failed to request new email verification:", requestError);
      setEmailError(
        requestError.response?.data?.message ||
          "Unable to send a verification code to your new email.",
      );
    } finally {
      setEmailBusy(false);
    }
  };

  const verifyNewEmailOtp = async (event) => {
    event.preventDefault();
    setEmailError("");
    setEmailBusy(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/profile/email/verify-new-otp`,
        { otp: newEmailOtp },
        requestConfig(),
      );
      setProfile((current) => ({ ...current, ...response.data.data }));
      setEmailMessage(response.data.message);
      setEmailExpiresAt(0);
      setEmailStep(4);
    } catch (requestError) {
      console.error("Failed to verify new email:", requestError);
      setEmailError(
        requestError.response?.data?.message ||
          "Unable to verify your new email.",
      );
    } finally {
      setEmailBusy(false);
    }
  };

  const resetEmailChange = () => {
    setEmailStep(0);
    setCurrentEmailOtp("");
    setNewEmailOtp("");
    setNewEmail("");
    setCurrentEmailVerificationToken("");
    setEmailExpiresAt(0);
    setEmailSecondsRemaining(0);
    setEmailError("");
    setEmailMessage("");
  };

  const requestOtp = async () => {
    setPasswordError("");
    setPasswordMessage("");
    setPasswordBusy(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/profile/password/request-otp`,
        {},
        requestConfig(),
      );
      setPasswordMessage(response.data.message);
      setOtp("");
      setVerificationToken("");
      setExpiresAt(Date.now() + OTP_LIFETIME_SECONDS * 1000);
      setSecondsRemaining(OTP_LIFETIME_SECONDS);
      setPasswordStep(2);
    } catch (requestError) {
      console.error("Failed to request password change code:", requestError);
      setPasswordError(
        requestError.response?.data?.message ||
          "Unable to send a verification code.",
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordBusy(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/profile/password/verify-otp`,
        { otp },
        requestConfig(),
      );
      setVerificationToken(response.data.verificationToken);
      setPasswordMessage(response.data.message);
      setPasswordStep(3);
    } catch (requestError) {
      console.error("Failed to verify password change code:", requestError);
      setPasswordError(
        requestError.response?.data?.message ||
          "Unable to verify the code. Request a new code and try again.",
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordBusy(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/profile/password/change`,
        { verificationToken, password, confirmPassword },
        requestConfig(),
      );
      setPasswordMessage(response.data.message);
      setPasswordStep(4);
      setOtp("");
      setVerificationToken("");
      setPassword("");
      setConfirmPassword("");
      setExpiresAt(0);
    } catch (requestError) {
      console.error("Failed to change admin password:", requestError);
      setPasswordError(
        requestError.response?.data?.message ||
          "Unable to change your password.",
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  const restartPasswordChange = () => {
    setPasswordStep(1);
    setOtp("");
    setVerificationToken("");
    setPassword("");
    setConfirmPassword("");
    setExpiresAt(0);
    setSecondsRemaining(0);
    setPasswordError("");
    setPasswordMessage("");
  };

  const initials = (profile?.username || "A")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = (profile?.role || "admin")
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <main className="mx-auto max-w-5xl space-y-6 pb-10">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-7 text-white shadow-xl shadow-slate-950/15 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[36px] border-white/[0.05]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/70 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to dashboard
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200">
              Account settings
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Admin profile
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Manage your account details and password securely.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 pr-5 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-950">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {loadingProfile ? "Loading profile…" : profile?.username}
              </p>
              <p className="text-xs text-white/65">{roleLabel} role</p>
            </div>
          </div>
        </div>
      </header>

      {profileError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {profileError}
        </p>
      )}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-3">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span className="mb-3 inline-flex rounded-xl bg-slate-100 p-2.5 text-indigo-700">
                <UserRound size={20} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Profile information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the name shown in your admin account.
              </p>
            </div>
            <Pencil size={17} className="mt-1 text-slate-400" />
          </div>

          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 ring-4 ring-white shadow-sm">
              {avatarPreview || profile?.avatarUrl ? (
                <img
                  src={avatarPreview || profile.avatarUrl}
                  alt="Admin profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Profile photo
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                JPEG, PNG, or WebP · maximum 5 MB. Upload another image anytime
                to replace the current one.
              </p>
            </div>
            <form
              onSubmit={uploadAvatar}
              className="flex flex-wrap items-center gap-2"
            >
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700">
                <ImagePlus size={16} />
                {avatarFile ? "Choose another" : "Choose image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={selectAvatar}
                  disabled={uploadingAvatar}
                />
              </label>
              {avatarFile && (
                <>
                  <button
                    type="submit"
                    disabled={uploadingAvatar}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-3 text-sm font-semibold text-white transition hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadingAvatar ? "Uploading…" : "Save photo"}
                  </button>
                  <button
                    type="button"
                    onClick={clearAvatarSelection}
                    disabled={uploadingAvatar}
                    className="h-10 rounded-xl px-2 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </>
              )}
            </form>
          </div>

          <form onSubmit={saveProfile} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Admin name
              </label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  type="text"
                  minLength={2}
                  maxLength={50}
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={loadingProfile || savingProfile}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-role"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Account role
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-600" />
                <input
                  id="profile-role"
                  type="text"
                  readOnly
                  value={roleLabel}
                  className="h-12 w-full cursor-not-allowed rounded-xl border border-indigo-100 bg-indigo-50/60 pl-12 pr-4 text-sm font-semibold text-indigo-800 outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Your role is assigned by the system and cannot be changed from
                your own profile.
              </p>
            </div>

            {profileMessage && (
              <p
                role="status"
                className="flex items-center gap-2 text-sm text-emerald-700"
              >
                <CheckCircle2 size={16} />
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={
                loadingProfile ||
                savingProfile ||
                !username.trim() ||
                username.trim() === profile?.username
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-5 text-sm font-semibold text-white shadow-md shadow-slate-950/15 transition hover:-translate-y-0.5 hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Save size={16} />
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Login email
                </h3>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {profile?.email || "Loading email…"}
                </p>
              </div>
              {emailStep === 0 && (
                <button
                  type="button"
                  onClick={requestCurrentEmailOtp}
                  disabled={loadingProfile || emailBusy || !profile?.email}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Mail size={15} />
                  {emailBusy ? "Sending…" : "Change email"}
                </button>
              )}
            </div>

            {emailStep === 1 && (
              <form onSubmit={verifyCurrentEmailOtp} className="space-y-3">
                <p className="text-xs leading-5 text-slate-500">
                  First verify your current email. The code is valid for one
                  minute.
                </p>
                <input
                  aria-label="Current email verification code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={currentEmailOtp}
                  onChange={(event) =>
                    setCurrentEmailOtp(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  disabled={emailBusy || emailSecondsRemaining === 0}
                  placeholder="6-digit code"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-base font-semibold tracking-[0.35em] text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
                <p
                  className={`text-xs font-medium ${
                    emailSecondsRemaining > 0
                      ? "text-indigo-700"
                      : "text-red-600"
                  }`}
                  aria-live="polite"
                >
                  {emailSecondsRemaining > 0
                    ? `Code expires in 00:${String(emailSecondsRemaining).padStart(2, "0")}`
                    : "Code expired. Request a new code."}
                </p>
                {emailSecondsRemaining > 0 ? (
                  <button
                    type="submit"
                    disabled={emailBusy || currentEmailOtp.length !== 6}
                    className="h-10 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white transition hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailBusy ? "Verifying…" : "Verify current email"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={requestCurrentEmailOtp}
                    disabled={emailBusy}
                    className="h-10 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white transition hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailBusy ? "Sending…" : "Send a new code"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetEmailChange}
                  disabled={emailBusy}
                  className="ml-3 h-10 px-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </form>
            )}

            {emailStep === 2 && (
              <form onSubmit={requestNewEmailOtp} className="space-y-3">
                <p className="text-xs leading-5 text-emerald-700">
                  Current email verified. Now enter the new address; a second
                  code will be sent there.
                </p>
                <input
                  aria-label="New login email"
                  type="email"
                  autoComplete="email"
                  required
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  disabled={emailBusy}
                  placeholder="Enter your new email"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={emailBusy || !newEmail.trim()}
                  className="h-10 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white transition hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {emailBusy ? "Sending…" : "Send code to new email"}
                </button>
                <button
                  type="button"
                  onClick={resetEmailChange}
                  disabled={emailBusy}
                  className="ml-3 h-10 px-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </form>
            )}

            {emailStep === 3 && (
              <form onSubmit={verifyNewEmailOtp} className="space-y-3">
                <p className="text-xs leading-5 text-slate-500">
                  Enter the code sent to{" "}
                  <span className="font-semibold text-slate-700">
                    {newEmail}
                  </span>
                  .
                </p>
                <input
                  aria-label="New email verification code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={newEmailOtp}
                  onChange={(event) =>
                    setNewEmailOtp(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  disabled={emailBusy || emailSecondsRemaining === 0}
                  placeholder="6-digit code"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-base font-semibold tracking-[0.35em] text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
                <p
                  className={`text-xs font-medium ${
                    emailSecondsRemaining > 0
                      ? "text-indigo-700"
                      : "text-red-600"
                  }`}
                  aria-live="polite"
                >
                  {emailSecondsRemaining > 0
                    ? `Code expires in 00:${String(emailSecondsRemaining).padStart(2, "0")}`
                    : "Code expired. Request a new code."}
                </p>
                {emailSecondsRemaining > 0 ? (
                  <button
                    type="submit"
                    disabled={emailBusy || newEmailOtp.length !== 6}
                    className="h-10 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white transition hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailBusy ? "Verifying…" : "Verify new email"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={requestNewEmailOtp}
                    disabled={emailBusy}
                    className="h-10 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white transition hover:from-slate-900 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailBusy ? "Sending…" : "Send a new code"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEmailStep(2);
                    setEmailExpiresAt(0);
                    setEmailError("");
                  }}
                  disabled={emailBusy}
                  className="ml-3 h-10 px-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Change new email
                </button>
              </form>
            )}

            {emailStep === 4 && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                <div>
                  <p>{emailMessage}</p>
                  <button
                    type="button"
                    onClick={resetEmailChange}
                    className="mt-2 font-semibold underline underline-offset-2"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {emailError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {emailError}
              </p>
            )}
            {emailMessage && emailStep > 0 && emailStep < 4 && (
              <p role="status" className="mt-3 text-sm text-emerald-700">
                {emailMessage}
              </p>
            )}
          </div>

          <div className="mt-7 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
            <Clock3 size={15} />
            Account created {formatDate(profile?.createdAt)}
          </div>
        </article>

        <article
          id="security"
          className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2"
        >
          <div className="mb-6">
            <span className="mb-3 inline-flex rounded-xl bg-slate-100 p-2.5 text-indigo-700">
              <LockKeyhole size={20} />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Change password
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Verify a one-time code sent to your login email before choosing a
              new password.
            </p>
          </div>

          <div className="mb-5 flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-1.5 flex-1 rounded-full ${
                  (passwordStep === 4 ? 3 : passwordStep) >= step
                    ? "bg-indigo-700"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {passwordStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#eee3d7] bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Verification email
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                  {profile?.email || "Loading…"}
                </p>
              </div>
              <button
                type="button"
                onClick={requestOtp}
                disabled={loadingProfile || passwordBusy || !profile?.email}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white shadow-md shadow-slate-950/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound size={16} />
                {passwordBusy ? "Sending code…" : "Send verification code"}
              </button>
            </div>
          )}

          {passwordStep === 2 && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="rounded-xl border border-[#eee3d7] bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-slate-700">
                  {profile?.email}
                </span>
                .
              </div>
              <label
                htmlFor="profile-otp"
                className="block text-sm font-semibold text-slate-700"
              >
                Verification code
              </label>
              <input
                id="profile-otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={passwordBusy || secondsRemaining === 0}
                placeholder="000000"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-lg font-bold tracking-[0.45em] text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
              />
              <p
                className={`text-xs font-medium ${
                  secondsRemaining > 0 ? "text-indigo-700" : "text-red-600"
                }`}
              >
                {secondsRemaining > 0
                  ? `Code expires in 00:${String(secondsRemaining).padStart(2, "0")}`
                  : "Code expired. Request a new one to continue."}
              </p>
              {secondsRemaining > 0 ? (
                <button
                  type="submit"
                  disabled={passwordBusy || otp.length !== 6}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white shadow-md shadow-slate-950/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordBusy ? "Verifying…" : "Verify code"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={passwordBusy}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white shadow-md shadow-slate-950/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordBusy ? "Sending…" : "Send a new code"}
                </button>
              )}
              <button
                type="button"
                onClick={restartPasswordChange}
                disabled={passwordBusy}
                className="w-full text-sm font-semibold text-indigo-700 hover:text-slate-900"
              >
                Cancel
              </button>
            </form>
          )}

          {passwordStep === 3 && (
            <form onSubmit={changePassword} className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <ShieldCheck size={18} />
                Email verified. Choose a new password.
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={passwordBusy}
                  placeholder="At least 8 characters"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={passwordBusy}
                  placeholder="Re-enter your new password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={passwordBusy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-700 px-4 text-sm font-semibold text-white shadow-md shadow-slate-950/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LockKeyhole size={16} />
                {passwordBusy ? "Updating password…" : "Update password"}
              </button>
            </form>
          )}

          {passwordStep === 4 && (
            <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" />
              <p className="text-sm font-semibold text-emerald-900">
                {passwordMessage}
              </p>
              <button
                type="button"
                onClick={restartPasswordChange}
                className="text-sm font-semibold text-indigo-700 hover:text-slate-900"
              >
                Done
              </button>
            </div>
          )}

          {passwordError && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {passwordError}
            </p>
          )}
          {passwordMessage && passwordStep !== 4 && (
            <p role="status" className="mt-4 text-sm text-emerald-700">
              {passwordMessage}
            </p>
          )}
        </article>
      </section>
    </main>
  );
};

export default Profile;
