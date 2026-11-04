import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  Laptop,
  LoaderCircle,
  LogOut,
  Mail,
  Monitor,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Trash2,
  Tablet,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
const ROLES = ["admin", "testing"];

const getRequestConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
});

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
};

const getUserId = (user) => String(user._id || user.id || "");

function UserSessionsDialog({ user, onClose, onSessionsChanged }) {
  const [sessions, setSessions] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState("");
  const [revokingAll, setRevokingAll] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/users/${getUserId(user)}/sessions`,
        getRequestConfig(),
      );
      setSessions(
        Array.isArray(response.data.sessions)
          ? response.data.sessions.filter((session) => session.isActive)
          : [],
      );
      setActiveCount(response.data.activeCount || 0);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load this user's login sessions.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const revokeSession = async (session) => {
    setRevokingId(session.sessionId);
    setError("");
    setMessage("");
    try {
      const response = await axios.delete(
        `${API_URL}/api/auth/users/${getUserId(user)}/sessions/${session.sessionId}`,
        getRequestConfig(),
      );
      setMessage(response.data.message);
      onSessionsChanged(getUserId(user), Math.max(0, activeCount - 1));
      await loadSessions();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to log out this device.",
      );
    } finally {
      setRevokingId("");
    }
  };

  const revokeAll = async () => {
    if (
      !window.confirm(
        `Log ${activeCount} active device${activeCount === 1 ? "" : "s"} out for ${user.username}?`,
      )
    ) {
      return;
    }

    setRevokingAll(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.delete(
        `${API_URL}/api/auth/users/${getUserId(user)}/sessions`,
        getRequestConfig(),
      );
      setMessage(response.data.message);
      onSessionsChanged(getUserId(user), 0);
      await loadSessions();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to log out this user's devices.",
      );
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-sessions-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Eye size={20} />
            </span>
            <div>
              <h2
                id="user-sessions-title"
                className="text-lg font-bold text-slate-900"
              >
                Login devices
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {user.username} · {user.email}
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">
                {activeCount} active device{activeCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={revokeAll}
                disabled={revokingAll || loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {revokingAll ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                <span className="hidden sm:inline">Log out all</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close login devices"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-5 sm:p-7">
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          {message && (
            <p
              role="status"
              className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {message}
            </p>
          )}

          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
              <LoaderCircle
                size={18}
                className="animate-spin text-indigo-600"
              />
              Loading login devices...
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center">
              <Monitor className="mx-auto mb-3 text-slate-300" size={30} />
              <p className="text-sm font-semibold text-slate-700">
                No active login devices
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Active device logins will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const DeviceIcon =
                  session.deviceType === "mobile"
                    ? Smartphone
                    : session.deviceType === "tablet"
                      ? Tablet
                      : Laptop;
                return (
                  <article
                    key={session.sessionId}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          session.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <DeviceIcon size={20} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {session.deviceName ||
                              `${session.platform} ${session.deviceType}`}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              session.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {session.isActive
                              ? "Active"
                              : session.revokedAt
                                ? "Logged out"
                                : "Expired"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {session.platform} · {session.browser}
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 size={13} className="shrink-0" />
                          Logged in {formatDateTime(session.createdAt)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Last activity {formatDateTime(session.lastSeenAt)}
                        </p>
                        {session.revokedAt && (
                          <p className="mt-1 text-xs text-slate-400">
                            Ended {formatDateTime(session.revokedAt)}
                            {session.revokeReason
                              ? ` · ${session.revokeReason}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    {session.isActive && (
                      <button
                        type="button"
                        onClick={() => revokeSession(session)}
                        disabled={
                          revokingId === session.sessionId || revokingAll
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {revokingId === session.sessionId ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <LogOut size={14} />
                        )}
                        Log out device
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
          {!loading && sessions.length >= 50 && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Showing the latest 50 sessions. Older session history is removed
              after 30 days.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function EditUserDialog({ user, currentUserId, onClose, onSave, saving }) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    role: user.role || "testing",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await onSave(user, formData);
    } catch (saveError) {
      setError(saveError);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              User management
            </p>
            <h2
              id="edit-user-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              Edit account
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit dialog"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Full name
            <input
              required
              minLength={2}
              maxLength={60}
              value={formData.username}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <input
              required
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Role
            <select
              value={formData.role}
              disabled={getUserId(user) === currentUserId}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  role: event.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal capitalize outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role === "admin" ? "Admin" : "Testing"}
                </option>
              ))}
            </select>
            {getUserId(user) === currentUserId && (
              <span className="mt-1 block text-xs font-normal text-slate-500">
                You cannot change your own role.
              </span>
            )}
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function UserProfileDialog({ user, onClose, onViewDevices }) {
  const details = [
    {
      label: "Email address",
      value: user.email || "Not provided",
      icon: <Mail size={17} />,
    },
    {
      label: "Account role",
      value: user.role === "admin" ? "Administrator" : "Testing",
      icon: <BadgeCheck size={17} />,
    },
    {
      label: "Account status",
      value: user.isActive === false ? "Inactive" : "Active",
      icon: <Check size={17} />,
    },
    {
      label: "Joined",
      value: formatDateTime(user.createdAt),
      icon: <CalendarDays size={17} />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 pb-6 pt-5 text-white sm:px-8">
          <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
              User profile
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close user profile"
              className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative mt-5 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 text-xl font-bold uppercase text-white ring-1 ring-white/20">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.username}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                (user.username || "?").slice(0, 1)
              )}
            </span>
            <div className="min-w-0">
              <h2
                id="user-profile-title"
                className="truncate text-xl font-bold"
              >
                {user.username || "Unnamed user"}
              </h2>
              <p className="mt-1 truncate text-sm text-slate-300">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-6 sm:p-8">
          {details.map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                {icon}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                  {value}
                </p>
              </div>
            </div>
          ))}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onViewDevices}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Monitor size={16} />
              Login devices ({user.activeSessionCount || 0})
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Users() {
  const currentUserId = useMemo(() => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("authUser") || "null",
      );
      return currentUser ? String(currentUser.id || currentUser._id || "") : "";
    } catch {
      return "";
    }
  }, []);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [sessionsUser, setSessionsUser] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/users`,
        getRequestConfig(),
      );
      setUsers(Array.isArray(response.data.users) ? response.data.users : []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load users. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((user) => {
      const statusMatches =
        filter === "all" ||
        (filter === "active" && user.isActive !== false) ||
        (filter === "inactive" && user.isActive === false) ||
        user.role === filter;
      const searchMatches =
        !normalizedSearch ||
        [user.username, user.email, user.role]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      return statusMatches && searchMatches;
    });
  }, [filter, search, users]);

  const showResult = (text) => {
    setError("");
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  };

  const saveUser = async (user, values) => {
    setSavingId(getUserId(user));
    setError("");
    try {
      const response = await axios.put(
        `${API_URL}/api/auth/users/${getUserId(user)}`,
        values,
        getRequestConfig(),
      );
      setUsers((current) =>
        current.map((item) =>
          getUserId(item) === getUserId(user)
            ? {
                ...response.data.user,
                activeSessionCount: item.activeSessionCount || 0,
              }
            : item,
        ),
      );
      setEditingUser(null);
      showResult("User details updated.");
    } catch (requestError) {
      throw (
        requestError.response?.data?.message ||
        "Unable to update this user. Please try again."
      );
    } finally {
      setSavingId("");
    }
  };

  const toggleUserStatus = async (user) => {
    const nextActive = user.isActive === false;
    setSavingId(getUserId(user));
    setError("");
    try {
      const response = await axios.patch(
        `${API_URL}/api/auth/users/${getUserId(user)}/status`,
        { isActive: nextActive },
        getRequestConfig(),
      );
      setUsers((current) =>
        current.map((item) =>
          getUserId(item) === getUserId(user)
            ? {
                ...response.data.user,
                activeSessionCount: nextActive
                  ? item.activeSessionCount || 0
                  : 0,
              }
            : item,
        ),
      );
      showResult(response.data.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to change this account's status.",
      );
    } finally {
      setSavingId("");
    }
  };

  const deleteUser = async (user) => {
    if (
      !window.confirm(
        `Permanently delete ${user.username}'s account? This cannot be undone.`,
      )
    ) {
      return;
    }

    setSavingId(getUserId(user));
    setError("");
    try {
      await axios.delete(
        `${API_URL}/api/auth/users/${getUserId(user)}`,
        getRequestConfig(),
      );
      setUsers((current) =>
        current.filter((item) => getUserId(item) !== getUserId(user)),
      );
      showResult("User account deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this account. Please try again.",
      );
    } finally {
      setSavingId("");
    }
  };

  const activeCount = users.filter((user) => user.isActive !== false).length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const activeSessionCount = users.reduce(
    (total, user) => total + (user.activeSessionCount || 0),
    0,
  );
  const updateSessionCount = (userId, count) => {
    setUsers((current) =>
      current.map((user) =>
        getUserId(user) === userId
          ? { ...user, activeSessionCount: count }
          : user,
      ),
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              <Shield size={14} /> Administrator controls
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Users & access
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Review accounts, roles, login devices, and who can sign in.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 shadow-sm transition hover:bg-indigo-50"
            >
              <UserPlus size={16} />
              Register user
            </Link>
            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total accounts",
            value: users.length,
            icon: <UsersRound size={19} />,
            tone: "indigo",
          },
          {
            label: "Active accounts",
            value: activeCount,
            icon: <Check size={19} />,
            tone: "emerald",
          },
          {
            label: "Admin accounts",
            value: adminCount,
            icon: <Shield size={19} />,
            tone: "violet",
          },
          {
            label: "Active devices",
            value: activeSessionCount,
            icon: <Monitor size={19} />,
            tone: "amber",
          },
        ].map(({ label, value, icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {label}
              </span>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  tone === "emerald"
                    ? "bg-emerald-50 text-emerald-600"
                    : tone === "amber"
                      ? "bg-amber-50 text-amber-600"
                      : tone === "violet"
                        ? "bg-violet-50 text-violet-600"
                        : "bg-indigo-50 text-indigo-600"
                }`}
              >
                {icon}
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h3 className="font-semibold text-slate-900">All users</h3>
            <p className="mt-1 text-xs text-slate-500">
              View active devices and end any user session from here.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 sm:w-56"
              />
            </label>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter users"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-indigo-500"
            >
              <option value="all">All accounts</option>
              <option value="admin">Admin</option>
              <option value="testing">Testing</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="m-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-5"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <p
            role="status"
            className="mx-4 mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 sm:mx-5"
          >
            {message}
          </p>
        )}

        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-slate-500">
            <LoaderCircle size={20} className="animate-spin text-indigo-500" />
            Loading user accounts...
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UserPlus size={22} />
            </span>
            <p className="mt-3 font-semibold text-slate-800">No users found</p>
            <p className="mt-1 text-sm text-slate-500">
              {search || filter !== "all"
                ? "Try changing the search or filter."
                : "Accounts registered by an Admin will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">User</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 font-semibold">Devices</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUsers.map((user) => {
                  const isSelf = getUserId(user) === currentUserId;
                  const isSaving = savingId === getUserId(user);
                  const isActive = user.isActive !== false;
                  return (
                    <tr
                      key={getUserId(user)}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold uppercase text-indigo-700">
                            {(user.username || "?").slice(0, 1)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setProfileUser(user)}
                            aria-label={`View ${user.username}'s profile`}
                            className="min-w-0 text-left"
                          >
                            <span className="block truncate text-sm font-semibold text-slate-900 transition hover:text-indigo-700">
                              {user.username}{" "}
                              {isSelf && (
                                <span className="text-xs font-medium text-slate-400">
                                  (you)
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">
                              {user.email}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${
                            user.role === "admin"
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role || "testing"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isActive ? "text-emerald-700" : "text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSessionsUser(user)}
                          disabled={isSaving}
                          aria-label={`View ${user.activeSessionCount || 0} active login devices for ${user.username}`}
                          title="View login devices"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                        >
                          <Eye size={14} />
                          {user.activeSessionCount || 0}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingUser(user)}
                            disabled={isSaving}
                            aria-label={`Edit ${user.username}`}
                            title="Edit user"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(user)}
                            disabled={isSaving || isSelf}
                            aria-label={`${isActive ? "Deactivate" : "Activate"} ${user.username}`}
                            title={
                              isSelf
                                ? "You cannot deactivate your own account"
                                : undefined
                            }
                            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {isSaving ? (
                              <LoaderCircle
                                size={14}
                                className="animate-spin"
                              />
                            ) : null}
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(user)}
                            disabled={isSaving || isSelf}
                            aria-label={`Delete ${user.username}`}
                            title={
                              isSelf
                                ? "You cannot delete your own account"
                                : undefined
                            }
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-100 px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          currentUserId={currentUserId}
          onClose={() => setEditingUser(null)}
          onSave={saveUser}
          saving={savingId === getUserId(editingUser)}
        />
      )}
      {profileUser && (
        <UserProfileDialog
          user={profileUser}
          onClose={() => setProfileUser(null)}
          onViewDevices={() => {
            setProfileUser(null);
            setSessionsUser(profileUser);
          }}
        />
      )}
      {sessionsUser && (
        <UserSessionsDialog
          user={sessionsUser}
          onClose={() => setSessionsUser(null)}
          onSessionsChanged={updateSessionCount}
        />
      )}
    </div>
  );
}
