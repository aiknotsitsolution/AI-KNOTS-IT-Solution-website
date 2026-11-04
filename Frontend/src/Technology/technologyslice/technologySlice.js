// // import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // export const fetchCategories = createAsyncThunk(
// //   "technology/fetchCategories",
// //   async (_, { rejectWithValue }) => {
// //     try {
// //       const res = await fetch("https://api.aiknotsit.com/api/technology/category");
// //       if (!res.ok) throw new Error("Failed to fetch categories");
// //       const data = await res.json();
// //       return Array.isArray(data.data) ? data.data : [];
// //     } catch (err) {
// //       return rejectWithValue(err.message || "Failed to load categories");
// //     }
// //   }
// // );

// // // Fetch products (list)
// // export const fetchProducts = createAsyncThunk(
// //   "technology/fetchProducts",
// //   async (categoryId, { rejectWithValue }) => {
// //     try {
// //       let url = "https://api.aiknotsit.com/api/technology/product";
// //       if (categoryId) url += `?category=${categoryId}`;

// //       const res = await fetch(url);
// //       if (!res.ok) throw new Error("Failed to fetch products");
// //       const data = await res.json();
// //       let items = data.data || [];
// //       if (!Array.isArray(items)) items = [];

// //       return items.map((item, index) => ({
// //         id: item._id || `item-${index + 1}`,
// //         _id: item._id,
// //         slug: item.slug,                    // ← Added Slug
// //         title: item.title || item.name || "Untitled",
// //         description: item.description || "No description available",
// //         date:
// //           item.updatedAt || item.createdAt
// //             ? new Date(item.updatedAt || item.createdAt).toLocaleDateString(
// //                 "en-US",
// //                 {
// //                   month: "short",
// //                   day: "numeric",
// //                   year: "numeric",
// //                 }
// //               )
// //             : "Recently",
// //         category: item.category?.name || "General",
// //         categoryId: item.category?._id,
// //         image: item.images?.[0] || null,
// //         images: item.images || [],
// //         views: item.views || 0,
// //         likes: item.likes || 0,
// //         comments: item.comments || [],
// //         author: item.author || "Tech Team",
// //         trending: Math.random() > 0.7,
// //       }));
// //     } catch (err) {
// //       return rejectWithValue(err.message || "Failed to load products");
// //     }
// //   }
// // );

// // // Fetch Single Post by Slug
// // // export const fetchSinglePost = createAsyncThunk(
// // //   "technology/fetchSinglePost",
// // //   async (slug, { rejectWithValue }) => {
// // //     try {
// // //       const res = await fetch(
// // //         `https://api.aiknotsit.com/api/technology/product/technology/${slug}`
// // //       );
// // //       if (!res.ok) throw new Error("Failed to fetch post");
// // //       const data = await res.json();
// // //       const item = data.data || data;
// // //       return {
// // //         id: item._id,
// // //         _id: item._id,
// // //         slug: item.slug,                    // ← Added Slug
// // //         title: item.title || item.name || "Untitled",
// // //         description: item.description || "",
// // //         date: item.updatedAt
// // //           ? new Date(item.updatedAt).toLocaleDateString("en-US", {
// // //               month: "short",
// // //               day: "numeric",
// // //               year: "numeric",
// // //             })
// // //           : "Recently",
// // //         category: item.category?.name || "General",
// // //         image: item.images?.[0] || null,
// // //         images: item.images || [],
// // //         views: item.views || 0,
// // //         likes: item.likes || 0,
// // //         comments: item.comments || [],
// // //         author: item.author || "Tech Team",
// // //       };
// // //     } catch (err) {
// // //       return rejectWithValue(err.message || "Failed to fetch post details");
// // //     }
// // //   }
// // // );
// // // Fetch Single Post by Slug
// // export const fetchSinglePost = createAsyncThunk(
// //   "technology/fetchSinglePost",
// //   async (slug, { rejectWithValue }) => {
// //     try {
// //       const res = await fetch(
// //         `https://api.aiknotsit.com/api/technology/product/technology/${slug}`   // ← Correct
// //       );

// //       if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);

// //       const data = await res.json();
// //       console.log("✅ Single Post Response:", data);   // Debugging

// //       const item = data.data || data;

// //       return {
// //         id: item._id,
// //         _id: item._id,
// //         slug: item.slug,
// //         title: item.title || item.name || "Untitled",
// //         description: item.description || item.content || "",
// //         date: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("en-US", {
// //           month: "short", day: "numeric", year: "numeric"
// //         }) : "Recently",
// //         category: item.category?.name || "General",
// //         image: item.images?.[0] || null,
// //         views: item.views || 0,
// //         likes: item.likes || 0,
// //         comments: item.comments || [],
// //         author: item.author || "Tech Team",
// //       };
// //     } catch (err) {
// //       console.error("Fetch Error:", err);
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );
// // // ====================== ENGAGEMENT THUNKS ======================

// // export const incrementPostView = createAsyncThunk(
// //   "technology/incrementView",
// //   async (slug, { rejectWithValue }) => {
// //     try {
// //       const res = await fetch(
// //         `https://api.aiknotsit.com/api/technology/product/technology/${slug}/view`,
// //         { method: "PUT" }
// //       );
// //       const data = await res.json();
// //       if (!data.success) throw new Error(data.message);
// //       return { slug, views: data.views };
// //     } catch (err) {
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // export const togglePostLike = createAsyncThunk(
// //   "technology/toggleLike",
// //   async ({ slug, email }, { rejectWithValue }) => {
// //     try {
// //       const res = await fetch(
// //         `https://api.aiknotsit.com/api/technology/product/technology/${slug}/like`,
// //         {
// //           method: "PUT",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ email }),
// //         }
// //       );
// //       const data = await res.json();
// //       if (!data.success) throw new Error(data.message);
// //       return { slug, likes: data.likes, liked: data.liked };
// //     } catch (err) {
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // export const sendCommentOtp = createAsyncThunk(
// //   "technology/sendCommentOtp",
// //   async ({ slug, name, email, phone }, { rejectWithValue }) => {
// //     try {
// //       const res = await fetch(
// //         `https://api.aiknotsit.com/api/technology/product/technology/${slug}/send-otp`,
// //         {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ name, email, phone }),
// //         }
// //       );
// //       const data = await res.json();
// //       if (!data.success) throw new Error(data.message);
// //       return data;
// //     } catch (err) {
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // export const postCommentWithOtp = createAsyncThunk(
// //   "technology/postCommentWithOtp",
// //   async ({ slug, email, otp, comment }, { rejectWithValue }) => {
// //     try {
// //       const res = await fetch(
// //         `https://api.aiknotsit.com/api/technology/product/technology/${slug}/add-comment`,
// //         {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ email, otp, comment }),
// //         }
// //       );
// //       const data = await res.json();
// //       if (!data.success) throw new Error(data.message);
// //       return { slug, comments: data.comments };
// //     } catch (err) {
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // ====================== SLICE ======================
// // const technologySlice = createSlice({
// //   name: "technology",
// //   initialState: {
// //     categories: [],
// //     selectedCategory: { _id: null, name: "All" },
// //     newsItems: [],
// //     loading: false,
// //     error: null,
// //   },
// //   reducers: {
// //     setSelectedCategory(state, action) {
// //       state.selectedCategory = action.payload;
// //     },
// //     clearError(state) {
// //       state.error = null;
// //     },
// //   },
// //   extraReducers: (builder) => {
// //     // Categories
// //     builder
// //       .addCase(fetchCategories.pending, (state) => {
// //         state.error = null;
// //       })
// //       .addCase(fetchCategories.fulfilled, (state, action) => {
// //         state.categories = action.payload;
// //       })
// //       .addCase(fetchCategories.rejected, (state, action) => {
// //         state.error = action.payload;
// //       })

// //       // Products List
// //       .addCase(fetchProducts.pending, (state) => {
// //         state.loading = true;
// //         state.error = null;
// //       })
// //       .addCase(fetchProducts.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.newsItems = action.payload;
// //       })
// //       .addCase(fetchProducts.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload;
// //       })

// //       // Single Post
// //       .addCase(fetchSinglePost.pending, (state) => {
// //         state.loading = true;
// //         state.error = null;
// //       })
// //       .addCase(fetchSinglePost.fulfilled, (state, action) => {
// //         state.loading = false;
// //         const index = state.newsItems.findIndex(
// //           (item) => item.slug === action.payload.slug || item._id === action.payload._id
// //         );
// //         if (index !== -1) {
// //           state.newsItems[index] = action.payload;
// //         } else {
// //           state.newsItems.unshift(action.payload);
// //         }
// //       })
// //       .addCase(fetchSinglePost.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload;
// //       })

// //       // Engagement Cases
// //       .addCase(incrementPostView.fulfilled, (state, action) => {
// //         const { slug, views } = action.payload;
// //         const item = state.newsItems.find(
// //           (i) => i.slug === slug || i._id === slug
// //         );
// //         if (item) item.views = views;
// //       })

// //       .addCase(togglePostLike.fulfilled, (state, action) => {
// //         const { slug, likes } = action.payload;
// //         const item = state.newsItems.find(
// //           (i) => i.slug === slug || i._id === slug
// //         );
// //         if (item) item.likes = likes;
// //       })

// //       .addCase(postCommentWithOtp.fulfilled, (state, action) => {
// //         const { slug, comments } = action.payload;
// //         const item = state.newsItems.find(
// //           (i) => i.slug === slug || i._id === slug
// //         );
// //         if (item) item.comments = comments;
// //       });
// //   },
// // });

// // export const { setSelectedCategory, clearError } = technologySlice.actions;
// // export default technologySlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // Fetch Categories
// export const fetchCategories = createAsyncThunk(
//   "technology/fetchCategories",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await fetch("https://api.aiknotsit.com/api/technology/category");
//       if (!res.ok) throw new Error("Failed to fetch categories");
//       const data = await res.json();
//       return Array.isArray(data.data) ? data.data : [];
//     } catch (err) {
//       return rejectWithValue(err.message || "Failed to load categories");
//     }
//   }
// );

// // Fetch Products (with optional category filter)
// export const fetchProducts = createAsyncThunk(
//   "technology/fetchProducts",
//   async (categoryId, { rejectWithValue }) => {
//     try {
//       let url = "https://api.aiknotsit.com/api/technology/product";
//       if (categoryId) url += `?category=${categoryId}`;

//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to fetch products");
//       const data = await res.json();

//       let items = data.data || [];
//       if (!Array.isArray(items)) items = [];

//       return items.map((item, index) => ({
//         id: item._id || `item-${index + 1}`,
//         _id: item._id,
//         slug: item.slug,
//         title: item.title || item.name || "Untitled",
//         description: item.description || "No description available",
//         date: item.updatedAt || item.createdAt
//           ? new Date(item.updatedAt || item.createdAt).toLocaleDateString("en-US", {
//               month: "short",
//               day: "numeric",
//               year: "numeric",
//             })
//           : "Recently",
//         category: item.category?.name || "General",
//         categoryId: item.category?._id,
//         image: item.images?.[0] || null,
//         images: item.images || [],
//         views: item.views || 0,
//         likes: item.likes || 0,
//         comments: item.comments || [],
//         author: item.author || "Tech Team",
//         trending: Math.random() > 0.7,
//       }));
//     } catch (err) {
//       return rejectWithValue(err.message || "Failed to load products");
//     }
//   }
// );

// // Fetch Single Post by Slug
// export const fetchSinglePost = createAsyncThunk(
//   "technology/fetchSinglePost",
//   async (slug, { rejectWithValue }) => {
//     try {
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/technology/product/technology/${slug}`
//       );

//       if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);

//       const data = await res.json();
//       console.log("✅ Single Post Response:", data);

//       const item = data.data || data;

//       return {
//         id: item._id,
//         _id: item._id,
//         slug: item.slug,
//         title: item.title || item.name || "Untitled",
//         description: item.description || item.content || "",
//         date: item.updatedAt
//           ? new Date(item.updatedAt).toLocaleDateString("en-US", {
//               month: "short",
//               day: "numeric",
//               year: "numeric",
//             })
//           : "Recently",
//         category: item.category?.name || "General",
//         image: item.images?.[0] || null,
//         images: item.images || [],
//         views: item.views || 0,
//         likes: item.likes || 0,
//         comments: item.comments || [],
//         author: item.author || "Tech Team",
//       };
//     } catch (err) {
//       console.error("Fetch Single Post Error:", err);
//       return rejectWithValue(err.message || "Failed to fetch post details");
//     }
//   }
// );

// // ====================== ENGAGEMENT ======================
// export const incrementPostView = createAsyncThunk(
//   "technology/incrementView",
//   async (slug, { rejectWithValue }) => {
//     try {
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/technology/product/technology/${slug}/view`,
//         { method: "PUT" }
//       );
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       return { slug, views: data.views };
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const togglePostLike = createAsyncThunk(
//   "technology/toggleLike",
//   async ({ slug, email }, { rejectWithValue }) => {
//     try {
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/technology/product/technology/${slug}/like`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email }),
//         }
//       );
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       return { slug, likes: data.likes, liked: data.liked };
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const sendCommentOtp = createAsyncThunk(
//   "technology/sendCommentOtp",
//   async ({ slug, name, email, phone }, { rejectWithValue }) => {
//     try {
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/technology/product/technology/${slug}/send-otp`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ name, email, phone }),
//         }
//       );
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       return data;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const postCommentWithOtp = createAsyncThunk(
//   "technology/postCommentWithOtp",
//   async ({ slug, email, otp, comment }, { rejectWithValue }) => {
//     try {
//       const res = await fetch(
//         `https://api.aiknotsit.com/api/technology/product/technology/${slug}/comment`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, otp, comment }),
//         }
//       );
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       return { slug, comments: data.comments };
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // ====================== SLICE ======================
// const technologySlice = createSlice({
//   name: "technology",
//   initialState: {
//     categories: [],
//     selectedCategory: { _id: null, name: "All" },
//     newsItems: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     setSelectedCategory(state, action) {
//       state.selectedCategory = action.payload;
//     },
//     clearError(state) {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Categories
//       .addCase(fetchCategories.fulfilled, (state, action) => {
//         state.categories = action.payload;
//       })
//       .addCase(fetchCategories.rejected, (state, action) => {
//         state.error = action.payload;
//       })

//       // Products List
//       .addCase(fetchProducts.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchProducts.fulfilled, (state, action) => {
//         state.loading = false;
//         state.newsItems = action.payload;
//       })
//       .addCase(fetchProducts.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Single Post
//       .addCase(fetchSinglePost.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchSinglePost.fulfilled, (state, action) => {
//         state.loading = false;
//         const index = state.newsItems.findIndex(
//           (item) => item.slug === action.payload.slug
//         );
//         if (index !== -1) {
//           state.newsItems[index] = action.payload;
//         } else {
//           state.newsItems.unshift(action.payload);
//         }
//       })
//       .addCase(fetchSinglePost.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Engagement
//       .addCase(incrementPostView.fulfilled, (state, action) => {
//         const { slug, views } = action.payload;
//         const item = state.newsItems.find((i) => i.slug === slug);
//         if (item) item.views = views;
//       })

//       .addCase(togglePostLike.fulfilled, (state, action) => {
//         const { slug, likes } = action.payload;
//         const item = state.newsItems.find((i) => i.slug === slug);
//         if (item) item.likes = likes;
//       })

//       .addCase(postCommentWithOtp.fulfilled, (state, action) => {
//         const { slug, comments } = action.payload;
//         const item = state.newsItems.find((i) => i.slug === slug);
//         if (item) item.comments = comments;
//       });
//   },
// });

// export const { setSelectedCategory, clearError } = technologySlice.actions;
// export default technologySlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch Categories
export const fetchCategories = createAsyncThunk(
  "technology/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || window.location.origin}/api/technology/category`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load categories");
    }
  },
);

// Fetch Products (with optional category filter)
export const fetchProducts = createAsyncThunk(
  "technology/fetchProducts",
  async (categoryId, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      let url = `${baseUrl}/api/technology/product`;
      if (categoryId) url += `?category=${categoryId}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();

      let items = data.data || [];
      if (!Array.isArray(items)) items = [];

      return items.map((item, index) => ({
        id: item._id || `item-${index + 1}`,
        _id: item._id,
        slug: item.slug,
        title: item.title || item.name || "Untitled",
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
            : "Recently",
        category: item.category?.name || "General",
        categoryId: item.category?._id,
        image: item.images?.[0] || null,
        images: item.images || [],
        views: item.views || 0,
        likes: item.likes || 0,
        comments: item.comments || [],
        author: item.author || "Tech Team",
        trending: Math.random() > 0.7,
      }));
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load products");
    }
  },
);

// Fetch Single Post by Slug
export const fetchSinglePost = createAsyncThunk(
  "technology/fetchSinglePost",
  async (slug, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const res = await fetch(
        `${baseUrl}/api/technology/product/technology/${slug}`,
      );

      if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);

      const data = await res.json();
      const item = data.data || data;

      return {
        id: item._id,
        _id: item._id,
        slug: item.slug,
        title: item.title || item.name || "Untitled",
        description: item.description || item.content || "",
        date: item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently",
        category: item.category?.name || "General",
        image: item.images?.[0] || null,
        images: item.images || [],
        views: item.views || 0,
        likes: item.likes || 0,
        comments: item.comments || [],
        author: item.author || "Tech Team",
      };
    } catch (err) {
      console.error("Fetch Single Post Error:", err);
      return rejectWithValue(err.message || "Failed to fetch post details");
    }
  },
);

// ====================== ENGAGEMENT ======================
export const incrementPostView = createAsyncThunk(
  "technology/incrementView",
  async (slug, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const res = await fetch(
        `${baseUrl}/api/technology/product/technology/${slug}/view`,
        { method: "PUT" },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return { slug, views: data.views };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const togglePostLike = createAsyncThunk(
  "technology/toggleLike",
  async ({ slug, email }, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const res = await fetch(
        `${baseUrl}/api/technology/product/technology/${slug}/like`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return { slug, likes: data.likes, liked: data.liked };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const sendCommentOtp = createAsyncThunk(
  "technology/sendCommentOtp",
  async ({ slug, name, email, phone }, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const res = await fetch(
        `${baseUrl}/api/technology/product/technology/${slug}/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone }),
        },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const verifyCommentOtp = createAsyncThunk(
  "technology/verifyCommentOtp",
  async ({ slug, email, otp }, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const res = await fetch(
        `${baseUrl}/api/technology/product/technology/${slug}/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        },
      );
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "OTP verification failed");
      return { slug, email };
    } catch (err) {
      return rejectWithValue(err.message || "Error verifying OTP");
    }
  },
);

export const postComment = createAsyncThunk(
  "technology/postComment",
  async ({ slug, email, comment }, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const res = await fetch(
        `${baseUrl}/api/technology/product/technology/${slug}/add-comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: email, comment }),
        },
      );
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to post comment");
      return { slug, comments: data.comments };
    } catch (err) {
      return rejectWithValue(err.message || "Error posting comment");
    }
  },
);

// ====================== SLICE ======================
const technologySlice = createSlice({
  name: "technology",
  initialState: {
    categories: [],
    selectedCategory: { _id: null, name: "All" },
    newsItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Products List
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.newsItems = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Single Post
      .addCase(fetchSinglePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSinglePost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.newsItems.findIndex(
          (item) => item.slug === action.payload.slug,
        );
        if (index !== -1) {
          state.newsItems[index] = action.payload;
        } else {
          state.newsItems.unshift(action.payload);
        }
      })
      .addCase(fetchSinglePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Engagement
      .addCase(incrementPostView.fulfilled, (state, action) => {
        const { slug, views } = action.payload;
        const item = state.newsItems.find((i) => i.slug === slug);
        if (item) item.views = views;
      })

      .addCase(togglePostLike.fulfilled, (state, action) => {
        const { slug, likes } = action.payload;
        const item = state.newsItems.find((i) => i.slug === slug);
        if (item) item.likes = likes;
      })

      .addCase(postComment.fulfilled, (state, action) => {
        const { slug, comments } = action.payload;
        const item = state.newsItems.find((i) => i.slug === slug);
        if (item) item.comments = comments;
      });
  },
});

export const { setSelectedCategory, clearError } = technologySlice.actions;
export default technologySlice.reducer;
