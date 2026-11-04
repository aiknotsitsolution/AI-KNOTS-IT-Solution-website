import { useParams } from "react-router-dom";
import {
  useGetJobApplicationsQuery,
  useUpdateJobApplicationStatusMutation,
} from "./jobApplicationsApi";

const JobApplications = () => {
  const { jobId } = useParams();
  const {
    data,
    isLoading: loading,
    error,
  } = useGetJobApplicationsQuery(jobId || null);
  const [updateApplicationStatus] = useUpdateJobApplicationStatusMutation();
  const applications = data?.applications || [];
  const jobTitle = data?.jobTitle || (jobId ? "Job Applications" : "All Job Applications");
  const errorMessage =
    error?.data?.message || error?.error || (error ? "Failed to fetch applications" : "");

  const statusOptions = [
    "Pending",
    "Reviewed",
    "Shortlisted",
    "Rejected",
    "Accepted",
  ];

  // ==================== IMPROVED CLOUDINARY RESUME DOWNLOAD ====================
  const handleDownloadResume = async (url, name) => {
    try {
      let downloadUrl = url;

      // Cloudinary optimization - force download
      if (url.includes("cloudinary.com")) {
        const separator = url.includes("?") ? "&" : "?";
        downloadUrl = `${url}${separator}fl_attachment=true`;
      }

      const response = await fetch(downloadUrl, {
        method: "GET",
        mode: "cors",
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;

      const cleanName = name.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
      const fileName = `${cleanName}_Resume_${new Date().toISOString().slice(0, 10)}.pdf`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup memory
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1500);
    } catch (err) {
      console.error("Download Error:", err);

      // Fallback: Open in new tab with attachment flag
      let fallbackUrl = url;
      if (url.includes("cloudinary.com")) {
        const separator = url.includes("?") ? "&" : "?";
        fallbackUrl = `${url}${separator}fl_attachment=true`;
      }

      window.open(fallbackUrl, "_blank");
      alert("Direct download failed. Opening resume in new tab.");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateApplicationStatus({ id, status: newStatus }).unwrap();
    } catch (err) {
      console.error(err);
      alert(err?.status ? "Failed to update status" : "Status update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Applications for <span className="text-red-600">{jobTitle}</span>
        </h1>

        {loading && (
          <p className="text-center py-20 text-xl text-gray-600">
            Loading applications...
          </p>
        )}

        {errorMessage && (
          <p className="text-red-500 text-center py-20 text-lg">{errorMessage}</p>
        )}

        {!loading && !errorMessage && applications.length === 0 && (
          <p className="text-center py-20 text-gray-500 text-xl">
            No applications found.
          </p>
        )}

        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-semibold text-gray-900 truncate">
                  {app.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {app.email} • {app.phone}
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Applied:{" "}
                  {new Date(app.appliedAt || app.createdAt).toLocaleDateString(
                    "en-IN",
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                {app.resumeUrl && (
                  <button
                    onClick={() =>
                      handleDownloadResume(app.resumeUrl, app.name)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all active:scale-95"
                  >
                    📥 Download Resume
                  </button>
                )}

                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app._id, e.target.value)}
                  className="px-5 py-3 rounded-2xl border border-gray-300 focus:border-red-600 focus:ring-1 focus:ring-red-600 cursor-pointer text-sm font-medium"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobApplications;
