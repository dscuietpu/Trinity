const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getCommunityMessages,
  createCommunityMessage,
  reactToMessage,
} = require("../controllers/messageController");

const router = express.Router();

router.get("/communities/:communityId/messages", authMiddleware, getCommunityMessages);
router.post(
  "/communities/:communityId/messages",
  authMiddleware,
  upload.single("media"),
  createCommunityMessage,
);
router.post("/messages/:messageId/reactions", authMiddleware, reactToMessage);

module.exports = router;
