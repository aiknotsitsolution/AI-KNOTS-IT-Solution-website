import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import DOMPurify from "dompurify";
import { useTheme } from "../../context/ThemeContext";
import { Helmet } from "react-helmet-async";

import { Eye, Heart, MessageCircle, X, Loader2 } from "lucide-react";
import Toast from "../../Component/common/Toast.jsx";

import
{
  fetchCategories,
  fetchBlogPosts,
  setActiveCategory,
  incrementPostView,
  togglePostLike,
  sendCommentOtp,
  verifyCommentOtp,
  postComment,
} from "../Redux/Blog/blogSlice.js";

const POSTS_PER_PAGE = 6;

const Blog = () =>
{
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const {
    categories,
    posts: blogPosts,
    activeCategory,
    pagination,
    status,
    error,
  } = useSelector((state) => state.blog);

  const [currentPage, setCurrentPage] = useState(1);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingPostId, setPendingPostId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Local state for real-time like & comment count update
  const [updatedPosts, setUpdatedPosts] = useState({});

  // Track user likes
  const [userLikes, setUserLikes] = useState(new Set());

  // User Verification State
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const showToast = (type, title, message) =>
  {
    setToast({
      show: true,
      type,
      title,
      message,
    });

    setTimeout(() =>
    {
      setToast({
        show: false,
        type: "success",
        title: "",
        message: "",
      });
    }, 3000);
  };

  // Loading state for view increment
  const [viewLoadingIds, setViewLoadingIds] = useState(new Set());

  const refreshBlogPosts = useCallback(() =>
  {
    dispatch(
      fetchBlogPosts({
        page: currentPage,
        limit: POSTS_PER_PAGE,
        category: activeCategory,
      }),
    );
  }, [dispatch, currentPage, activeCategory]);

  // Load saved data from localStorage
  useEffect(() =>
  {
    const savedUser = localStorage.getItem("verifiedUser");
    if (savedUser)
    {
      try
      {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.email)
        {
          setUserInfo({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            phone: parsedUser.phone || "",
          });
          setIsVerified(true);
        }
      } catch (error)
      {
        console.error("Failed to parse verifiedUser from localStorage", error);
      }
    }

    const savedLikes = localStorage.getItem("userLikes");
    if (savedLikes) setUserLikes(new Set(JSON.parse(savedLikes)));
  }, []);

  // useEffect(() =>
  // {
  //   refreshBlogPosts();

  //   const timer = setTimeout(() => {
  //   refreshBlogPosts();
  // }, 800);

  //   const handleFocus = () => refreshBlogPosts();

  //   window.addEventListener("focus", handleFocus);

  //   return () =>
  //   {
  //      clearTimeout(timer);
  //     window.removeEventListener("focus", handleFocus);
  //   };
  // }, [refreshBlogPosts]);

  useEffect(() =>
{
  dispatch(fetchCategories());
}, [dispatch]);

useEffect(() =>
{
  refreshBlogPosts();
}, [refreshBlogPosts]);

  useEffect(() =>
  {
    const shouldRefresh = localStorage.getItem("blogCommentsUpdated");

    if (shouldRefresh === "true")
    {
      dispatch(
        fetchBlogPosts({
          page: currentPage,
          limit: POSTS_PER_PAGE,
          category: activeCategory,
        }),
      );
      localStorage.removeItem("blogCommentsUpdated");
    }
  }, [dispatch, currentPage, activeCategory]);

  // Merge updated likes & comments
  // const getCommentCount = (post) =>
  //   updatedPosts[post._id]?.commentsCount ??
  //   updatedPosts[post._id]?.comments?.length ??
  //   post.comments?.length ??
  //   post.commentsCount ??
  //   post.totalComments ??
  //   0;

const getCommentCount = (post) => {
  if (updatedPosts[post._id]?.comments) {
    return updatedPosts[post._id].comments.length;
  }

  if (Array.isArray(post.comments)) {
    return post.comments.length;
  }

  return (
    updatedPosts[post._id]?.commentsCount ??
    post.commentsCount ??
    post.totalComments ??
    0
  );
};


  const getCommentArray = (comments) => (Array.isArray(comments) ? comments : null);

  const mergedPosts = blogPosts.map((post) => ({
    ...post,
    likes: updatedPosts[post._id]?.likes ?? post.likes ?? 0,
    liked: updatedPosts[post._id]?.liked ?? post.liked ?? false,
    comments: updatedPosts[post._id]?.comments ?? post.comments ?? [],
    commentsCount: getCommentCount(post),
  }));

  const filteredPosts =
    mergedPosts;

  const totalPosts = pagination.total;
  const totalPages = pagination.totalPages;
  const currentPosts = filteredPosts;

  const goToPage = (page) =>
  {
    if (page >= 1 && page <= totalPages)
    {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () =>
  {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow)
    {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  // ==================== UPDATED handleAction with SLUG ====================
  const handleAction = (action, post) =>
  {
    const postSlug = post.slug || post._id; // ← Slug Fix

    if (action === "read")
    {
      // Increment view count
      setViewLoadingIds((prev) => new Set(prev).add(post._id));

      dispatch(incrementPostView(post._id));

      // Navigate after a small delay so backend gets the request
      setTimeout(() =>
      {
        setViewLoadingIds((prev) =>
        {
          const newSet = new Set(prev);
          newSet.delete(post._id);
          return newSet;
        });
        window.location.href = `/blog/${postSlug}`; // ← Changed to slug
      }, 150);

      return;
    }

    if (!isVerified)
    {
      setPendingPostId(post._id);
      setPendingAction(action);
      setShowVerifyModal(true);
      setStep("form");
      setUserInfo({ name: "", email: "", phone: "" });
      return;
    }

    if (action === "like")
    {
      setPendingAction(null);
      performLike(post._id);
    } else if (action === "comment")
    {
      setPendingPostId(post._id);
      setPendingAction("comment");
      setCommentText("");
      setShowCommentModal(true);
    }
  };

  const performLike = async (postId) =>
  {
    if (!userInfo.email)
    {
      showToast(
        "warning",
        "Verification Required",
        "Please verify with your email before liking posts."
      );
      return;
    }

    const result = await dispatch(
      togglePostLike({ postId, email: userInfo.email }),
    );
    if (!result.error)
    {
      const payload = result.payload?.data || result.payload || {};
      const previousLiked = Boolean(
        updatedPosts[postId]?.liked ?? userLikes.has(postId)
      );

      const newLiked =
        typeof payload.liked === "boolean" ? payload.liked : !previousLiked;
      const currentLikeCount =
        updatedPosts[postId]?.likes ??
        blogPosts.find((p) => p._id === postId)?.likes ??
        0;
      const updatedLikeCount =
        payload.likes ??
        payload.totalLikes ??
        Math.max(0, currentLikeCount + (newLiked ? 1 : -1));

      setUpdatedPosts((prev) => ({
        ...prev,
        [postId]: {
          ...(prev[postId] || {}),
          likes: updatedLikeCount,
          liked: newLiked,
        },
      }));
      // dispatch(fetchBlogPosts());

      const newLikes = new Set(userLikes);

      if (newLiked)
      {
        newLikes.add(postId);
      } else
      {
        newLikes.delete(postId);
      }

      setUserLikes(newLikes);
      localStorage.setItem("userLikes", JSON.stringify([...newLikes]));
    } else
    {
      showToast(
        "error",
        "Like Failed",
        result.payload || "Unable to update like."
      );
    }
  };

  const submitComment = async () =>
  {
    if (!commentText.trim())
    {
      showToast("warning", "Comment Required", "Please write a comment first.");
      return;
    }
    if (!userInfo.email)
    {
      showToast(
        "warning",
        "Verification Required",
        "Please verify with your email before commenting."
      );
      return;
    }

    setLoading(true);
    const result = await dispatch(
      postComment({
        postId: pendingPostId,
        email: userInfo.email,
        comment: commentText.trim(),
      }),
    );

    if (!result.error)
    {
      const currentPost = blogPosts.find((p) => p._id === pendingPostId);
      const currentComments =
        getCommentArray(updatedPosts[pendingPostId]?.comments) ??
        getCommentArray(currentPost?.comments) ??
        [];
      const payloadComments =
        result.payload?.comments ||
        result.payload?.data?.comments;
      const nextComments = Array.isArray(payloadComments)
        ? payloadComments
        : [
            ...currentComments,
            result.payload?.comment ||
              result.payload?.data?.comment || {
                comment: commentText.trim(),
                user: {
                  name: userInfo.name,
                  email: userInfo.email,
                },
                createdAt: new Date().toISOString(),
              },
          ];

      setUpdatedPosts((prev) => ({
        ...prev,
        [pendingPostId]: {
          ...(prev[pendingPostId] || {}),
          comments: nextComments,
          commentsCount:
            result.payload?.commentsCount ??
            result.payload?.totalComments ??
            result.payload?.data?.commentsCount ??
            nextComments.length,
        },
      }));
      // dispatch(fetchBlogPosts());
      setShowCommentModal(false);
      setCommentText("");
      showToast(
        "success",
        "Comment Posted",
        "Your comment has been published successfully."
      );
    } else
    {
      showToast(
        "error",
        "Comment Failed",
        result.payload || "Failed to post comment"
      );
    }
    setLoading(false);
  };

  const sendOtp = async () =>
  {
    if (!userInfo.name || !userInfo.email || !userInfo.phone)
    {
      showToast(
        "warning",
        "Required Fields Missing",
        "Name, Email and Phone Number are required."
      );
      return;
    }

    setLoading(true);
    const result = await dispatch(
      sendCommentOtp({
        postId: pendingPostId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
      }),
    );

    setLoading(false);

    if (result.error)
    {
      showToast(
        "error",
        "OTP Failed",
        result.payload || "Failed to send OTP"
      );
      return;
    }

    setStep("otp");
  };

  const verifyOtp = async () =>
  {
    if (!otp.trim())
    {
      showToast("warning", "OTP Required", "Please enter the OTP first.");
      return;
    }

    setLoading(true);
    const result = await dispatch(
      verifyCommentOtp({
        postId: pendingPostId,
        email: userInfo.email,
        otp: otp.trim(),
      }),
    );

    setLoading(false);

    if (result.error)
    {
      showToast(
        "error",
        "Verification Failed",
        result.payload || "Invalid OTP"
      );
      return;
    }

    setIsVerified(true);
    localStorage.setItem(
      "verifiedUser",
      JSON.stringify({ ...userInfo, verifiedAt: new Date().toISOString() }),
    );
    setShowVerifyModal(false);

    const actionAfterVerify = pendingAction;
    setPendingAction(null);

    if (pendingPostId && actionAfterVerify === "like")
    {
      performLike(pendingPostId);
    } else if (pendingPostId)
    {
      setTimeout(() =>
      {
        setShowCommentModal(true);
      }, 300);
    }
  };

  if (status === "loading")
  {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black" : "bg-gray-50"
          }`}
      >

        <div className="flex flex-col items-center">

          {/* Animated Loader */}
          <div className="relative mb-8">

            <div className="w-24 h-24 rounded-full border-4 border-[#8B6B4A]/20"></div>

            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-[#8B6B4A] animate-spin"></div>

            <div
              className="absolute inset-3 w-[72px] h-[72px] rounded-full border-4 border-transparent border-r-[#D9C5B5] animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.4s",
              }}
            ></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-[#8B6B4A] animate-pulse" />
            </div>

          </div>

          <h3
            className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-[#3D220E]"
              }`}
          >
            Loading Blogs
          </h3>

          <p
            className={`text-base ${isDark ? "text-gray-400" : "text-[#6E4E35]"
              }`}
          >
            Fetching the latest articles...
          </p>

          <div className="flex gap-2 mt-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B6B4A] animate-bounce"></span>

            <span
              className="w-2.5 h-2.5 rounded-full bg-[#A77A55] animate-bounce"
              style={{ animationDelay: "0.15s" }}
            ></span>

            <span
              className="w-2.5 h-2.5 rounded-full bg-[#D9C5B5] animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></span>
          </div>

        </div>
      </div>
    );
  }

  if (status === "failed")
  {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black text-[#D2A679]" : "bg-gray-50 text-[#EFE5C8]"}`}
      >
        <div className="text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Digital Marketing Blog | Atla Inteligent</title>
        <meta
          name="description"
          content="Read blogs on SEO, digital marketing, website trends, AI & business growth strategies."
        />
        <meta
          name="keywords"
          content="Digital Marketing Blog	SEO Blog, Marketing Tips"
        />
      </Helmet>
      <div
        className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"} font-sans`}
      >

        <Toast {...toast} isDark={isDark} />

        {/* Header with Category Filters */}
        <header
          className={`border-b sticky top-0 z-10 backdrop-blur-md ${isDark ? "border-gray-800 bg-black/90" : "border-gray-200 bg-white/90"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                  {
                    if (activeCategory === cat) return;
                    setCurrentPage(1);
                    dispatch(setActiveCategory(cat));
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${activeCategory === cat
                    ? "bg-[#8B6B4A] text-white shadow-lg shadow-[#8B6B4A]/40"
                    : isDark
                      ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-[#8B6B4A]/50 hover:text-[#d9c5b5]"
                      : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-[#F5EDE4] hover:border-[#8B6B4A] hover:text-[#3D220E]"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredPosts.length === 0 ? (
            <div
              className={`text-center py-24 text-2xl ${isDark ? "text-gray-400" : "text-gray-600"
                }`}
            >
              No posts found in{" "}
              <span
                className={`${isDark ? "text-[#C9A27A]" : "text-[#8B6B4A]"
                  } font-semibold`}
              >
                "{activeCategory}"
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-12">
                {currentPosts.map((post) =>
                {
                  const hasLiked = Boolean(
                    updatedPosts[post._id]?.liked ?? post.liked ?? userLikes.has(post._id)
                  );
                  const isViewLoading = viewLoadingIds.has(post._id);

                  return (
                    <div
                      key={post._id}
                      className={`group flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1
                      ${isDark
                          ? "bg-gray-900/70 border-gray-800 hover:border-[#8B6B4A]/60"
                          : "bg-white border-gray-200 hover:border-[#8B6B4A]/60"}`}
                    >
                      {/* Image */}
                      <div className="h-52 relative overflow-hidden">
                        {post.images?.[0] ? (
                          <img
                            src={post.images[0]}
                            alt={post.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                          >
                            <span
                              className={
                                isDark ? "text-gray-600" : "text-gray-400"
                              }
                            >
                              No Image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <span
                          className={`inline-block px-3 py-1 mb-3 text-xs rounded-full w-fit ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"}`}
                        >
                          {post.category?.name || "Uncategorized"}
                        </span>

                        <h2
                          className={`text-xl font-bold mb-2 line-clamp-2 group-hover:text-[#8B6B4A] transition-colors ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {post.name || "Untitled"}
                        </h2>

                        <p
                          className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        >
                          By{" "}
                          <span
                            className={
                              isDark ? "text-gray-200" : "text-gray-800"
                            }
                          >
                            {post.author || "Anonymous"}
                          </span>
                        </p>

                        <div
                          className={`text-sm mb-6 line-clamp-3 flex-grow ${isDark ? "text-gray-400" : "text-gray-600"}`}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              post.description || post.excerpt || "",
                            ),
                          }}
                        />

                        {/* Stats & Read More */}
                        <div className="mt-auto pt-4 flex justify-between items-center">
                          <div
                            className={`flex items-center gap-5 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            <div className="flex items-center gap-1">
                              <Eye className="w-5 h-5" /> {post.views || 0}
                            </div>
                            <div
                              className={`flex items-center gap-1 cursor-pointer transition-colors ${hasLiked ? "text-[#8B6B4A]" : "hover:text-[#8B6B4A]"}`}
                              onClick={() => handleAction("like", post)}
                            >
                              <Heart
                                className={`w-5 h-5 transition-all ${hasLiked ? "text-[#8B6B4A]" : ""
                                  }`}
                                fill={hasLiked ? "#8B6B4A" : "none"}
                              />{" "}
                              {updatedPosts[post._id]?.likes ?? post.likes ?? 0}
                            </div>
                            <div
                              className="flex items-center gap-1 cursor-pointer hover:text-[#8B6B4A] transition-colors"
                              onClick={() => handleAction("comment", post)}
                            >
                              <MessageCircle className="w-5 h-5" />{" "}
                              {getCommentCount(post)}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAction("read", post)}
                            disabled={isViewLoading}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 hover:translate-x-1
  ${isDark
                                ? "bg-[#9d6231]/20 border border-[#9d6231]/40 text-[#d9c5b5] hover:bg-[#9d6231]/30 hover:border-[#9d6231]"
                                : "bg-[#f5ede4] border border-[#9d6231]/30 text-[#9d6231] hover:bg-[#ead8c6] hover:border-[#9d6231] hover:text-[#3d220e]"
                              }
  ${isViewLoading ? "opacity-70 cursor-wait" : ""}`}
                          >
                            {isViewLoading ? "Opening..." : "Read More →"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-8">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${currentPage === 1
                        ? isDark
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : isDark
                          ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                          : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                        }`}
                    >
                      ← Previous
                    </button>

                    {getPageNumbers().map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          typeof page === "number" && goToPage(page)
                        }
                        disabled={page === "..."}
                        className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === "..."
                          ? isDark
                            ? "text-gray-500"
                            : "text-gray-400"
                          : page === currentPage
                            ? "bg-[#8B6B4A] text-white shadow-lg shadow-[#8B6B4A]/40"
                            : isDark
                              ? "bg-gray-800 hover:bg-[#3D2A1E] border border-gray-700 hover:border-[#8B6B4A]/50 hover:text-[#D9C5B5]"
                              : "bg-gray-100 hover:bg-[#F5EDE4] border border-gray-300 hover:border-[#8B6B4A] hover:text-[#3D220E]"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${currentPage === totalPages
                        ? isDark
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : isDark
                          ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                          : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                        }`}
                    >
                      Next →
                    </button>
                  </nav>

                  <div
                    className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Page {currentPage} of {totalPages} • {totalPosts} posts
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Comment Modal */}

        {showCommentModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
              className={`max-w-lg w-full rounded-xl p-8 border shadow-2xl ${isDark
                ? "bg-[#111827] border-[#8B6B4A]/30 shadow-black/70"
                : "bg-[#FCFAF8] border-[#E8D9C2] shadow-[#E8D9C2]/50"
                }`}
            >
              <div className="flex justify-between items-center mb-5">
                <h2
                  className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#3D220E]"
                    }`}
                >Write a Comment</h2>
                <button
                  onClick={() => setShowCommentModal(false)}
                  className={`p-2 rounded-full transition ${isDark
                    ? "hover:bg-[#3D220E]/40 text-gray-300"
                    : "hover:bg-[#F5EDE4] text-[#8B6B4A]"
                    }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What are your thoughts?"
                rows={5}
                className={`w-full p-4 rounded-2xl border resize-y min-h-[140px]
transition-all duration-300
focus:outline-none focus:ring-2 focus:ring-[#8B6B4A]
${isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:border-[#8B6B4A]"
                    : "bg-white border-[#E8D9C2] text-[#3D220E] focus:border-[#8B6B4A]"
                  }`}
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className={`flex-1 py-3 rounded-xl font-semibold border transition-all duration-300
${isDark
                      ? "border-[#8B6B4A]/30 text-gray-300 hover:bg-[#3D220E]/40 hover:border-[#8B6B4A]"
                      : "border-[#E8D9C2] text-[#8B6B4A] hover:bg-[#F5EDE4] hover:border-[#8B6B4A]"
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={submitComment}
                  disabled={loading || !commentText.trim()}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center transition-all duration-300
${commentText.trim()
                      ? "bg-[#8B6B4A] hover:bg-[#6E4E35]"
                      : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Post Comment"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Verification Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
              className={`max-w-md w-full rounded-2xl p-8 ${isDark ? "bg-gray-900" : "bg-white"} shadow-2xl`}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                {step === "form" ? "Verify Yourself" : "Enter OTP"}
              </h2>

              {step === "form" ? (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                    className={`w-full p-3 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                    className={`w-full p-3 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={userInfo.phone}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, phone: e.target.value })
                    }
                    className={`w-full p-3 rounded-lg mb-6 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
                  />

                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className="w-full bg-[#8B6B4A] hover:bg-[#7A5D42] py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-70"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-center mb-6 text-sm opacity-75">
                    OTP sent to <strong>{userInfo.email}</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className={`w-full p-4 text-center text-2xl tracking-widest rounded-lg border mb-6 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
                  />
                  <button
                    onClick={verifyOtp}
                    className="w-full bg-[#8B6B4A] hover:bg-[#7A5D42] py-3 rounded-lg text-white font-medium transition-colors"
                  >
                    Verify OTP
                  </button>
                </>
              )}

              <button
                onClick={() => setShowVerifyModal(false)}
                className="mt-6 text-sm text-gray-500 underline block mx-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;





// import React, { useEffect, useState, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import DOMPurify from "dompurify";
// import { useTheme } from "../../context/ThemeContext";
// import { Helmet } from "react-helmet-async";

// import { Eye, Heart, MessageCircle, X, Loader2 } from "lucide-react";

// import
// {
//   fetchCategories,
//   fetchBlogPosts,
//   setActiveCategory,
//   incrementPostView,
//   togglePostLike,
//   sendCommentOtp,
//   verifyCommentOtp,
//   postComment,
// } from "../Redux/Blog/blogSlice.js";

// const POSTS_PER_PAGE = 6;

// const Blog = () =>
// {
//   const dispatch = useDispatch();
//   const { isDark } = useTheme();

//   const {
//     categories,
//     posts: blogPosts,
//     activeCategory,
//     status,
//     error,
//   } = useSelector((state) => state.blog);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [showVerifyModal, setShowVerifyModal] = useState(false);
//   const [showCommentModal, setShowCommentModal] = useState(false);
//   const [pendingPostId, setPendingPostId] = useState(null);
//   const [commentText, setCommentText] = useState("");

//   // Local state for real-time like & comment count update
//   const [updatedPosts, setUpdatedPosts] = useState({});

//   // Track user likes
//   const [userLikes, setUserLikes] = useState(new Set());

//   // User Verification State
//   const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
//   const [step, setStep] = useState("form");
//   const [otp, setOtp] = useState("");
//   const [isVerified, setIsVerified] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState({
//     show: false,
//     type: "success",
//     title: "",
//     message: "",
//   });

//   const showToast = (type, title, message) =>
//   {
//     setToast({
//       show: true,
//       type,
//       title,
//       message,
//     });

//     setTimeout(() =>
//     {
//       setToast({
//         show: false,
//         type: "success",
//         title: "",
//         message: "",
//       });
//     }, 3000);
//   };

//   // Loading state for view increment
//   const [viewLoadingIds, setViewLoadingIds] = useState(new Set());

//   const refreshBlogPosts = useCallback(() =>
//   {
//     dispatch(fetchCategories());
//     dispatch(fetchBlogPosts());
//   }, [dispatch]);

//   // Load saved data from localStorage
//   useEffect(() =>
//   {
//     const savedUser = localStorage.getItem("verifiedUser");
//     if (savedUser)
//     {
//       try
//       {
//         const parsedUser = JSON.parse(savedUser);
//         if (parsedUser?.email)
//         {
//           setUserInfo({
//             name: parsedUser.name || "",
//             email: parsedUser.email || "",
//             phone: parsedUser.phone || "",
//           });
//           setIsVerified(true);
//         }
//       } catch (error)
//       {
//         console.error("Failed to parse verifiedUser from localStorage", error);
//       }
//     }

//     const savedLikes = localStorage.getItem("userLikes");
//     if (savedLikes) setUserLikes(new Set(JSON.parse(savedLikes)));
//   }, []);

//   useEffect(() =>
//   {
//     refreshBlogPosts();

//     const handleFocus = () => refreshBlogPosts();

//     window.addEventListener("focus", handleFocus);

//     return () =>
//     {
//       window.removeEventListener("focus", handleFocus);
//     };
//   }, [refreshBlogPosts]);

//   useEffect(() =>
//   {
//     setCurrentPage(1);
//   }, [activeCategory]);


//   useEffect(() =>
//   {
//     const shouldRefresh = localStorage.getItem("blogCommentsUpdated");

//     if (shouldRefresh === "true")
//     {
//       dispatch(fetchBlogPosts());
//       localStorage.removeItem("blogCommentsUpdated");
//     }
//   }, [dispatch]);

//   // Merge updated likes & comments
//   const mergedPosts = blogPosts.map((post) => ({
//     ...post,
//     likes: updatedPosts[post._id]?.likes ?? post.likes ?? 0,
//     liked: updatedPosts[post._id]?.liked ?? post.liked ?? false,
//     comments: updatedPosts[post._id]?.comments ?? post.comments ?? [],
//   }));

//   const filteredPosts =
//     activeCategory === "All"
//       ? mergedPosts
//       : mergedPosts.filter((post) => post.category?.name === activeCategory);

//   const totalPosts = filteredPosts.length;
//   const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
//   const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
//   const currentPosts = filteredPosts.slice(
//     startIndex,
//     startIndex + POSTS_PER_PAGE,
//   );

//   const goToPage = (page) =>
//   {
//     if (page >= 1 && page <= totalPages)
//     {
//       setCurrentPage(page);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const getPageNumbers = () =>
//   {
//     const pages = [];
//     const maxPagesToShow = 5;

//     if (totalPages <= maxPagesToShow)
//     {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//       return pages;
//     }

//     pages.push(1);
//     let start = Math.max(2, currentPage - 1);
//     let end = Math.min(totalPages - 1, currentPage + 1);

//     if (start > 2) pages.push("...");
//     for (let i = start; i <= end; i++) pages.push(i);
//     if (end < totalPages - 1) pages.push("...");
//     if (totalPages > 1) pages.push(totalPages);

//     return pages;
//   };

//   // ==================== UPDATED handleAction with SLUG ====================
//   const handleAction = (action, post) =>
//   {
//     const postSlug = post.slug || post._id; // ← Slug Fix

//     if (action === "read")
//     {
//       // Increment view count
//       setViewLoadingIds((prev) => new Set(prev).add(post._id));

//       dispatch(incrementPostView(post._id));

//       // Navigate after a small delay so backend gets the request
//       setTimeout(() =>
//       {
//         setViewLoadingIds((prev) =>
//         {
//           const newSet = new Set(prev);
//           newSet.delete(post._id);
//           return newSet;
//         });
//         window.location.href = `/blog/${postSlug}`; // ← Changed to slug
//       }, 150);

//       return;
//     }

//     if (!isVerified)
//     {
//       setPendingPostId(post._id);
//       setShowVerifyModal(true);
//       setStep("form");
//       setUserInfo({ name: "", email: "", phone: "" });
//       return;
//     }

//     if (action === "like")
//     {
//       performLike(post._id);
//     } else if (action === "comment")
//     {
//       setPendingPostId(post._id);
//       setCommentText("");
//       setShowCommentModal(true);
//     }
//   };

//   const performLike = async (postId) =>
//   {
//     if (!userInfo.email)
//     {
//       showToast(
//         "warning",
//         "Verification Required",
//         "Please verify with your email before liking posts."
//       );
//       return;
//     }

//     const result = await dispatch(
//       togglePostLike({ postId, email: userInfo.email }),
//     );
//     if (!result.error)
//     {
//       const payload = result.payload?.data || result.payload || {};
//       const previousLiked = Boolean(
//         updatedPosts[postId]?.liked ?? userLikes.has(postId)
//       );

//       const newLiked =
//         typeof payload.liked === "boolean" ? payload.liked : !previousLiked;
//       const updatedLikeCount =
//         payload.likes ??
//         (blogPosts.find((p) => p._id === postId)?.likes || 0);

//       setUpdatedPosts((prev) => ({
//         ...prev,
//         [postId]: {
//           ...(prev[postId] || {}),
//           likes: updatedLikeCount,
//           liked: newLiked,
//         },
//       }));
//       // dispatch(fetchBlogPosts());

//       const newLikes = new Set(userLikes);

//       if (newLiked)
//       {
//         newLikes.add(postId);
//       } else
//       {
//         newLikes.delete(postId);
//       }

//       setUserLikes(newLikes);
//       localStorage.setItem("userLikes", JSON.stringify([...newLikes]));
//     }
//   };

//   const submitComment = async () =>
//   {
//     if (!commentText.trim())
//     {
//       showToast("warning", "Comment Required", "Please write a comment first.");
//       return;
//     }
//     if (!userInfo.email)
//     {
//       showToast(
//         "warning",
//         "Verification Required",
//         "Please verify with your email before commenting."
//       );
//       return;
//     }

//     setLoading(true);
//     const result = await dispatch(
//       postComment({
//         postId: pendingPostId,
//         email: userInfo.email,
//         comment: commentText.trim(),
//       }),
//     );

//     if (!result.error)
//     {
//       setUpdatedPosts((prev) => ({
//         ...prev,
//         [pendingPostId]: {
//           ...(prev[pendingPostId] || {}),
//           comments:
//             result.payload?.comments ||
//             [...(blogPosts.find((p) => p._id === pendingPostId)?.comments || []), result.payload?.comment || {}],
//         },
//       }));
//       // dispatch(fetchBlogPosts());
//       setShowCommentModal(false);
//       setCommentText("");
//       showToast(
//         "success",
//         "Comment Posted",
//         "Your comment has been published successfully."
//       );
//     } else
//     {
//       showToast(
//         "error",
//         "Comment Failed",
//         result.payload || "Failed to post comment"
//       );
//     }
//     setLoading(false);
//   };

//   const sendOtp = async () =>
//   {
//     if (!userInfo.name || !userInfo.email || !userInfo.phone)
//     {
//       showToast(
//         "warning",
//         "Required Fields Missing",
//         "Name, Email and Phone Number are required."
//       );
//       return;
//     }

//     setLoading(true);
//     const result = await dispatch(
//       sendCommentOtp({
//         postId: pendingPostId,
//         name: userInfo.name,
//         email: userInfo.email,
//         phone: userInfo.phone,
//       }),
//     );

//     setLoading(false);

//     if (result.error)
//     {
//       showToast(
//         "error",
//         "OTP Failed",
//         result.payload || "Failed to send OTP"
//       );
//       return;
//     }

//     setStep("otp");
//   };

//   const verifyOtp = async () =>
//   {
//     if (!otp.trim())
//     {
//       showToast("warning", "OTP Required", "Please enter the OTP first.");
//       return;
//     }

//     setLoading(true);
//     const result = await dispatch(
//       verifyCommentOtp({
//         postId: pendingPostId,
//         email: userInfo.email,
//         otp: otp.trim(),
//       }),
//     );

//     setLoading(false);

//     if (result.error)
//     {
//       showToast(
//         "error",
//         "Verification Failed",
//         result.payload || "Invalid OTP"
//       );
//       return;
//     }

//     setIsVerified(true);
//     localStorage.setItem(
//       "verifiedUser",
//       JSON.stringify({ ...userInfo, verifiedAt: new Date().toISOString() }),
//     );
//     setShowVerifyModal(false);

//     if (pendingPostId)
//     {
//       setTimeout(() =>
//       {
//         setShowCommentModal(true);
//       }, 300);
//     }
//   };

//   if (status === "loading")
//   {
//     return (
//       <div
//         className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black" : "bg-gray-50"
//           }`}
//       >

//         <div className="flex flex-col items-center">

//           {/* Animated Loader */}
//           <div className="relative mb-8">

//             <div className="w-24 h-24 rounded-full border-4 border-[#8B6B4A]/20"></div>

//             <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-[#8B6B4A] animate-spin"></div>

//             <div
//               className="absolute inset-3 w-[72px] h-[72px] rounded-full border-4 border-transparent border-r-[#D9C5B5] animate-spin"
//               style={{
//                 animationDirection: "reverse",
//                 animationDuration: "1.4s",
//               }}
//             ></div>

//             <div className="absolute inset-0 flex items-center justify-center">
//               <MessageCircle className="w-10 h-10 text-[#8B6B4A] animate-pulse" />
//             </div>

//           </div>

//           <h3
//             className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-[#3D220E]"
//               }`}
//           >
//             Loading Blogs
//           </h3>

//           <p
//             className={`text-base ${isDark ? "text-gray-400" : "text-[#6E4E35]"
//               }`}
//           >
//             Fetching the latest articles...
//           </p>

//           <div className="flex gap-2 mt-6">
//             <span className="w-2.5 h-2.5 rounded-full bg-[#8B6B4A] animate-bounce"></span>

//             <span
//               className="w-2.5 h-2.5 rounded-full bg-[#A77A55] animate-bounce"
//               style={{ animationDelay: "0.15s" }}
//             ></span>

//             <span
//               className="w-2.5 h-2.5 rounded-full bg-[#D9C5B5] animate-bounce"
//               style={{ animationDelay: "0.3s" }}
//             ></span>
//           </div>

//         </div>
//       </div>
//     );
//   }

//   if (status === "failed")
//   {
//     return (
//       <div
//         className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black text-red-400" : "bg-gray-50 text-[#EFE5C8]"}`}
//       >
//         <div className="text-xl">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Helmet>
//         <title>Digital Marketing Blog | Atla Inteligent</title>
//         <meta
//           name="description"
//           content="Read blogs on SEO, digital marketing, website trends, AI & business growth strategies."
//         />
//         <meta
//           name="keywords"
//           content="Digital Marketing Blog	SEO Blog, Marketing Tips"
//         />
//       </Helmet>
//       <div
//         className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"} font-sans`}
//       >

//         {toast.show && (
//           <div className="fixed top-24 right-6 z-[9999] animate-in slide-in-from-right duration-300">
//             <div
//               className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3
//               ${
//                 toast.type === "success"
//                   ? isDark
//                     ? "bg-[#3D220E]/95 border-[#8B6B4A]/40 text-white shadow-[#3D220E]/40"
//                     : "bg-white border-[#E8D9C2] text-[#3D220E] shadow-[#8B6B4A]/20"
//                   : toast.type === "error"
//                     ? isDark
//                       ? "bg-red-900/95 border-red-500/40 text-white shadow-red-900/40"
//                       : "bg-white border-red-200 text-red-700 shadow-red-200/50"
//                     : isDark
//                       ? "bg-[#3D220E]/95 border-yellow-500/40 text-white shadow-[#3D220E]/40"
//                       : "bg-white border-yellow-200 text-yellow-700 shadow-yellow-200/50"
//               }`}
//             >
//               <div
//                 className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
//                 ${
//                   toast.type === "success"
//                     ? "bg-green-500"
//                     : toast.type === "error"
//                       ? "bg-red-500"
//                       : "bg-yellow-500"
//                 }`}
//               >
//                 {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "!"}
//               </div>

//               <div>
//                 <p className="font-semibold text-[15px]">
//                   {toast.title}
//                 </p>
//                 <p className="text-sm opacity-80">
//                   {toast.message}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Header with Category Filters */}
//         <header
//           className={`border-b sticky top-0 z-10 backdrop-blur-md ${isDark ? "border-gray-800 bg-black/90" : "border-gray-200 bg-white/90"}`}
//         >
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//             <div className="flex flex-wrap gap-3 justify-center md:justify-start">
//               {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => dispatch(setActiveCategory(cat))}
//                   className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${activeCategory === cat
//                     ? "bg-[#8B6B4A] text-white shadow-lg shadow-[#8B6B4A]/40"
//                     : isDark
//                       ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-[#8B6B4A]/50 hover:text-[#d9c5b5]"
//                       : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-[#F5EDE4] hover:border-[#8B6B4A] hover:text-[#3D220E]"
//                     }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           {filteredPosts.length === 0 ? (
//             <div
//               className={`text-center py-24 text-2xl ${isDark ? "text-gray-400" : "text-gray-600"
//                 }`}
//             >
//               No posts found in{" "}
//               <span
//                 className={`${isDark ? "text-[#C9A27A]" : "text-[#8B6B4A]"
//                   } font-semibold`}
//               >
//                 "{activeCategory}"
//               </span>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-12">
//                 {currentPosts.map((post) =>
//                 {
//                   const hasLiked = Boolean(
//                     updatedPosts[post._id]?.liked ?? post.liked ?? userLikes.has(post._id)
//                   );
//                   const isViewLoading = viewLoadingIds.has(post._id);

//                   return (
//                     <div
//                       key={post._id}
//                       className={`group flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1
//                       ${isDark
//                           ? "bg-gray-900/70 border-gray-800 hover:border-[#8B6B4A]/60"
//                           : "bg-white border-gray-200 hover:border-[#8B6B4A]/60"}`}
//                     >
//                       {/* Image */}
//                       <div className="h-52 relative overflow-hidden">
//                         {post.images?.[0] ? (
//                           <img
//                             src={post.images[0]}
//                             alt={post.name}
//                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                           />
//                         ) : (
//                           <div
//                             className={`absolute inset-0 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
//                           >
//                             <span
//                               className={
//                                 isDark ? "text-gray-600" : "text-gray-400"
//                               }
//                             >
//                               No Image
//                             </span>
//                           </div>
//                         )}
//                       </div>

//                       {/* Content */}
//                       <div className="p-6 flex flex-col flex-grow">
//                         <span
//                           className={`inline-block px-3 py-1 mb-3 text-xs rounded-full w-fit ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"}`}
//                         >
//                           {post.category?.name || "Uncategorized"}
//                         </span>

//                         <h2
//                           className={`text-xl font-bold mb-2 line-clamp-2 group-hover:text-[#8B6B4A] transition-colors ${isDark ? "text-white" : "text-gray-900"}`}
//                         >
//                           {post.name || "Untitled"}
//                         </h2>

//                         <p
//                           className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
//                         >
//                           By{" "}
//                           <span
//                             className={
//                               isDark ? "text-gray-200" : "text-gray-800"
//                             }
//                           >
//                             {post.author || "Anonymous"}
//                           </span>
//                         </p>

//                         <div
//                           className={`text-sm mb-6 line-clamp-3 flex-grow ${isDark ? "text-gray-400" : "text-gray-600"}`}
//                           dangerouslySetInnerHTML={{
//                             __html: DOMPurify.sanitize(
//                               post.description || post.excerpt || "",
//                             ),
//                           }}
//                         />

//                         {/* Stats & Read More */}
//                         <div className="mt-auto pt-4 flex justify-between items-center">
//                           <div
//                             className={`flex items-center gap-5 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
//                           >
//                             <div className="flex items-center gap-1">
//                               <Eye className="w-5 h-5" /> {post.views || 0}
//                             </div>
//                             <div
//                               className={`flex items-center gap-1 cursor-pointer transition-colors ${hasLiked ? "text-[#8B6B4A]" : "hover:text-[#8B6B4A]"}`}
//                               onClick={() => handleAction("like", post)}
//                             >
//                               <Heart
//                                 className={`w-5 h-5 transition-all ${hasLiked ? "text-[#8B6B4A]" : ""
//                                   }`}
//                                 fill={hasLiked ? "#8B6B4A" : "none"}
//                               />{" "}
//                               {updatedPosts[post._id]?.likes ?? post.likes ?? 0}
//                             </div>
//                             <div
//                               className="flex items-center gap-1 cursor-pointer hover:text-[#8B6B4A] transition-colors"
//                               onClick={() => handleAction("comment", post)}
//                             >
//                               <MessageCircle className="w-5 h-5" />{" "}
//                               {updatedPosts[post._id]?.comments?.length ??
//                                 post.comments?.length ??
//                                 post.commentsCount ??
//                                 post.totalComments ??
//                                 0}
//                             </div>
//                           </div>

//                           <button
//                             onClick={() => handleAction("read", post)}
//                             disabled={isViewLoading}
//                             className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 hover:translate-x-1
//   ${isDark
//                                 ? "bg-[#9d6231]/20 border border-[#9d6231]/40 text-[#d9c5b5] hover:bg-[#9d6231]/30 hover:border-[#9d6231]"
//                                 : "bg-[#f5ede4] border border-[#9d6231]/30 text-[#9d6231] hover:bg-[#ead8c6] hover:border-[#9d6231] hover:text-[#3d220e]"
//                               }
//   ${isViewLoading ? "opacity-70 cursor-wait" : ""}`}
//                           >
//                             {isViewLoading ? "Opening..." : "Read More →"}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex flex-col items-center gap-4 mt-8">
//                   <nav className="flex items-center gap-2">
//                     <button
//                       onClick={() => goToPage(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${currentPage === 1
//                         ? isDark
//                           ? "bg-gray-800 text-gray-500 cursor-not-allowed"
//                           : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : isDark
//                           ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
//                           : "bg-gray-100 hover:bg-gray-200 border-gray-300"
//                         }`}
//                     >
//                       ← Previous
//                     </button>

//                     {getPageNumbers().map((page, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() =>
//                           typeof page === "number" && goToPage(page)
//                         }
//                         disabled={page === "..."}
//                         className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === "..."
//                           ? isDark
//                             ? "text-gray-500"
//                             : "text-gray-400"
//                           : page === currentPage
//                             ? "bg-[#8B6B4A] text-white shadow-lg shadow-[#8B6B4A]/40"
//                             : isDark
//                               ? "bg-gray-800 hover:bg-[#3D2A1E] border border-gray-700 hover:border-[#8B6B4A]/50 hover:text-[#D9C5B5]"
//                               : "bg-gray-100 hover:bg-[#F5EDE4] border border-gray-300 hover:border-[#8B6B4A] hover:text-[#3D220E]"
//                           }`}
//                       >
//                         {page}
//                       </button>
//                     ))}

//                     <button
//                       onClick={() => goToPage(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${currentPage === totalPages
//                         ? isDark
//                           ? "bg-gray-800 text-gray-500 cursor-not-allowed"
//                           : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : isDark
//                           ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
//                           : "bg-gray-100 hover:bg-gray-200 border-gray-300"
//                         }`}
//                     >
//                       Next →
//                     </button>
//                   </nav>

//                   <div
//                     className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
//                   >
//                     Page {currentPage} of {totalPages} • {totalPosts} posts
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </main>

//         {/* Comment Modal */}

//         {showCommentModal && (
//           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//             <div
//               className={`max-w-lg w-full rounded-xl p-8 border shadow-2xl ${isDark
//                 ? "bg-[#111827] border-[#8B6B4A]/30 shadow-black/70"
//                 : "bg-[#FCFAF8] border-[#E8D9C2] shadow-[#E8D9C2]/50"
//                 }`}
//             >
//               <div className="flex justify-between items-center mb-5">
//                 <h2
//                   className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#3D220E]"
//                     }`}
//                 >Write a Comment</h2>
//                 <button
//                   onClick={() => setShowCommentModal(false)}
//                   className={`p-2 rounded-full transition ${isDark
//                     ? "hover:bg-[#3D220E]/40 text-gray-300"
//                     : "hover:bg-[#F5EDE4] text-[#8B6B4A]"
//                     }`}
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <textarea
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 placeholder="What are your thoughts?"
//                 rows={5}
//                 className={`w-full p-4 rounded-2xl border resize-y min-h-[140px]
// transition-all duration-300
// focus:outline-none focus:ring-2 focus:ring-[#8B6B4A]
// ${isDark
//                     ? "bg-gray-800 border-gray-700 text-white focus:border-[#8B6B4A]"
//                     : "bg-white border-[#E8D9C2] text-[#3D220E] focus:border-[#8B6B4A]"
//                   }`}
//               />
//               <div className="flex gap-3 mt-5">
//                 <button
//                   onClick={() => setShowCommentModal(false)}
//                   className={`flex-1 py-3 rounded-xl font-semibold border transition-all duration-300
// ${isDark
//                       ? "border-[#8B6B4A]/30 text-gray-300 hover:bg-[#3D220E]/40 hover:border-[#8B6B4A]"
//                       : "border-[#E8D9C2] text-[#8B6B4A] hover:bg-[#F5EDE4] hover:border-[#8B6B4A]"
//                     }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={submitComment}
//                   disabled={loading || !commentText.trim()}
//                   className={`flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center transition-all duration-300
// ${commentText.trim()
//                       ? "bg-[#8B6B4A] hover:bg-[#6E4E35]"
//                       : "bg-gray-400 cursor-not-allowed"
//                     }`}
//                 >
//                   {loading ? (
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                   ) : (
//                     "Post Comment"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}



//         {/* Verification Modal */}
//         {showVerifyModal && (
//           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//             <div
//               className={`max-w-md w-full rounded-2xl p-8 ${isDark ? "bg-gray-900" : "bg-white"} shadow-2xl`}
//             >
//               <h2 className="text-2xl font-bold mb-6 text-center">
//                 {step === "form" ? "Verify Yourself" : "Enter OTP"}
//               </h2>

//               {step === "form" ? (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Full Name"
//                     value={userInfo.name}
//                     onChange={(e) =>
//                       setUserInfo({ ...userInfo, name: e.target.value })
//                     }
//                     className={`w-full p-3 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
//                   />
//                   <input
//                     type="email"
//                     placeholder="Email Address"
//                     value={userInfo.email}
//                     onChange={(e) =>
//                       setUserInfo({ ...userInfo, email: e.target.value })
//                     }
//                     className={`w-full p-3 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
//                   />
//                   <input
//                     type="tel"
//                     placeholder="Phone Number"
//                     value={userInfo.phone}
//                     onChange={(e) =>
//                       setUserInfo({ ...userInfo, phone: e.target.value })
//                     }
//                     className={`w-full p-3 rounded-lg mb-6 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
//                   />

//                   <button
//                     onClick={sendOtp}
//                     disabled={loading}
//                     className="w-full bg-[#8B6B4A] hover:bg-[#7A5D42] py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-70"
//                   >
//                     {loading ? "Sending OTP..." : "Send OTP"}
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-center mb-6 text-sm opacity-75">
//                     OTP sent to <strong>{userInfo.email}</strong>
//                   </p>
//                   <input
//                     type="text"
//                     placeholder="Enter 6-digit OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     maxLength={6}
//                     className={`w-full p-4 text-center text-2xl tracking-widest rounded-lg border mb-6 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
//                   />
//                   <button
//                     onClick={verifyOtp}
//                     className="w-full bg-[#8B6B4A] hover:bg-[#7A5D42] py-3 rounded-lg text-white font-medium transition-colors"
//                   >
//                     Verify OTP
//                   </button>
//                 </>
//               )}

//               <button
//                 onClick={() => setShowVerifyModal(false)}
//                 className="mt-6 text-sm text-gray-500 underline block mx-auto"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Blog;






// import React, { useEffect, useState, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import DOMPurify from "dompurify";
// import { useTheme } from "../../context/ThemeContext";
// import { Helmet } from "react-helmet-async";

// import { Eye, Heart, MessageCircle, X, Loader2 } from "lucide-react";

// import
// {
//   fetchCategories,
//   fetchBlogPosts,
//   setActiveCategory,
//   incrementPostView,
//   togglePostLike,
//   sendCommentOtp,
//   verifyCommentOtp,
//   postComment,
// } from "../Redux/Blog/blogSlice.js";

// const POSTS_PER_PAGE = 6;

// const Blog = () =>
// {
//   const dispatch = useDispatch();
//   const { isDark } = useTheme();

//   const {
//     categories,
//     posts: blogPosts,
//     activeCategory,
//     status,
//     error,
//   } = useSelector((state) => state.blog);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [showVerifyModal, setShowVerifyModal] = useState(false);
//   const [showCommentModal, setShowCommentModal] = useState(false);
//   const [pendingPostId, setPendingPostId] = useState(null);
//   const [commentText, setCommentText] = useState("");

//   // Local state for real-time like & comment count update
//   const [updatedPosts, setUpdatedPosts] = useState({});

//   // Track user likes
//   const [userLikes, setUserLikes] = useState(new Set());

//   // User Verification State
//   const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
//   const [step, setStep] = useState("form");
//   const [otp, setOtp] = useState("");
//   const [isVerified, setIsVerified] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");

//   const [errorMessage, setErrorMessage] = useState("");
//   const [warningMessage, setWarningMessage] = useState("");

//   // Loading state for view increment
//   const [viewLoadingIds, setViewLoadingIds] = useState(new Set());

//   const refreshBlogPosts = useCallback(() =>
//   {
//     dispatch(fetchCategories());
//     dispatch(fetchBlogPosts());
//   }, [dispatch]);

//   // Load saved data from localStorage
//   useEffect(() =>
//   {
//     const savedUser = localStorage.getItem("verifiedUser");
//     if (savedUser)
//     {
//       try
//       {
//         const parsedUser = JSON.parse(savedUser);
//         if (parsedUser?.email)
//         {
//           setUserInfo({
//             name: parsedUser.name || "",
//             email: parsedUser.email || "",
//             phone: parsedUser.phone || "",
//           });
//           setIsVerified(true);
//         }
//       } catch (error)
//       {
//         console.error("Failed to parse verifiedUser from localStorage", error);
//       }
//     }

//     const savedLikes = localStorage.getItem("userLikes");
//     if (savedLikes) setUserLikes(new Set(JSON.parse(savedLikes)));
//   }, []);

//   useEffect(() =>
//   {
//     refreshBlogPosts();

//     const handleFocus = () => refreshBlogPosts();

//     window.addEventListener("focus", handleFocus);

//     return () =>
//     {
//       window.removeEventListener("focus", handleFocus);
//     };
//   }, [refreshBlogPosts]);

//   useEffect(() =>
//   {
//     setCurrentPage(1);
//   }, [activeCategory]);


//   useEffect(() =>
//   {
//     const shouldRefresh = localStorage.getItem("blogCommentsUpdated");

//     if (shouldRefresh === "true")
//     {
//       dispatch(fetchBlogPosts());
//       localStorage.removeItem("blogCommentsUpdated");
//     }
//   }, [dispatch]);

//   // Merge updated likes & comments
//   const mergedPosts = blogPosts.map((post) => ({
//     ...post,
//     likes: updatedPosts[post._id]?.likes ?? post.likes ?? 0,
//     liked: updatedPosts[post._id]?.liked ?? post.liked ?? false,
//     comments: updatedPosts[post._id]?.comments ?? post.comments ?? [],
//   }));

//   const filteredPosts =
//     activeCategory === "All"
//       ? mergedPosts
//       : mergedPosts.filter((post) => post.category?.name === activeCategory);

//   const totalPosts = filteredPosts.length;
//   const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
//   const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
//   const currentPosts = filteredPosts.slice(
//     startIndex,
//     startIndex + POSTS_PER_PAGE,
//   );

//   const goToPage = (page) =>
//   {
//     if (page >= 1 && page <= totalPages)
//     {
//       setCurrentPage(page);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const getPageNumbers = () =>
//   {
//     const pages = [];
//     const maxPagesToShow = 5;

//     if (totalPages <= maxPagesToShow)
//     {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//       return pages;
//     }

//     pages.push(1);
//     let start = Math.max(2, currentPage - 1);
//     let end = Math.min(totalPages - 1, currentPage + 1);

//     if (start > 2) pages.push("...");
//     for (let i = start; i <= end; i++) pages.push(i);
//     if (end < totalPages - 1) pages.push("...");
//     if (totalPages > 1) pages.push(totalPages);

//     return pages;
//   };

//   // ==================== UPDATED handleAction with SLUG ====================
//   const handleAction = (action, post) =>
//   {
//     const postSlug = post.slug || post._id; // ← Slug Fix

//     if (action === "read")
//     {
//       // Increment view count
//       setViewLoadingIds((prev) => new Set(prev).add(post._id));

//       dispatch(incrementPostView(post._id));

//       // Navigate after a small delay so backend gets the request
//       setTimeout(() =>
//       {
//         setViewLoadingIds((prev) =>
//         {
//           const newSet = new Set(prev);
//           newSet.delete(post._id);
//           return newSet;
//         });
//         window.location.href = `/blog/${postSlug}`; // ← Changed to slug
//       }, 150);

//       return;
//     }

//     if (!isVerified)
//     {
//       setPendingPostId(post._id);
//       setShowVerifyModal(true);
//       setStep("form");
//       setUserInfo({ name: "", email: "", phone: "" });
//       return;
//     }

//     if (action === "like")
//     {
//       performLike(post._id);
//     } else if (action === "comment")
//     {
//       setPendingPostId(post._id);
//       setCommentText("");
//       setShowCommentModal(true);
//     }
//   };

//   const performLike = async (postId) =>
//   {
//     if (!userInfo.email)
//     {
//       alert("Please verify with your email before liking posts.");
//       return;
//     }

//     const result = await dispatch(
//       togglePostLike({ postId, email: userInfo.email }),
//     );
//     if (!result.error)
//     {
//       const payload = result.payload?.data || result.payload || {};
//       const previousLiked = Boolean(
//         updatedPosts[postId]?.liked ?? userLikes.has(postId)
//       );

//       const newLiked =
//         typeof payload.liked === "boolean" ? payload.liked : !previousLiked;
//       const updatedLikeCount =
//         payload.likes ??
//         (blogPosts.find((p) => p._id === postId)?.likes || 0);

//       setUpdatedPosts((prev) => ({
//         ...prev,
//         [postId]: {
//           ...(prev[postId] || {}),
//           likes: updatedLikeCount,
//           liked: newLiked,
//         },
//       }));
//       // dispatch(fetchBlogPosts());

//       const newLikes = new Set(userLikes);

//       if (newLiked)
//       {
//         newLikes.add(postId);
//       } else
//       {
//         newLikes.delete(postId);
//       }

//       setUserLikes(newLikes);
//       localStorage.setItem("userLikes", JSON.stringify([...newLikes]));
//     }
//   };

//   const submitComment = async () =>
//   {
//     if (!commentText.trim()) return alert("Please write a comment");
//     if (!userInfo.email)
//     {
//       alert("Please verify with your email before commenting.");
//       return;
//     }

//     setLoading(true);
//     const result = await dispatch(
//       postComment({
//         postId: pendingPostId,
//         email: userInfo.email,
//         comment: commentText.trim(),
//       }),
//     );

//     if (!result.error)
//     {
//       setUpdatedPosts((prev) => ({
//         ...prev,
//         [pendingPostId]: {
//           ...(prev[pendingPostId] || {}),
//           comments:
//             result.payload?.comments ||
//             [...(blogPosts.find((p) => p._id === pendingPostId)?.comments || []), result.payload?.comment || {}],
//         },
//       }));
//       // dispatch(fetchBlogPosts());
//       setShowCommentModal(false);
//       setCommentText("");
//       setSuccessMessage("Comment posted successfully!");
//       setTimeout(() => setSuccessMessage(""), 3000);
//     } else
//     {
//       alert(result.payload || "Failed to post comment");
//     }
//     setLoading(false);
//   };

//   const sendOtp = async () =>
//   {
//     if (!userInfo.name || !userInfo.email || !userInfo.phone)
//     {
//       alert("Name, Email and Phone Number are required");
//       return;
//     }

//     setLoading(true);
//     const result = await dispatch(
//       sendCommentOtp({
//         postId: pendingPostId,
//         name: userInfo.name,
//         email: userInfo.email,
//         phone: userInfo.phone,
//       }),
//     );

//     setLoading(false);

//     if (result.error)
//     {
//       alert(result.payload || "Failed to send OTP");
//       return;
//     }

//     setStep("otp");
//   };

//   const verifyOtp = async () =>
//   {
//     if (!otp.trim())
//     {
//       alert("Please enter the OTP first.");
//       return;
//     }

//     setLoading(true);
//     const result = await dispatch(
//       verifyCommentOtp({
//         postId: pendingPostId,
//         email: userInfo.email,
//         otp: otp.trim(),
//       }),
//     );

//     setLoading(false);

//     if (result.error)
//     {
//       setErrorMessage(result.payload || "Invalid OTP");
//       setTimeout(() => setErrorMessage(""), 3000);
//       return;
//     }

//     setIsVerified(true);
//     localStorage.setItem(
//       "verifiedUser",
//       JSON.stringify({ ...userInfo, verifiedAt: new Date().toISOString() }),
//     );
//     setShowVerifyModal(false);

//     if (pendingPostId)
//     {
//       setTimeout(() =>
//       {
//         setShowCommentModal(true);
//       }, 300);
//     }
//   };

//   if (status === "loading")
//   {
//     return (
//       <div
//         className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black" : "bg-gray-50"
//           }`}
//       >

//         <div className="flex flex-col items-center">

//           {/* Animated Loader */}
//           <div className="relative mb-8">

//             <div className="w-24 h-24 rounded-full border-4 border-[#8B6B4A]/20"></div>

//             <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-[#8B6B4A] animate-spin"></div>

//             <div
//               className="absolute inset-3 w-[72px] h-[72px] rounded-full border-4 border-transparent border-r-[#D9C5B5] animate-spin"
//               style={{
//                 animationDirection: "reverse",
//                 animationDuration: "1.4s",
//               }}
//             ></div>

//             <div className="absolute inset-0 flex items-center justify-center">
//               <MessageCircle className="w-10 h-10 text-[#8B6B4A] animate-pulse" />
//             </div>

//           </div>

//           <h3
//             className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-[#3D220E]"
//               }`}
//           >
//             Loading Blogs
//           </h3>

//           <p
//             className={`text-base ${isDark ? "text-gray-400" : "text-[#6E4E35]"
//               }`}
//           >
//             Fetching the latest articles...
//           </p>

//           <div className="flex gap-2 mt-6">
//             <span className="w-2.5 h-2.5 rounded-full bg-[#8B6B4A] animate-bounce"></span>

//             <span
//               className="w-2.5 h-2.5 rounded-full bg-[#A77A55] animate-bounce"
//               style={{ animationDelay: "0.15s" }}
//             ></span>

//             <span
//               className="w-2.5 h-2.5 rounded-full bg-[#D9C5B5] animate-bounce"
//               style={{ animationDelay: "0.3s" }}
//             ></span>
//           </div>

//         </div>
//       </div>
//     );
//   }

//   if (status === "failed")
//   {
//     return (
//       <div
//         className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black text-red-400" : "bg-gray-50 text-[#EFE5C8]"}`}
//       >
//         <div className="text-xl">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Helmet>
//         <title>Digital Marketing Blog | Atla Inteligent</title>
//         <meta
//           name="description"
//           content="Read blogs on SEO, digital marketing, website trends, AI & business growth strategies."
//         />
//         <meta
//           name="keywords"
//           content="Digital Marketing Blog	SEO Blog, Marketing Tips"
//         />
//       </Helmet>
//       <div
//         className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"} font-sans`}
//       >

//         {successMessage && (
//           <div className="fixed top-24 right-6 z-[9999] animate-in slide-in-from-right duration-300">
//             <div
//               className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3
//       ${isDark
//                   ? "bg-[#3D220E]/95 border-[#8B6B4A]/40 text-white shadow-[#3D220E]/40"
//                   : "bg-white border-[#E8D9C2] text-[#3D220E] shadow-[#8B6B4A]/20"
//                 }`}
//             >
//               <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
//                 ✓
//               </div>

//               <div>
//                 <p className="font-semibold text-[15px]">
//                   Comment Posted
//                 </p>
//                 <p className="text-sm opacity-80">
//                   Your comment has been published successfully.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {errorMessage && (
//           <div className="fixed top-24 right-6 z-[9999] animate-in slide-in-from-right duration-300">
//             <div
//               className={`px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3
//       ${isDark
//                   ? "bg-red-900/95 border-red-500/40 text-white shadow-red-900/40"
//                   : "bg-white border-red-200 text-red-700 shadow-red-200/50"
//                 }`}
//             >
//               <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
//                 ✕
//               </div>

//               <div>
//                 <p className="font-semibold text-[15px]">Verification Failed</p>
//                 <p className="text-sm opacity-80">{errorMessage}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Header with Category Filters */}
//         <header
//           className={`border-b sticky top-0 z-10 backdrop-blur-md ${isDark ? "border-gray-800 bg-black/90" : "border-gray-200 bg-white/90"}`}
//         >
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//             <div className="flex flex-wrap gap-3 justify-center md:justify-start">
//               {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => dispatch(setActiveCategory(cat))}
//                   className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${activeCategory === cat
//                     ? "bg-[#8B6B4A] text-white shadow-lg shadow-[#8B6B4A]/40"
//                     : isDark
//                       ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-[#8B6B4A]/50 hover:text-[#d9c5b5]"
//                       : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-[#F5EDE4] hover:border-[#8B6B4A] hover:text-[#3D220E]"
//                     }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           {filteredPosts.length === 0 ? (
//             <div
//               className={`text-center py-24 text-2xl ${isDark ? "text-gray-400" : "text-gray-600"
//                 }`}
//             >
//               No posts found in{" "}
//               <span
//                 className={`${isDark ? "text-[#C9A27A]" : "text-[#8B6B4A]"
//                   } font-semibold`}
//               >
//                 "{activeCategory}"
//               </span>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-12">
//                 {currentPosts.map((post) =>
//                 {
//                   const hasLiked = Boolean(
//                     updatedPosts[post._id]?.liked ?? post.liked ?? userLikes.has(post._id)
//                   );
//                   const isViewLoading = viewLoadingIds.has(post._id);

//                   return (
//                     <div
//                       key={post._id}
//                       className={`group flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1
//                       ${isDark
//                           ? "bg-gray-900/70 border-gray-800 hover:border-[#8B6B4A]/60"
//                           : "bg-white border-gray-200 hover:border-[#8B6B4A]/60"}`}
//                     >
//                       {/* Image */}
//                       <div className="h-52 relative overflow-hidden">
//                         {post.images?.[0] ? (
//                           <img
//                             src={post.images[0]}
//                             alt={post.name}
//                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                           />
//                         ) : (
//                           <div
//                             className={`absolute inset-0 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
//                           >
//                             <span
//                               className={
//                                 isDark ? "text-gray-600" : "text-gray-400"
//                               }
//                             >
//                               No Image
//                             </span>
//                           </div>
//                         )}
//                       </div>

//                       {/* Content */}
//                       <div className="p-6 flex flex-col flex-grow">
//                         <span
//                           className={`inline-block px-3 py-1 mb-3 text-xs rounded-full w-fit ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"}`}
//                         >
//                           {post.category?.name || "Uncategorized"}
//                         </span>

//                         <h2
//                           className={`text-xl font-bold mb-2 line-clamp-2 group-hover:text-[#8B6B4A] transition-colors ${isDark ? "text-white" : "text-gray-900"}`}
//                         >
//                           {post.name || "Untitled"}
//                         </h2>

//                         <p
//                           className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
//                         >
//                           By{" "}
//                           <span
//                             className={
//                               isDark ? "text-gray-200" : "text-gray-800"
//                             }
//                           >
//                             {post.author || "Anonymous"}
//                           </span>
//                         </p>

//                         <div
//                           className={`text-sm mb-6 line-clamp-3 flex-grow ${isDark ? "text-gray-400" : "text-gray-600"}`}
//                           dangerouslySetInnerHTML={{
//                             __html: DOMPurify.sanitize(
//                               post.description || post.excerpt || "",
//                             ),
//                           }}
//                         />

//                         {/* Stats & Read More */}
//                         <div className="mt-auto pt-4 flex justify-between items-center">
//                           <div
//                             className={`flex items-center gap-5 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
//                           >
//                             <div className="flex items-center gap-1">
//                               <Eye className="w-5 h-5" /> {post.views || 0}
//                             </div>
//                             <div
//                               className={`flex items-center gap-1 cursor-pointer transition-colors ${hasLiked ? "text-[#8B6B4A]" : "hover:text-[#8B6B4A]"}`}
//                               onClick={() => handleAction("like", post)}
//                             >
//                               <Heart
//                                 className={`w-5 h-5 transition-all ${hasLiked ? "text-[#8B6B4A]" : ""
//                                   }`}
//                                 fill={hasLiked ? "#8B6B4A" : "none"}
//                               />{" "}
//                               {updatedPosts[post._id]?.likes ?? post.likes ?? 0}
//                             </div>
//                             <div
//                               className="flex items-center gap-1 cursor-pointer hover:text-[#8B6B4A] transition-colors"
//                               onClick={() => handleAction("comment", post)}
//                             >
//                               <MessageCircle className="w-5 h-5" />{" "}
//                               {updatedPosts[post._id]?.comments?.length ??
//                                 post.comments?.length ??
//                                 post.commentsCount ??
//                                 post.totalComments ??
//                                 0}
//                             </div>
//                           </div>

//                           <button
//                             onClick={() => handleAction("read", post)}
//                             disabled={isViewLoading}
//                             className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 hover:translate-x-1
//   ${isDark
//                                 ? "bg-[#9d6231]/20 border border-[#9d6231]/40 text-[#d9c5b5] hover:bg-[#9d6231]/30 hover:border-[#9d6231]"
//                                 : "bg-[#f5ede4] border border-[#9d6231]/30 text-[#9d6231] hover:bg-[#ead8c6] hover:border-[#9d6231] hover:text-[#3d220e]"
//                               }
//   ${isViewLoading ? "opacity-70 cursor-wait" : ""}`}
//                           >
//                             {isViewLoading ? "Opening..." : "Read More →"}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex flex-col items-center gap-4 mt-8">
//                   <nav className="flex items-center gap-2">
//                     <button
//                       onClick={() => goToPage(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${currentPage === 1
//                         ? isDark
//                           ? "bg-gray-800 text-gray-500 cursor-not-allowed"
//                           : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : isDark
//                           ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
//                           : "bg-gray-100 hover:bg-gray-200 border-gray-300"
//                         }`}
//                     >
//                       ← Previous
//                     </button>

//                     {getPageNumbers().map((page, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() =>
//                           typeof page === "number" && goToPage(page)
//                         }
//                         disabled={page === "..."}
//                         className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === "..."
//                           ? isDark
//                             ? "text-gray-500"
//                             : "text-gray-400"
//                           : page === currentPage
//                             ? "bg-[#8B6B4A] text-white shadow-lg shadow-[#8B6B4A]/40"
//                             : isDark
//                               ? "bg-gray-800 hover:bg-[#3D2A1E] border border-gray-700 hover:border-[#8B6B4A]/50 hover:text-[#D9C5B5]"
//                               : "bg-gray-100 hover:bg-[#F5EDE4] border border-gray-300 hover:border-[#8B6B4A] hover:text-[#3D220E]"
//                           }`}
//                       >
//                         {page}
//                       </button>
//                     ))}

//                     <button
//                       onClick={() => goToPage(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${currentPage === totalPages
//                         ? isDark
//                           ? "bg-gray-800 text-gray-500 cursor-not-allowed"
//                           : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : isDark
//                           ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
//                           : "bg-gray-100 hover:bg-gray-200 border-gray-300"
//                         }`}
//                     >
//                       Next →
//                     </button>
//                   </nav>

//                   <div
//                     className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
//                   >
//                     Page {currentPage} of {totalPages} • {totalPosts} posts
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </main>

//         {/* Comment Modal */}

//         {showCommentModal && (
//           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//             <div
//               className={`max-w-lg w-full rounded-xl p-8 border shadow-2xl ${isDark
//                 ? "bg-[#111827] border-[#8B6B4A]/30 shadow-black/70"
//                 : "bg-[#FCFAF8] border-[#E8D9C2] shadow-[#E8D9C2]/50"
//                 }`}
//             >
//               <div className="flex justify-between items-center mb-5">
//                 <h2
//                   className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#3D220E]"
//                     }`}
//                 >Write a Comment</h2>
//                 <button
//                   onClick={() => setShowCommentModal(false)}
//                   className={`p-2 rounded-full transition ${isDark
//                     ? "hover:bg-[#3D220E]/40 text-gray-300"
//                     : "hover:bg-[#F5EDE4] text-[#8B6B4A]"
//                     }`}
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <textarea
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 placeholder="What are your thoughts?"
//                 rows={5}
//                 className={`w-full p-4 rounded-2xl border resize-y min-h-[140px]
// transition-all duration-300
// focus:outline-none focus:ring-2 focus:ring-[#8B6B4A]
// ${isDark
//                     ? "bg-gray-800 border-gray-700 text-white focus:border-[#8B6B4A]"
//                     : "bg-white border-[#E8D9C2] text-[#3D220E] focus:border-[#8B6B4A]"
//                   }`}
//               />
//               <div className="flex gap-3 mt-5">
//                 <button
//                   onClick={() => setShowCommentModal(false)}
//                   className={`flex-1 py-3 rounded-xl font-semibold border transition-all duration-300
// ${isDark
//                       ? "border-[#8B6B4A]/30 text-gray-300 hover:bg-[#3D220E]/40 hover:border-[#8B6B4A]"
//                       : "border-[#E8D9C2] text-[#8B6B4A] hover:bg-[#F5EDE4] hover:border-[#8B6B4A]"
//                     }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={submitComment}
//                   disabled={loading || !commentText.trim()}
//                   className={`flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center transition-all duration-300
// ${commentText.trim()
//                       ? "bg-[#8B6B4A] hover:bg-[#6E4E35]"
//                       : "bg-gray-400 cursor-not-allowed"
//                     }`}
//                 >
//                   {loading ? (
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                   ) : (
//                     "Post Comment"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}



//         {/* Verification Modal */}
//         {showVerifyModal && (
//           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//             <div
//               className={`max-w-md w-full rounded-2xl p-8 ${isDark ? "bg-gray-900" : "bg-white"} shadow-2xl`}
//             >
//               <h2 className="text-2xl font-bold mb-6 text-center">
//                 {step === "form" ? "Verify Yourself" : "Enter OTP"}
//               </h2>

//               {step === "form" ? (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Full Name"
//                     value={userInfo.name}
//                     onChange={(e) =>
//                       setUserInfo({ ...userInfo, name: e.target.value })
//                     }
//                     className={`w-full p-3 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
//                   />
//                   <input
//                     type="email"
//                     placeholder="Email Address"
//                     value={userInfo.email}
//                     onChange={(e) =>
//                       setUserInfo({ ...userInfo, email: e.target.value })
//                     }
//                     className={`w-full p-3 rounded-lg mb-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
//                   />
//                   <input
//                     type="tel"
//                     placeholder="Phone Number"
//                     value={userInfo.phone}
//                     onChange={(e) =>
//                       setUserInfo({ ...userInfo, phone: e.target.value })
//                     }
//                     className={`w-full p-3 rounded-lg mb-6 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"}`}
//                   />

//                   <button
//                     onClick={sendOtp}
//                     disabled={loading}
//                     className="w-full bg-[#8B6B4A] hover:bg-[#7A5D42] py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-70"
//                   >
//                     {loading ? "Sending OTP..." : "Send OTP"}
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-center mb-6 text-sm opacity-75">
//                     OTP sent to <strong>{userInfo.email}</strong>
//                   </p>
//                   <input
//                     type="text"
//                     placeholder="Enter 6-digit OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     maxLength={6}
//                     className={`w-full p-4 text-center text-2xl tracking-widest rounded-lg border mb-6 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
//                   />
//                   <button
//                     onClick={verifyOtp}
//                     className="w-full bg-[#8B6B4A] hover:bg-[#7A5D42] py-3 rounded-lg text-white font-medium transition-colors"
//                   >
//                     Verify OTP
//                   </button>
//                 </>
//               )}

//               <button
//                 onClick={() => setShowVerifyModal(false)}
//                 className="mt-6 text-sm text-gray-500 underline block mx-auto"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Blog;




