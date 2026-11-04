const router = require("express").Router();
const {
  getDashboardAnalytics,
  getMetricRecords,
} = require("../controller/dashboardController");
const requireAuth = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/analytics", getDashboardAnalytics);
router.get("/metrics/:metricKey/records", requireAuth, requireAdmin, getMetricRecords);

module.exports = router;
