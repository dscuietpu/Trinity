const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  updateIssueStatus,
  increaseFalseReportCount,
} = require("../controllers/moderationController");

const router = express.Router();

router.patch(
  "/issues/:id/status",
  authMiddleware,
  roleMiddleware("authority", "admin"),
  updateIssueStatus,
);

router.patch(
  "/users/:id/false-report-count",
  authMiddleware,
  roleMiddleware("authority", "admin"),
  increaseFalseReportCount,
);

module.exports = router;
