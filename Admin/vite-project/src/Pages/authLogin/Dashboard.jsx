import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Cpu,
  FolderKanban,
  Layers3,
  Mail,
  MessageSquare,
  Newspaper,
  RefreshCw,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
const METRIC_COLORS = {
  contacts: "#8b5cf6",
  queries: "#6366f1",
  blogPosts: "#10b981",
  techNews: "#f59e0b",
  recentWorks: "#ec4899",
  blogCategories: "#14b8a6",
  techCategories: "#f97316",
  recentWorkCategories: "#64748b",
};
const METRIC_ICONS = {
  contacts: Mail,
  queries: MessageSquare,
  blogPosts: BookOpen,
  techNews: Cpu,
  recentWorks: BriefcaseBusiness,
  blogCategories: Layers3,
  techCategories: Newspaper,
  recentWorkCategories: FolderKanban,
};
const EMPTY_DATA = {
  metrics: [],
  recentActivity: [],
  comparison: null,
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const getMonthName = (value, fallback) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        month: "long",
        timeZone: "UTC",
      })
    : fallback;

const formatChange = (current, previous) => {
  if (previous === 0) return current > 0 ? "New this month" : "No change";
  const change = ((current - previous) / previous) * 100;
  return `${Math.abs(change).toFixed(0)}% ${
    change > 0 ? "up" : change < 0 ? "down" : "unchanged"
  }`;
};

const Dashboard = () => {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${API_URL}/api/dashboard/analytics`, {
          signal: controller.signal,
        });
        const payload = response.data?.data;

        if (
          response.data?.success !== true ||
          !Array.isArray(payload?.metrics) ||
          payload.metrics.some((metric) => !Array.isArray(metric.daily)) ||
          !Array.isArray(payload?.recentActivity)
        ) {
          throw new Error("Dashboard analytics response is incomplete.");
        }

        setData(payload);
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED") return;
        console.error("Failed to load dashboard analytics:", requestError);
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load dashboard data.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadDashboard();
    return () => controller.abort();
  }, [refreshKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(data.recentActivity.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const displayedActivity = data.recentActivity.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );
  const recentWorks = data.recentActivity
    .filter((item) => item.type === "recentWork")
    .slice(0, 4);
  const currentMonthChartData = useMemo(() => {
    const days = new Map();
    data.metrics.forEach((metric) => {
      metric.daily.forEach(({ day }) => {
        if (!days.has(day)) days.set(day, { day });
      });
    });

    data.metrics.forEach((metric) => {
      metric.daily.forEach(({ day, count }) => {
        days.get(day)[metric.key] = count;
      });
    });

    return [...days.values()].sort((first, second) => first.day - second.day);
  }, [data.metrics]);
  const currentMonthName = getMonthName(
    data.comparison?.currentMonth,
    new Date().toLocaleString(undefined, {
      month: "long",
      timeZone: "UTC",
    }),
  );
  const previousMonthName = getMonthName(
    data.comparison?.previousMonth,
    "last month",
  );

  return (
    <main className="mx-auto max-w-[1500px] space-y-6 pb-8">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-7 text-white shadow-xl shadow-indigo-950/10 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[36px] border-white/[0.04]" />
        <div className="pointer-events-none absolute bottom-[-90px] right-48 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              ADMIN OVERVIEW
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Track your content, enquiries, and recent work in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-right text-xs leading-5 text-slate-400 sm:block">
              Monthly comparison
              <br />
              <span className="font-medium text-slate-200">
                Same days vs {previousMonthName}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="self-start font-semibold underline underline-offset-2 sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      <section
        aria-label="Dashboard totals"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {data.metrics.map((metric) => {
          const Icon = METRIC_ICONS[metric.key] || Activity;
          const color = METRIC_COLORS[metric.key] || "#6366f1";
          const difference = metric.currentMonth - metric.previousMonth;
          const isUp = difference > 0;
          const isDown = difference < 0;

          return (
            <article
              key={metric.key}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {loading ? (
                      <span className="inline-block h-9 w-14 animate-pulse rounded-lg bg-slate-100" />
                    ) : (
                      metric.total.toLocaleString()
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Total records</p>
                </div>
                <span
                  className="rounded-2xl p-3"
                  style={{
                    color,
                    backgroundColor: `${color}14`,
                  }}
                >
                  <Icon size={20} />
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="text-xs text-slate-400">{currentMonthName}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-700">
                    {loading ? "—" : metric.currentMonth.toLocaleString()}
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                      vs {loading ? "—" : metric.previousMonth.toLocaleString()}
                    </span>
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-semibold ${
                    isUp
                      ? "bg-emerald-50 text-emerald-700"
                      : isDown
                        ? "bg-rose-50 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                  title={`${currentMonthName}: ${metric.currentMonth}; ${previousMonthName} same period: ${metric.previousMonth}`}
                >
                  {isUp ? (
                    <ArrowUpRight size={13} />
                  ) : isDown ? (
                    <ArrowDownRight size={13} />
                  ) : null}
                  {loading
                    ? "—"
                    : formatChange(metric.currentMonth, metric.previousMonth)}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section aria-label="Current-month metrics chart">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              All metrics · {currentMonthName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Daily trend for every dashboard metric in one chart.
            </p>
          </div>
          {data.comparison?.throughDay && (
            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              Through day {data.comparison.throughDay}
            </span>
          )}
        </div>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex flex-wrap gap-3">
            {data.metrics.map((metric) => {
              const Icon = METRIC_ICONS[metric.key] || Activity;
              const color = METRIC_COLORS[metric.key] || "#6366f1";
              return (
                <span
                  key={metric.key}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  <Icon size={14} style={{ color }} />
                  {metric.label}
                </span>
              );
            })}
          </div>
          <div className="h-[380px]">
            {loading ? (
              <div className="flex h-full animate-pulse items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                Loading current-month trends…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={currentMonthChartData}
                  margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
                >
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(day) => `${day}`}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip
                    labelFormatter={(day) => `${currentMonthName} ${day}`}
                    formatter={(value, name) => [
                      value,
                      data.metrics.find((metric) => metric.key === name)
                        ?.label || name,
                    ]}
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(15, 23, 42, .08)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={46}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                    formatter={(key) =>
                      data.metrics.find((metric) => metric.key === key)
                        ?.label || key
                    }
                  />
                  {data.metrics.map((metric) => (
                    <Line
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      name={metric.key}
                      stroke={METRIC_COLORS[metric.key] || "#6366f1"}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-3">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest enquiries and content updates.
              </p>
            </div>
            <span className="rounded-xl bg-slate-100 p-2.5 text-slate-500">
              <Activity size={18} />
            </span>
          </div>

          {loading ? (
            <div className="space-y-4 p-6" aria-label="Loading recent activity">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex animate-pulse gap-3">
                  <span className="h-10 w-10 rounded-xl bg-slate-100" />
                  <span className="h-10 flex-1 rounded-xl bg-slate-50" />
                </div>
              ))}
            </div>
          ) : displayedActivity.length ? (
            <div className="divide-y divide-slate-100">
              {displayedActivity.map((item) => {
                const color =
                  METRIC_COLORS[
                    item.type === "contact"
                      ? "contacts"
                      : item.type === "query"
                        ? "queries"
                        : item.type === "blog"
                          ? "blogPosts"
                          : item.type === "tech"
                            ? "techNews"
                            : "recentWorks"
                  ];
                const Icon =
                  item.type === "contact"
                    ? Mail
                    : item.type === "query"
                      ? MessageSquare
                      : item.type === "blog"
                        ? BookOpen
                        : item.type === "tech"
                          ? Cpu
                          : BriefcaseBusiness;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/80 sm:px-6"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        color,
                        backgroundColor: `${color}14`,
                      }}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.detail}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-[11px] font-medium text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <Activity className="mx-auto mb-3 text-slate-300" size={30} />
              <p className="text-sm font-semibold text-slate-600">
                No recent activity
              </p>
              <p className="mt-1 text-xs text-slate-400">
                New enquiries and content updates will show up here.
              </p>
            </div>
          )}

          {!loading && data.recentActivity.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    (safePage - 1) * itemsPerPage + 1,
                    data.recentActivity.length,
                  )}
                  –
                  {Math.min(
                    safePage * itemsPerPage,
                    data.recentActivity.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {data.recentActivity.length}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    setItemsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none focus:border-indigo-400"
                  aria-label="Activity items per page"
                >
                  <option value={5}>5 per page</option>
                  <option value={6}>6 per page</option>
                  <option value={10}>10 per page</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safePage === 1}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="min-w-10 text-center text-xs font-semibold text-slate-600">
                  {safePage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safePage === totalPages}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent work</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest projects added to your portfolio.
              </p>
            </div>
            <span className="rounded-xl bg-pink-50 p-2.5 text-pink-600">
              <BriefcaseBusiness size={18} />
            </span>
          </div>

          {loading ? (
            <div className="space-y-4 p-6" aria-label="Loading recent work">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex animate-pulse gap-3">
                  <span className="h-10 w-10 rounded-xl bg-slate-100" />
                  <span className="h-10 flex-1 rounded-xl bg-slate-50" />
                </div>
              ))}
            </div>
          ) : recentWorks.length ? (
            <div className="divide-y divide-slate-100">
              {recentWorks.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-4 sm:px-6"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xs font-bold text-pink-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Added to Recent Work
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-[11px] text-slate-400">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <BriefcaseBusiness
                className="mx-auto mb-3 text-slate-300"
                size={30}
              />
              <p className="text-sm font-semibold text-slate-600">
                No recent work yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                New portfolio projects will appear here.
              </p>
            </div>
          )}
        </article>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
        <span>Trends include all tracked content and enquiry categories.</span>
        <span>
          Compared through day {data.comparison?.throughDay || "—"} of the month
        </span>
      </footer>
    </main>
  );
};

export default Dashboard;
