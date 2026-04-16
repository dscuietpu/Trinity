const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  getUnreadCount,
  markNotificationSeen,
  markAllSeen,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.patch("/:id/seen", authMiddleware, markNotificationSeen);
router.patch("/mark-all-seen", authMiddleware, markAllSeen);

module.exports = router;
