const express = require("express");
const {
  createIssue,
  getIssues,
  getIssueById,
  upvoteIssue,
  deleteIssue,
  resolveIssueByUser,
} = require("../controllers/issueController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createIssue,
);
router.get("/", getIssues);
router.get("/:id", getIssueById);
router.post("/:id/upvote", authMiddleware, upvoteIssue);
router.patch("/:id/resolve", authMiddleware, resolveIssueByUser);
router.delete("/:id", authMiddleware, deleteIssue);

module.exports = router;
