import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";

export const jobApplicationsApi = createApi({
  reducerPath: "jobApplicationsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ["JobApplications"],
  endpoints: (builder) => ({
    getJobApplications: builder.query({
      query: (jobId) =>
        jobId ? `/jobapplication/job/${jobId}` : "/jobapplication/",
      transformResponse: (response, _meta, jobId) => ({
        applications: Array.isArray(response.data) ? response.data : [],
        jobTitle:
          response.jobTitle ||
          (jobId ? "Job Applications" : "All Job Applications"),
      }),
      providesTags: ["JobApplications"],
    }),
    updateJobApplicationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/jobapplication/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["JobApplications"],
    }),
  }),
});

export const {
  useGetJobApplicationsQuery,
  useUpdateJobApplicationStatusMutation,
} = jobApplicationsApi;
