const router = require("express").Router();
const {
  createContent,
  getHomeData,
  getSingleContent,
  deletedContent,
  updateHomeData,

  // Engagement Routes
  incrementView,
  toggleLike,
  sendOtp,
  verifyOtp,
  addComment,
  getAdminProducts,
} = require("../../controller/Homecontroller/homecontroller");
const {
  getPaginatedBlogPosts,
} = require("../../controller/Homecontroller/blogPaginationController");
const {
  getAdminProductComments,
  deleteAdminComment,
} = require("../../controller/Homecontroller/adminCommentController");

// ==================== MAIN BLOG ROUTES ====================

router.post("/create", createContent); // Create new post
router.get("/product", (req, res, next) => {
  if (
    req.query.page !== undefined ||
    req.query.limit !== undefined
  ) {
    return getPaginatedBlogPosts(req, res, next);
  }

  return getHomeData(req, res, next);
}); // Get all posts or a paginated subset
router.get("/product/alladminproducts", getAdminProducts); // Get all products for admin (includes unpublished/drafts)
router.get("/product/:id/admin-comments", getAdminProductComments); // Get admin comment view for a product
router.delete(
  "/product/:productId/admin-comment/:commentId",
  deleteAdminComment,
); // Admin delete single comment
router.get("/product/:slug", getSingleContent); // Get single post by slug (used in frontend) - must come after specific routes
router.put("/product/:id", updateHomeData); // Update post
router.delete("/product/:id", deletedContent); // Delete post

// ==================== ENGAGEMENT ROUTES (Frontend Ready) ====================

router.put("/product/:id/view", incrementView); // Increment views
router.put("/product/:id/like", toggleLike); // Like / Unlike
// Comment with OTP flow
router.post("/product/:id/send-otp", sendOtp); // Send OTP
router.post("/product/:id/verify-otp", verifyOtp); // Verify OTP
router.post("/product/:id/comment", addComment); // Add comment after verification
module.exports = router;
