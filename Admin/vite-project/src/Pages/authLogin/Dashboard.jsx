import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
  FolderKanban,
  Layers3,
  Mail,
  MessageSquare,
  Newspaper,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
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
  recentWorkItems: [],
  recentWorkPagination: {
    page: 1,
    pageSize: 6,
    total: 0,
    totalPages: 1,
  },
  comparison: null,
};
const EMPTY_RECORDS = {
  items: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
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

const getPlainText = (value) =>
  typeof value === "string"
    ? value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ")
        .trim()
    : "";

const Dashboard = () => {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [recentWorkPage, setRecentWorkPage] = useState(1);
  const [selectedMetricKey, setSelectedMetricKey] = useState("all");
  const [recordPage, setRecordPage] = useState(1);
  const [metricRecords, setMetricRecords] = useState(EMPTY_RECORDS);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${API_URL}/api/dashboard/analytics`, {
          params: { recentWorkPage, recentWorkPageSize: 6 },
          signal: controller.signal,
        });
        const payload = response.data?.data;

        if (
          response.data?.success !== true ||
          !Array.isArray(payload?.metrics) ||
          payload.metrics.some((metric) => !Array.isArray(metric.daily)) ||
          !Array.isArray(payload?.recentActivity) ||
          !Array.isArray(payload?.recentWorkItems) ||
          !payload?.recentWorkPagination
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
  }, [recentWorkPage, refreshKey]);

  useEffect(() => {
    if (selectedMetricKey === "all") {
      setMetricRecords(EMPTY_RECORDS);
      setRecordsError("");
      setRecordsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const loadMetricRecords = async () => {
      setRecordsLoading(true);
      setRecordsError("");
      try {
        const response = await axios.get(
          `${API_URL}/api/dashboard/metrics/${selectedMetricKey}/records`,
          {
            params: { page: recordPage, pageSize: 10 },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            signal: controller.signal,
          },
        );
        const payload = response.data?.data;
        if (
          response.data?.success !== true ||
          !Array.isArray(payload?.items) ||
          !payload?.pagination
        ) {
          throw new Error("Metric records response is incomplete.");
        }
        setMetricRecords(payload);
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED") return;
        console.error("Failed to load dashboard metric records:", requestError);
        setRecordsError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load records for this metric.",
        );
      } finally {
        if (!controller.signal.aborted) setRecordsLoading(false);
      }
    };

    loadMetricRecords();
    return () => controller.abort();
  }, [recordPage, refreshKey, selectedMetricKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(data.recentActivity.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const displayedActivity = data.recentActivity.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );
  const selectedMetric = data.metrics.find(
    (metric) => metric.key === selectedMetricKey,
  );
  const chartMetrics = selectedMetric ? [selectedMetric] : data.metrics;
  const handleMetricCardClick = (metricKey) => {
    const nextMetricKey = selectedMetricKey === metricKey ? "all" : metricKey;
    setSelectedMetricKey(nextMetricKey);
    setRecordPage(1);
    setMetricRecords(EMPTY_RECORDS);
    setRecordsError("");
    setRecordsLoading(nextMetricKey !== "all");
  };
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
          <div className="flex flex-wrap items-center gap-3">
            <p className="hidden text-right text-xs leading-5 text-slate-400 sm:block">
              Monthly comparison
              <br />
              <span className="font-medium text-slate-200">
                Same days vs {previousMonthName}
              </span>
            </p>
            <Link
              to="/profile"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <UserRound size={16} />
              My profile
            </Link>
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
            <button
              type="button"
              key={metric.key}
              onClick={() => handleMetricCardClick(metric.key)}
              aria-pressed={selectedMetricKey === metric.key}
              aria-label={`Show ${metric.label} chart and records`}
              className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                selectedMetricKey === metric.key
                  ? "border-indigo-400 ring-2 ring-indigo-100"
                  : "border-slate-200/80 hover:border-slate-300"
              }`}
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
                  <p className="mt-2 text-[11px] font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    Click to view records
                  </p>
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
            </button>
          );
        })}
      </section>

      <section aria-label="Current-month metrics chart">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {selectedMetric
                ? `${selectedMetric.label} · ${currentMonthName}`
                : `All metrics · ${currentMonthName}`}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedMetric
                ? `Daily trend for ${selectedMetric.label.toLowerCase()}. Click the selected card again to show all metrics.`
                : "Daily trend for every dashboard metric in one chart. Select a card to focus on that metric."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedMetric && (
              <button
                type="button"
                onClick={() => handleMetricCardClick(selectedMetric.key)}
                className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
              >
                Show all metrics
              </button>
            )}
            {data.comparison?.throughDay && (
              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                Through day {data.comparison.throughDay}
              </span>
            )}
          </div>
        </div>
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex flex-wrap gap-3">
            {chartMetrics.map((metric) => {
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
                  {chartMetrics.map((metric) => (
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

      {selectedMetric && (
        <section
          aria-label={`${selectedMetric.label} records`}
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 rounded-xl p-2.5"
                style={{
                  color: METRIC_COLORS[selectedMetric.key] || "#6366f1",
                  backgroundColor: `${METRIC_COLORS[selectedMetric.key] || "#6366f1"}14`,
                }}
              >
                {(() => {
                  const SelectedIcon =
                    METRIC_ICONS[selectedMetric.key] || Activity;
                  return <SelectedIcon size={19} />;
                })()}
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedMetric.label} records
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing the actual records included in this card&apos;s total
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedMetric.total.toLocaleString()}
                  </span>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {selectedMetric.currentMonth.toLocaleString()} this month
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedMetricKey("all");
                  setRecordPage(1);
                  setMetricRecords(EMPTY_RECORDS);
                  setRecordsError("");
                  setRecordsLoading(false);
                }}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
              >
                Close details
              </button>
            </div>
          </div>

          {recordsError && (
            <div
              role="alert"
              className="m-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{recordsError}</span>
              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                className="self-start font-semibold underline underline-offset-2 sm:self-auto"
              >
                Try again
              </button>
            </div>
          )}

          {recordsLoading ? (
            <div className="grid gap-3 p-5 md:grid-cols-2 sm:p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl bg-slate-50"
                />
              ))}
            </div>
          ) : !recordsError && metricRecords.items.length ? (
            <>
              <div className="grid gap-3 p-5 md:grid-cols-2 sm:p-6">
                {metricRecords.items.map((item) => {
                  const description = getPlainText(item.description);
                  const externalLink =
                    typeof item.link === "string" &&
                    /^https?:\/\//i.test(item.link);

                  return (
                    <article
                      key={item._id}
                      className="flex min-w-0 gap-4 rounded-xl border border-slate-200/80 p-4 transition hover:border-slate-300 hover:bg-slate-50/60"
                    >
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt=""
                          loading="lazy"
                          className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover"
                        />
                      ) : (
                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            color:
                              METRIC_COLORS[selectedMetric.key] || "#6366f1",
                            backgroundColor: `${METRIC_COLORS[selectedMetric.key] || "#6366f1"}14`,
                          }}
                        >
                          {(() => {
                            const RecordIcon =
                              METRIC_ICONS[selectedMetric.key] || Activity;
                            return <RecordIcon size={20} />;
                          })()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="break-words text-sm font-semibold text-slate-900">
                            {item.title || "Untitled record"}
                          </h3>
                          <time className="shrink-0 text-[11px] text-slate-400">
                            {formatDate(item.createdAt)}
                          </time>
                        </div>
                        {item.subtitle && (
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {item.subtitle}
                          </p>
                        )}
                        {item.category && (
                          <span className="mt-2 inline-flex max-w-full truncate rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                            {item.category}
                          </span>
                        )}
                        {description && (
                          <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-slate-600">
                            {description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {item.email && (
                            <a
                              href={`mailto:${item.email}`}
                              className="break-all text-xs font-medium text-indigo-600 hover:underline"
                            >
                              {item.email}
                            </a>
                          )}
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="text-xs font-medium text-slate-600 hover:text-indigo-600"
                            >
                              {item.phone}
                            </a>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target={externalLink ? "_blank" : undefined}
                              rel={externalLink ? "noreferrer" : undefined}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                            >
                              View record <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(metricRecords.pagination.page - 1) *
                      metricRecords.pagination.pageSize +
                      1}
                    –
                    {Math.min(
                      metricRecords.pagination.page *
                        metricRecords.pagination.pageSize,
                      metricRecords.pagination.total,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {metricRecords.pagination.total}
                  </span>{" "}
                  records
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRecordsLoading(true);
                      setRecordPage((page) => Math.max(1, page - 1));
                    }}
                    disabled={recordPage <= 1 || recordsLoading}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="min-w-10 text-center text-xs font-semibold text-slate-600">
                    {metricRecords.pagination.page}/
                    {metricRecords.pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecordsLoading(true);
                      setRecordPage((page) =>
                        Math.min(metricRecords.pagination.totalPages, page + 1),
                      );
                    }}
                    disabled={
                      recordPage >= metricRecords.pagination.totalPages ||
                      recordsLoading
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : !recordsError ? (
            <div className="px-6 py-14 text-center">
              <Activity className="mx-auto mb-3 text-slate-300" size={30} />
              <p className="text-sm font-semibold text-slate-600">
                No records in this category yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                This card&apos;s total is zero.
              </p>
            </div>
          ) : null}
        </section>
      )}

      <section className="grid grid-cols-1 gap-5">
        <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
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

        <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
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

          <div className="grid grid-cols-1 divide-y divide-slate-100 xl:grid-cols-2 xl:divide-x xl:divide-y-0">
            <div className="min-w-0">
              {loading ? (
                <div className="space-y-4 p-6" aria-label="Loading recent work">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex animate-pulse gap-3">
                      <span className="h-12 w-12 rounded-xl bg-slate-100" />
                      <span className="h-12 flex-1 rounded-xl bg-slate-50" />
                    </div>
                  ))}
                </div>
              ) : data.recentWorkItems.length ? (
                <div className="divide-y divide-slate-100">
                  {data.recentWorkItems.map((item, index) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/80 sm:px-6"
                    >
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt=""
                          loading="lazy"
                          className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xs font-bold text-pink-700">
                          {String(
                            (recentWorkPage - 1) * 6 + index + 1,
                          ).padStart(2, "0")}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.title || "Untitled recent work"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {(item.description || "Added to Recent Work")
                            .replace(/<[^>]*>/g, " ")
                            .replace(/\s+/g, " ")
                            .trim()}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-[11px] text-slate-400">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
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

              {!loading && data.recentWorkPagination.total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {(recentWorkPage - 1) * 6 + 1}–
                      {Math.min(
                        recentWorkPage * 6,
                        data.recentWorkPagination.total,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                      {data.recentWorkPagination.total}
                    </span>{" "}
                    projects
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRecentWorkPage((page) => Math.max(1, page - 1))
                      }
                      disabled={recentWorkPage <= 1 || loading}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="min-w-10 text-center text-xs font-semibold text-slate-600">
                      {recentWorkPage}/{data.recentWorkPagination.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRecentWorkPage((page) =>
                          Math.min(
                            data.recentWorkPagination.totalPages,
                            page + 1,
                          ),
                        )
                      }
                      disabled={
                        recentWorkPage >=
                          data.recentWorkPagination.totalPages || loading
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Recent work trend
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Daily projects added in {currentMonthName}
                  </p>
                </div>
                <span className="rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700">
                  {data.metrics.find((metric) => metric.key === "recentWorks")
                    ?.currentMonth || 0}{" "}
                  this month
                </span>
              </div>
              <div className="h-[280px]">
                {loading ? (
                  <div className="flex h-full animate-pulse items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                    Loading recent work trend…
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        data.metrics.find(
                          (metric) => metric.key === "recentWorks",
                        )?.daily || []
                      }
                      margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient
                          id="recentWorkGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={METRIC_COLORS.recentWorks}
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="95%"
                            stopColor={METRIC_COLORS.recentWorks}
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#eef2f7" vertical={false} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />
                      <Tooltip
                        labelFormatter={(day) => `${currentMonthName} ${day}`}
                        formatter={(value) => [value, "Projects added"]}
                        contentStyle={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          boxShadow: "0 8px 24px rgba(15, 23, 42, .08)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Projects added"
                        stroke={METRIC_COLORS.recentWorks}
                        strokeWidth={2.5}
                        fill="url(#recentWorkGradient)"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
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
