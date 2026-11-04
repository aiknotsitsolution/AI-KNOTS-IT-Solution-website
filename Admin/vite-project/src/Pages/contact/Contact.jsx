import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  CalendarDays,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = "https://api.aiknotsit.com/api/contact";

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

const customStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
      color: "#0f172a",
    },
  },
  headRow: {
    style: {
      minHeight: "48px",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
    },
  },
  headCells: {
    style: {
      color: "#64748b",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      paddingLeft: "20px",
      paddingRight: "20px",
    },
  },
  rows: {
    style: {
      minHeight: "68px",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "13px",
      "&:hover": {
        backgroundColor: "#f8fafc !important",
      },
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "20px",
    },
  },
  pagination: {
    style: {
      minHeight: "58px",
      color: "#64748b",
      borderTop: "1px solid #f1f5f9",
    },
    pageButtonsStyle: {
      color: "#475569",
      fill: "#475569",
      borderRadius: "8px",
      "&:hover:not(:disabled)": {
        backgroundColor: "#eef2ff",
      },
    },
  },
};

const Contact = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API_URL);
      const result = response.data;
      const contacts = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];
      setData(contacts);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Failed to load contact messages.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this contact message?")
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      setData((current) => current.filter((item) => item._id !== id));
      toast.success("Contact message deleted.");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete contact message.",
      );
    }
  };

  const filteredItems = useMemo(() => {
    const search = filterText.trim().toLowerCase();
    return data
      .filter((item) =>
        [item.username, item.email, item.phone, item.message]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search)),
      )
      .map((item) => ({ ...item, handleDelete }));
  }, [data, filterText]);

  const columns = useMemo(
    () => [
      {
        name: "Contact",
        selector: (row) => row.username || "",
        sortable: true,
        minWidth: "180px",
        cell: (row) => (
          <div className="min-w-0 py-2">
            <p className="truncate font-semibold text-slate-900">
              {row.username || "Unknown"}
            </p>
            <a
              href={`mailto:${row.email || ""}`}
              className="mt-1 flex max-w-full items-center gap-1.5 truncate text-xs text-slate-500 transition hover:text-indigo-600"
            >
              <Mail size={12} className="shrink-0" />
              <span className="truncate">
                {row.email || "No email provided"}
              </span>
            </a>
          </div>
        ),
      },
      {
        name: "Phone",
        selector: (row) => row.phone || "",
        sortable: true,
        minWidth: "140px",
        cell: (row) =>
          row.phone ? (
            <a
              href={`tel:${row.phone}`}
              className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-indigo-600"
            >
              <Phone size={14} className="text-slate-400" />
              {row.phone}
            </a>
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
      {
        name: "Message",
        selector: (row) => row.message || "",
        wrap: true,
        grow: 2,
        minWidth: "240px",
        cell: (row) => (
          <p
            className="line-clamp-2 py-3 leading-5 text-slate-600"
            title={row.message || ""}
          >
            {row.message || "No message provided"}
          </p>
        ),
      },
      {
        name: "Received",
        selector: (row) => row.createdAt || "",
        sortable: true,
        minWidth: "170px",
        cell: (row) => (
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-slate-500">
            <CalendarDays size={14} className="text-slate-400" />
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        name: "Action",
        right: true,
        minWidth: "110px",
        cell: (row) => (
          <button
            type="button"
            onClick={() => row.handleDelete(row._id)}
            aria-label={`Delete contact message from ${row.username || "user"}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              <MessageSquareText size={14} />
              Inbox management
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Contact messages
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Review messages submitted through your website and get in touch
              with customers.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchContacts}
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
              Total messages
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UsersRound size={19} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : data.length}
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
            {loading ? "—" : filteredItems.length}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-semibold text-slate-900">All messages</h2>
            <p className="mt-1 text-xs text-slate-500">
              Search by name, email, phone number, or message.
            </p>
          </div>
          <label className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Search messages..."
              value={filterText}
              onChange={(event) => setFilterText(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>
        </div>

        {error && !loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <p className="font-semibold text-slate-800">
              Couldn’t load contact messages
            </p>
            <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={fetchContacts}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 15, 20, 30]}
            highlightOnHover
            responsive
            progressPending={loading}
            progressComponent={
              <div className="flex min-h-48 items-center gap-3 text-sm text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                Loading contact messages...
              </div>
            }
            noDataComponent={
              <div className="py-12 text-center">
                <MessageSquareText
                  size={28}
                  className="mx-auto mb-3 text-slate-300"
                />
                <p className="text-sm font-semibold text-slate-700">
                  {filterText ? "No matching messages" : "No messages yet"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {filterText
                    ? "Try another search term."
                    : "New contact form submissions will appear here."}
                </p>
              </div>
            }
          />
        )}
      </section>
    </div>
  );
};

export default Contact;
