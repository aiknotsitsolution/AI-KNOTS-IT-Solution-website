import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = "https://api.aiknotsit.com/api/query";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

function QueriesTable() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API_URL);
      const records = response.data?.data;
      setQueries(Array.isArray(records) ? records : []);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Failed to load queries.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const filteredQueries = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return queries.filter((query) =>
      [query.name, query.phone, query.email, query.category, query.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search)),
    );
  }, [queries, searchText]);
  const pageCount = Math.max(
    1,
    Math.ceil(filteredQueries.length / rowsPerPage),
  );
  const visiblePage = Math.min(currentPage, pageCount);
  const paginatedQueries = useMemo(() => {
    const start = (visiblePage - 1) * rowsPerPage;
    return filteredQueries.slice(start, start + rowsPerPage);
  }, [filteredQueries, rowsPerPage, visiblePage]);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this query?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setQueries((current) => current.filter((query) => query._id !== id));
      toast.success("Query deleted successfully.");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete query.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              <MessageSquareText size={14} />
              Lead management
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Website queries
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Keep track of customer enquiries and follow up with the right
              contact details.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchQueries}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total queries
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UsersRound size={19} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : queries.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Search results
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Search size={19} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : filteredQueries.length}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-semibold text-slate-900">All queries</h2>
            <p className="mt-1 text-xs text-slate-500">
              Search by name, contact details, category, or message.
            </p>
          </div>
          <label className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Search queries..."
              value={searchText}
              onChange={handleSearchChange}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>
        </div>

        {error && !loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <p className="font-semibold text-slate-800">
              Couldn’t load website queries
            </p>
            <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={fetchQueries}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            Loading website queries...
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="py-12 text-center">
            <FolderOpen size={28} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {searchText ? "No matching queries" : "No queries yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {searchText
                ? "Try another search term."
                : "New website enquiries will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {["Contact", "Category", "Message", "Received", "Action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 ${
                          heading === "Action" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedQueries.map((query) => (
                  <tr
                    key={query._id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {query.name || "Unknown"}
                      </p>
                      <a
                        href={`mailto:${query.email || ""}`}
                        className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-indigo-600"
                      >
                        <Mail size={12} />
                        {query.email || "No email provided"}
                      </a>
                      {query.phone && (
                        <a
                          href={`tel:${query.phone}`}
                          className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-indigo-600"
                        >
                          <Phone size={12} />
                          {query.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {query.category || "General"}
                      </span>
                    </td>
                    <td className="max-w-md px-5 py-4">
                      <p
                        className="line-clamp-3 text-sm leading-5 text-slate-600"
                        title={query.message || ""}
                      >
                        {query.message || "No message provided"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays size={14} className="text-slate-400" />
                        {formatDate(query.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(query._id)}
                        aria-label={`Delete query from ${query.name || "user"}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Rows per page</span>
                <select
                  aria-label="Rows per page"
                  value={rowsPerPage}
                  onChange={(event) => {
                    setRowsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                >
                  {[5, 10, 20, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="ml-1">
                  {filteredQueries.length === 0
                    ? "0 results"
                    : `${(visiblePage - 1) * rowsPerPage + 1}–${Math.min(
                        visiblePage * rowsPerPage,
                        filteredQueries.length,
                      )} of ${filteredQueries.length}`}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(visiblePage - 1)}
                  disabled={visiblePage <= 1}
                  aria-label="Previous page"
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>
                <span className="px-1 text-xs font-medium text-slate-500">
                  Page {visiblePage} of {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(visiblePage + 1)}
                  disabled={visiblePage >= pageCount}
                  aria-label="Next page"
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default QueriesTable;
