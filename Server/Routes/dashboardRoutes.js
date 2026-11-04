const router = require("express").Router();
const { getDashboardAnalytics } = require("../controller/dashboardController");

router.get("/analytics", getDashboardAnalytics);

module.exports = router;
