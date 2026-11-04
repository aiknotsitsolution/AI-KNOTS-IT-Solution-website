import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    getGalleryImages: builder.query({
      query: () => "/api/gallery",
      transformResponse: (response) => {
        if (!response?.success || !Array.isArray(response.data)) {
          throw new Error("Invalid gallery response");
        }

        return response.data
          .flatMap((item) => item.images || [])
          .filter((url) => typeof url === "string" && url.trim() !== "");
      },
    }),
    getJobOpenings: builder.query({
      query: () => "/jobapply",
      transformResponse: (response) => {
        if (!Array.isArray(response?.data)) {
          throw new Error("Invalid job openings response");
        }
        return response.data;
      },
    }),
    applyForJob: builder.mutation({
      query: ({ jobId, formData }) => ({
        url: `/jobapplication/apply/${jobId}`,
        method: "POST",
        body: formData,
      }),
    }),
    getRecentWork: builder.query({
      query: () => "/recentwork",
      transformResponse: (response) => {
        if (!Array.isArray(response?.data)) {
          throw new Error("Invalid recent work response");
        }

        return response.data.map((item) => ({
          id: item._id,
          title: item.title,
          categories: item.category ? [item.category.name] : ["General"],
          image: item.images?.[0] || "https://via.placeholder.com/600x400",
          link: item.link || "#",
        }));
      },
    }),
  }),
});

export const {
  useGetGalleryImagesQuery,
  useGetJobOpeningsQuery,
  useApplyForJobMutation,
  useGetRecentWorkQuery,
} = publicApi;
