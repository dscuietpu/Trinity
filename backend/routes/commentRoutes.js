const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createComment,
  reactToComment,
  getCommentsByIssue,
} = require("../controllers/commentController");

const router = express.Router();

router.post("/", authMiddleware, createComment);
router.post("/:commentId/reactions", authMiddleware, reactToComment);
router.get("/:issueId", getCommentsByIssue);

module.exports = router;
