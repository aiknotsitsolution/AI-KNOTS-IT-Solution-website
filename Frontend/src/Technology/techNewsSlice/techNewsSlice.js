import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTechNews = createAsyncThunk(
  "techNews/fetchTechNews",
  async ({ page = 1, limit = 6, category = "All" } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (category !== "All") {
        params.category = category;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/tech`, {
        params,
      });
      const items = response.data?.data;
      const categories = response.data?.categories;
      const pagination = response.data?.pagination;

      if (
        !Array.isArray(items) ||
        !Array.isArray(categories) ||
        !pagination ||
        !Number.isInteger(pagination.page) ||
        !Number.isInteger(pagination.limit) ||
        !Number.isInteger(pagination.total) ||
        !Number.isInteger(pagination.totalPages)
      ) {
        throw new Error("Unexpected tech news response");
      }

      const formatted = items.map((item, index) => ({
        id: item._id || `item-${index + 1}`,
        title: item.title || "Untitled",
        description: item.description || "No description available",
        date:
          item.updatedAt || item.createdAt
            ? new Date(item.updatedAt || item.createdAt).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )
            : new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
        category: item.category?.name || "General",
        link: item.link || item.url || "#",
        image: item.images && item.images.length > 0 ? item.images[0] : null,
      }));

      return {
        items: formatted,
        categories,
        pagination,
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load tech news";
      return rejectWithValue(message);
    }
  },
);

const initialState = {
  items: [],
  categories: [],
  pagination: {
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  },
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedCategory: "All",
  currentRequestId: null,
};

const techNewsSlice = createSlice({
  name: "techNews",
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechNews.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchTechNews.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.status = "succeeded";
        state.items = action.payload.items;
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
        state.currentRequestId = null;
      })
      .addCase(fetchTechNews.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.status = "failed";
        state.error = action.payload;
        state.currentRequestId = null;
      });
  },
});

export const { setSelectedCategory } = techNewsSlice.actions;
export default techNewsSlice.reducer;
