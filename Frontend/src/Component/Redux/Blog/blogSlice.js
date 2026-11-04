// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // Async thunk to fetch categories
// export const fetchCategories = createAsyncThunk(
//   "blog/fetchCategories",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await fetch("https://api.aiknotsit.com/api/blogcategory");
//       if (!res.ok) throw new Error("Failed to fetch categories");
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message || "Failed");
//       return ["All", ...data.data.map((c) => c.name)];
//     } catch (err) {
//       return rejectWithValue(err.message || "Error fetching categories");
//     }
//   },
// );

// // Async thunk to fetch all blog posts
// export const fetchBlogPosts = createAsyncThunk(
//   "blog/fetchBlogPosts",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await fetch("https://api.aiknotsit.com/api/product");
//       if (!res.ok) throw new Error("Failed to fetch posts");
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message || "Failed");
//       return data.data || [];
//     } catch (err) {
//       return rejectWithValue(err.message || "Error fetching blog posts");
//     }
//   },
// );

// // Async thunk to fetch SINGLE blog post by ID
// export const fetchBlogPostById = createAsyncThunk(
//   "blog/fetchBlogPostById",
//   async (postId, { rejectWithValue }) => {
//     try {
//       const res = await fetch(`https://api.aiknotsit.com/api/product/${postId}`);
//       if (!res.ok) throw new Error("Post not found");
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message || "Failed to load post");
//       return data.data;
//     } catch (err) {
//       return rejectWithValue(err.message || "Error loading blog post");
//     }
//   },
// );

// // ====================== NEW THUNKS ======================

// export const incrementPostView = createAsyncThunk(
//   "blog/incrementView",
//   async (postId, { rejectWithValue }) => {
//     try {
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/product/${postId}/view`,
//         {
//           method: "PUT",
//         },
//       );
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       return { postId, views: data.views };
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   },
// );

// export const togglePostLike = createAsyncThunk(
//   "blog/toggleLike",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const { postId, email } =
//         typeof payload === "string" ? { postId: payload } : payload;
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/product/${postId}/like`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email }),
//         },
//       );
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       return { postId, likes: data.likes, liked: data.liked };
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   },
// );

// export const sendCommentOtp = createAsyncThunk(
//   "blog/sendCommentOtp",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const { postId, name, email, phone } = payload;
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/product/${postId}/send-otp`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ name, email, phone }),
//         },
//       );
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       return data;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   },
// );

// export const verifyCommentOtp = createAsyncThunk(
//   "blog/verifyCommentOtp",
//   async ({ postId, email, otp }, { rejectWithValue }) => {
//     try {
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/product/${postId}/verify-otp`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, otp }),
//         },
//       );
//       const data = await res.json();
//       if (!data.success)
//         throw new Error(data.message || "OTP verification failed");
//       return { userId: data.userId, email };
//     } catch (err) {
//       return rejectWithValue(err.message || "Error verifying OTP");
//     }
//   },
// );

// export const postComment = createAsyncThunk(
//   "blog/postComment",
//   async ({ postId, email, comment }, { rejectWithValue }) => {
//     try {
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/product/${postId}/comment`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userEmail: email, comment }),
//         },
//       );
//       const data = await res.json();
//       if (!data.success)
//         throw new Error(data.message || "Failed to post comment");
//       return { postId, comments: data.comments };
//     } catch (err) {
//       return rejectWithValue(err.message || "Error posting comment");
//     }
//   },
// );

// const blogSlice = createSlice({
//   name: "blog",
//   initialState: {
//     categories: ["All"],
//     posts: [],
//     activeCategory: "All",

//     // List page
//     status: "idle",
//     error: null,

//     // Detail page
//     currentPost: null,
//     detailStatus: "idle",
//     detailError: null,

//     // Engagement loading states (optional but useful)
//     likeStatus: "idle",
//     commentStatus: "idle",
//   },
//   reducers: {
//     setActiveCategory: (state, action) => {
//       state.activeCategory = action.payload;
//     },
//     clearCurrentPost: (state) => {
//       state.currentPost = null;
//       state.detailStatus = "idle";
//       state.detailError = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Categories
//       .addCase(fetchCategories.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(fetchCategories.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.categories = action.payload;
//       })
//       .addCase(fetchCategories.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       })

//       // All Posts (list)
//       .addCase(fetchBlogPosts.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(fetchBlogPosts.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.posts = action.payload;
//       })
//       .addCase(fetchBlogPosts.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       })

//       // Single Post (detail)
//       .addCase(fetchBlogPostById.pending, (state) => {
//         state.detailStatus = "loading";
//         state.detailError = null;
//       })
//       .addCase(fetchBlogPostById.fulfilled, (state, action) => {
//         state.detailStatus = "succeeded";
//         state.currentPost = action.payload;
//       })
//       .addCase(fetchBlogPostById.rejected, (state, action) => {
//         state.detailStatus = "failed";
//         state.detailError = action.payload;
//       })

//       // ====================== NEW CASES ======================
//       .addCase(incrementPostView.fulfilled, (state, action) => {
//         const { postId, views } = action.payload;
//         const post = state.posts.find((p) => p._id === postId);
//         if (post) post.views = views;
//       })

//       .addCase(togglePostLike.fulfilled, (state, action) => {
//         const { postId, likes } = action.payload;
//         const post = state.posts.find((p) => p._id === postId);
//         if (post) post.likes = likes;
//       })

//       .addCase(postComment.fulfilled, (state, action) => {
//         const { postId, comments } = action.payload;
//         const post = state.posts.find((p) => p._id === postId);
//         if (post) post.comments = comments;
//       });
//   },
// });

// export const { setActiveCategory, clearCurrentPost } = blogSlice.actions;
// export default blogSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch categories
export const fetchCategories = createAsyncThunk(
  "blog/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
      const res = await fetch(`${baseUrl}/api/blogcategory`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed");
      return ["All", ...data.data.map((c) => c.name)];
    } catch (err) {
      return rejectWithValue(err.message || "Error fetching categories");
    }
  },
);

// Fetch one page of blog posts
export const fetchBlogPosts = createAsyncThunk(
  "blog/fetchBlogPosts",
  async (
    { page = 1, limit = 6, category = "All" } = {},
    { rejectWithValue },
  ) => {
    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
      const params = new URLSearchParams({ page, limit });
      if (category !== "All") params.set("category", category);

      const res = await fetch(`${baseUrl}/api/product?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed");
      if (
        !Array.isArray(data.data) ||
        !data.pagination ||
        !Number.isInteger(data.pagination.page) ||
        !Number.isInteger(data.pagination.limit) ||
        !Number.isInteger(data.pagination.total) ||
        !Number.isInteger(data.pagination.totalPages)
      ) {
        throw new Error("Unexpected paginated blog response");
      }

      return { posts: data.data, pagination: data.pagination };
    } catch (err) {
      return rejectWithValue(err.message || "Error fetching blog posts");
    }
  },
);

// ==================== FIXED: Works with SLUG ====================
export const fetchBlogPostById = createAsyncThunk(
  "blog/fetchBlogPostById",
  async (identifier, { rejectWithValue }) => {
    // identifier = slug or id
    try {
      if (!identifier) throw new Error("Slug/ID is required");

      const baseUrl =
        import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
      const res = await fetch(`${baseUrl}/api/product/${identifier}`);
      if (!res.ok) throw new Error("Post not found");

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load post");

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || "Error loading blog post");
    }
  },
);

// ====================== Engagement Thunks ======================

export const incrementPostView = createAsyncThunk(
  "blog/incrementView",
  async (postId, { rejectWithValue }) => {
    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
      const res = await fetch(`${baseUrl}/api/product/${postId}/view`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return { postId, views: data.views };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const togglePostLike = createAsyncThunk(
  "blog/toggleLike",
  async (payload, { rejectWithValue }) => {
    try {
      const { postId, email } =
        typeof payload === "string" ? { postId: payload } : payload;

      const baseUrl =
        import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
      const res = await fetch(`${baseUrl}/api/product/${postId}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return { postId, likes: data.likes };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const sendCommentOtp = createAsyncThunk(
  "blog/sendCommentOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const { postId, name, email, phone } = payload;
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
      const res = await fetch(`${baseUrl}/api/product/${postId}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const verifyCommentOtp = createAsyncThunk(
  "blog/verifyCommentOtp",
  async ({ postId, email, otp }, { rejectWithValue }) => {
    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
      const res = await fetch(`${baseUrl}/api/product/${postId}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "OTP verification failed");
      return { userId: data.userId, email };
    } catch (err) {
      return rejectWithValue(err.message || "Error verifying OTP");
    }
  },
);

export const postComment = createAsyncThunk(
  "blog/postComment",
  async ({ postId, email, comment }, { rejectWithValue }) => {
    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "https://api.aiknotsit.com";
      const res = await fetch(`${baseUrl}/api/product/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, comment }),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to post comment");
      return { postId, comments: data.comments };
    } catch (err) {
      return rejectWithValue(err.message || "Error posting comment");
    }
  },
);

const blogSlice = createSlice({
  name: "blog",
  initialState: {
    categories: ["All"],
    posts: [],
    activeCategory: "All",
    pagination: { page: 1, limit: 6, total: 0, totalPages: 0 },
    currentPostsRequestId: null,

    status: "idle",
    error: null,

    currentPost: null,
    detailStatus: "idle",
    detailError: null,
  },
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesStatus = "failed";
        state.categoriesError = action.payload;
      })

      // All Posts
      .addCase(fetchBlogPosts.pending, (state, action) => {
        state.status = "loading";
        state.currentPostsRequestId = action.meta.requestId;
      })
      .addCase(fetchBlogPosts.fulfilled, (state, action) => {
        if (state.currentPostsRequestId !== action.meta.requestId) return;

        state.status = "succeeded";
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.currentPostsRequestId = null;
      })
      .addCase(fetchBlogPosts.rejected, (state, action) => {
        if (state.currentPostsRequestId !== action.meta.requestId) return;

        state.status = "failed";
        state.error = action.payload;
        state.currentPostsRequestId = null;
      })

      // Single Post (Now supports Slug)
      .addCase(fetchBlogPostById.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchBlogPostById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.currentPost = action.payload;
      })
      .addCase(fetchBlogPostById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload;
      })

      // Engagement
      .addCase(incrementPostView.fulfilled, (state, action) => {
        const { postId, views } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) post.views = views;
        if (state.currentPost?._id === postId) state.currentPost.views = views;
      })

      .addCase(togglePostLike.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) post.likes = likes;
        if (state.currentPost?._id === postId) state.currentPost.likes = likes;
      })

      .addCase(postComment.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) post.comments = comments;
        if (state.currentPost?._id === postId)
          state.currentPost.comments = comments;
      });
  },
});

export const { setActiveCategory, clearCurrentPost } = blogSlice.actions;
export default blogSlice.reducer;
